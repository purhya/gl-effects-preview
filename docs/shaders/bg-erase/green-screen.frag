#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

in vec2 fTextureCoord;	// 采样坐标.
out vec4 fragColor;		// 输出的颜色.

uniform vec2      iResolution;		// 输出图像的尺寸, 即画布尺寸.
uniform sampler2D iChannel[1];		// 输入待调色的图片对应的纹理.
uniform float     tolerance;		// 和背景色 hsv 空间距离的容差.
uniform vec3      backgroundColor;	// 扣除的背景色.
uniform int       kernalRadius;		// 卷积的半径, 应当设置为边缘绿色渗透的像素数目.

/*
将 RGB 转为 HSV, 其中 h 值为 0~6, 其他值为 0~1.
相比 HSL, HSV 对于颜色的 "纯度" 的度量更加精确.
*/
vec3 RGB2HSV(vec3 color) {
	float r = color.r;
	float g = color.g;
	float b = color.b;

	float minOfRGB = min(min(r, g), b);
	float maxOfRGB = max(max(r, g), b);
	float diff = maxOfRGB - minOfRGB;
	float v = maxOfRGB;

	float s = maxOfRGB == 0.0 ? 0.0 : diff / maxOfRGB;
	float h = 0.0;

	if (s == 0.0) {}
	else if (r == maxOfRGB) {
		h = mod((g - b) / diff + 6.0, 6.0);
	}
	else if (g == maxOfRGB) {
		h = (b - r) / diff + 2.0;
	}
	else if (b == maxOfRGB) {
		h = (r - g) / diff + 4.0;
	}

	return vec3(h, s, v);
}

vec4 getFragColor() {
	// 分别设置 HSV 分量的权重.
	// S 权重高是希望能将一些本身呈现淡绿色的地方和背景区分开.
	// V 权重低是因为经常出现绿幕的不同位置明暗度不同.
	vec3 hsvPriority = vec3(1.0, 2.0, 0.5);

	// 我们在使用 Photoshop 移除一个颜色时, 它在移除一个颜色的同时, 也会在过渡边缘移除一部分此颜色.
	// 当一个像素的相邻像素为绿色时, 在抹除这个相邻绿色的同时, 也应当顺便抹除当前像素的一部分绿色.
	// 所以我们在进行卷积时, 不计算颜色值卷积的绿色程度, 而是计算绿色程度的卷积.
	vec3 greenHSV = RGB2HSV(backgroundColor);

	// 当前像素位置的颜色.
	vec4 color = texture(iChannel[0], fTextureCoord);

	// 代表了像素位置的绿色的大致比例.
	float totalGreenAlpha = 0.0;

	// 代表了附近的最远离绿色的颜色.
	// 虽然它的名称叫做前景色, 但是注意它仍可能非常绿.
	// 它将会用于对绿色部分的比例进行修正, 以防止剪除少了仍呈现绿色, 或者剪除多了呈现紫红色.
	vec4 fgColor = vec4(0);
	float fgDistance = 0.0;

	/** 进行 kernal 采样, 以决定大致的绿色部分. */
    for (int i = -kernalRadius; i <= kernalRadius; i++) {
 		for (int j = -kernalRadius; j <= kernalRadius; j++) {
			vec4 dColor = texture(iChannel[0], fTextureCoord + vec2(i, j) / iResolution);
			vec3 dColorHSV = RGB2HSV(dColor.rgb);

			float distanceToGreen = length(hsvPriority * (dColorHSV - greenHSV));
			float greenRate = 1.0 - smoothstep(tolerance * 1.0, tolerance * 1.25, distanceToGreen);

			if (fgDistance < distanceToGreen) {
				fgColor = dColor;
				fgDistance = distanceToGreen;
			}

			totalGreenAlpha += greenRate;
		}
	}

	float avgGreenAlpha = totalGreenAlpha / pow(float(kernalRadius * 2 + 1), 2.0);
	vec4 avgGreenColor = vec4(backgroundColor, 1) * avgGreenAlpha;

	// 略微调整绿色的比例, 以让剪除后颜色接近 frontColor.

	// 算法 1:
	// 即希望计算一个 t1, 使得 C + t1B 和 F 的夹角尽量小.
	// C + t1B 构成的解析方程是一条直线 L1,
	// F 同样可以表示为直线 L2 = 0 + t2F.
	// 所以问题转化为两个直线的最短距离的问题.
	// 两个直线上的点的组成的向量可以表示为: D = C + t1B - t2F,
	// D^2 展开再分别对 t1 和 t2 求偏导数, 取值为 0,
	// 得到一组矩阵方程:
	// t1 * B^2 - t2 * B·F = -C·B
	// t1 * B·F - t2 * F^2 = -C·F

	// 算法 2:
	// 我们希望通过 F 和 B 拟合为一个向量, 这个向量和 C 的夹角尽量小.
	// F 和 B 构成一个平面, 所求的向量即为 C 在 FB 平面的投影.
	// 于是可以直接计算 F 和 B 的叉积, 然后从 C 移除叉积方向的投影得到 C',
	// 然后获得 C 在 FB 平面的投影.
	// 接着对于 aF + bB = C', 计算 a, b.
	// 不过这里有个问题, 这是一个二参数三方程, 排除一个的话可能会造成解不唯一.
	// 所以可以以 FBZ 建立坐标系, 把 C 转到这个坐标系, 其 xy 分量即为 ab 值.

	// 这里实现的是算法 2.
	vec3 C = color.rgb;
	vec3 F = fgColor.rgb;
	vec3 B = avgGreenColor.rgb;
	vec3 Z = cross(F, B);
	mat3 M = mat3(F, B, Z);
	float b = determinant(M) == 0.0 ? 0.0 : (inverse(M) * C).y;

	// 这里有个问题, 求出的 a, b 有可能绝对值很大, 这是因为 C 不和 FB 构成的平行四边形相交.
	b = clamp(b, 0.0, 1.0);

	// fgColor 的颜色贴近最远离绿色的那个颜色, 所以它并不稳定, 有可能正好就是绿色.
	// 所以通过剪除绿色的颜色的透明度再进行一次蒙版处理.
	// 在开始我们计算一个卷积范围内最接近绿色的颜色作为背景色来代替这里的 avgGreenColor,
	// 但是这样造成局部只要有一个很绿的像素就全部扣除的问题.
	vec4 frontColor = color - avgGreenColor * b;
	float eraseMask = color.a - avgGreenColor.a;

	return frontColor * eraseMask;
}

void main() {
	fragColor = getFragColor(); 
}
