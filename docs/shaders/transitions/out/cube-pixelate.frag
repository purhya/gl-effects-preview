#version 300 es

#ifdef GL_ES 
precision mediump float;
#define GLSLIFY 1
#define GLSLIFY 1 
#endif

#define PI 3.1415926

uniform float     iProgress;
uniform vec2      iResolution;
uniform sampler2D iChannel[2];

in  vec2 fTextureCoord;
out vec4 fragColor;
/** 将向量旋转指定的弧度. */
vec2 rotate(vec2 v, float rad) {
	float sinValue = sin(rad);
	float cosValue = cos(rad);

	mat2 rotateMatrix = mat2(
		 cosValue, sinValue,
		-sinValue, cosValue
	);

	return rotateMatrix * v;
}

/** 将向量旋转指定的角度. */
vec2 rotateFromAngle(vec2 v, float angle) {
	return rotate(v, radians(angle));
}

/** 将弧度的旋转表示为向量. */
vec2 vectorFromRadians(float rad) {
	float sinValue = sin(rad);
	float cosValue = cos(rad);

	return vec2(cosValue, sinValue);
}

/** 将角度的旋转表示为向量. */
vec2 vectorFromAngle(float angle) {
	return vectorFromRadians(radians(angle));
}

/** 返回旋转指定弧度对应的变换矩阵. */
mat2 rotationMatrix(float rad) {
	float sinValue = sin(rad);
	float cosValue = cos(rad);

	return mat2(
		 cosValue, sinValue,
		-sinValue, cosValue
	);
}

/** 返回旋转指定角度对应的变换矩阵. */
mat2 rotationMatrixFromAngle(float angle) {
	return rotationMatrix(radians(angle));
}

uniform float maxPixelSizeRate;	// 像素达到最大时相对于宽高较大值的比率.
uniform float rotatedAngle;		// 基础向量旋转的角度.
uniform bool glassMode;			// 玻璃模式, 不对 diff 做相对基础向量的处理, 从而在倾斜时, 会产生 8 边形的类似于玻璃效果.

vec2 origin = vec2(0.5, 0.5);	// 原点坐标.
vec2 baseV1 = vec2(1.0, 0.0);	// e^0i
vec2 baseV2 = vec2(0.0, 1.0);	// e^πi/4

// 这个函数通过 (0, 0), (0.5, 1), (1, 0).
float getPixelSizeRate(float x) {
	return 1.0 - pow(abs(2.0 * (x - 0.5)), 1.0);
}

// 包含了当前的方形中心点以及最近的另一个中心点坐标.
// diff 代表了从 current 到当前点在两个基础向量方向的偏移长度, -0.5 * pixelSize ~ 0.5 * pixelSize.
struct CubeCenter {
	vec2 current;
	vec2 closest;
	vec2 diff;
};

// 求出方形中心点最近的一个中心点.
vec2 getClosestCenterInGlassMode(vec2 v, vec2 current, float pixelSize) {
	vec2 diff = v - current;
	vec2 signV;

	if (abs(diff.x) > abs(diff.y)) {
		signV.x = sign(diff.x);
	}
	else {
		signV.y = sign(diff.y);
	}

	return current + signV * pixelSize;
}

// 求出向量最近的方形的中心点.
CubeCenter getCubeCenter(vec2 v, float pixelSize) {
	// 根据旋转角度和 pixelSize 构建两个基础向量.
	vec2 v1 = rotateFromAngle(baseV1, rotatedAngle) * pixelSize;
	vec2 v2 = rotateFromAngle(baseV2, rotatedAngle) * pixelSize;

	// 将向量 v 分解为 av1 + bv2 的形式.
	// 使用矩阵运算求出 a, b.
	vec2 ab = inverse(mat2(v1, v2)) * v;
	vec2 roundAB = round(ab);
	vec2 signV;

	// 首先确定在两个基础向量方向上的哪一方偏差大.
	if (abs(ab.x - roundAB.x) > abs(ab.y - roundAB.y)) {
		signV.x = sign(ab.x - roundAB.x);
	}
	else {
		signV.y = sign(ab.y - roundAB.y);
	}

	vec2 closestAB = roundAB + signV;
	vec2 current = roundAB.x * v1 + roundAB.y * v2;
	vec2 closest = closestAB.x * v1 + closestAB.y * v2;
	vec2 diff = (ab - roundAB) * pixelSize;

	if (glassMode) {
		closest = getClosestCenterInGlassMode(v, current, pixelSize);
		diff = v - current;
	}

	return CubeCenter(current, closest, diff);
}

// 获得指定的中点坐标位置对应的方形颜色.
vec4 getPixelColor(vec2 coord, float pixelSize) {
	// 将整数化处理的中心坐标转为纹理坐标.
	vec2 centerTextureCoord = coord / iResolution;

	// 将像素格转为采样时的像素格, 然后以其为梯度进行梯度采样.
	vec2 texturePixelSize = vec2(pixelSize, pixelSize) / iResolution;
	
	// 这是一个在纹理采样的方向和片元处理的方向完全对应时的梯度采样矩阵.
	// 然后我们将其通过旋转生成最终的梯度采样矩阵.
	mat2 gradientMatrix = mat2(texturePixelSize.x, 0.0, 0.0, texturePixelSize.y);
	gradientMatrix = rotationMatrixFromAngle(rotatedAngle) * gradientMatrix;

	vec4 color1 = textureGrad(iChannel[0], centerTextureCoord, gradientMatrix[0], gradientMatrix[1]);
	vec4 color2 = textureGrad(iChannel[1], centerTextureCoord, gradientMatrix[0], gradientMatrix[1]);

	// 在中间的 20% 进行过渡.
	float newRate = smoothstep(0.4, 0.6, iProgress);

	return mix(color1, color2, newRate);
}

vec4 getFragColor() {
	// 获得当前 progress 下像素的大小.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float maxPixelSize = maxPixelSizeRate * maxOfWH;
	float pixelSize = getPixelSizeRate(iProgress) * maxPixelSize + 1.0;

	// 获得相对于原点的向量.
	vec2 originInPx = origin * iResolution;
	vec2 v = fTextureCoord * iResolution - originInPx;

	// 将该向量的 x, y 相对于 pixelSize 进行整数化, 得到了所在像素格的中点位置.
	// 其中 pixelSize = 1 时, 必须保持显示为原图, 所以不进行像素化.
	CubeCenter cubeCenter = getCubeCenter(v, pixelSize);
	vec2 current = pixelSize == 1.0 ? v : cubeCenter.current;
	vec2 closest = pixelSize == 1.0 ? v : cubeCenter.closest;
	vec2 diff = cubeCenter.diff;

	// 获得当前方形颜色以及最近的那个方形颜色.
	vec4 color = getPixelColor(originInPx + current, pixelSize);
	vec4 closestColor = getPixelColor(originInPx + closest, pixelSize);

	// 在 diff 的绝对值的较大值处于 0.5 * pixelSize 附近, 1px 范围做平滑滤波.
	float maxDiff = max(abs(diff.x), abs(diff.y));
	float rateOfClosest = smoothstep(0.5 * pixelSize - 0.5, 0.5 * pixelSize + 0.5, maxDiff);

	return mix(color, closestColor, rateOfClosest);
}

void main() { 
	fragColor = getFragColor();
}
