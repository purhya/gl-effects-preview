#include ../includes/header.frag
#import rotateFromAngle from ../../libs/vector.glsl

uniform float maxPixelSizeRate;	// 像素达到最大时相对于宽高较大值的比率.
uniform float rotatedAngle;		// 基础向量旋转的角度.

vec2 origin = vec2(0.5, 0.5);			// 原点坐标.
vec2 baseV1 = vec2(0.86602540, 0.5);	// e^πi/6
vec2 baseV2 = vec2(0.86602540, -0.5);	// e^-πi/6


// 这个函数通过 (0, 0), (0.5, 1), (1, 0).
float getPixelSizeRate(float x) {
	return 1.0 - pow(abs(2.0 * (x - 0.5)), 1.0);
}

// 求出向量最近的 6 边形中心点.
vec2 getHexagonCenter(vec2 v, float pixelSize) {
	vec2 v1 = rotateFromAngle(baseV1, rotatedAngle) * pixelSize;
	vec2 v2 = rotateFromAngle(baseV2, rotatedAngle) * pixelSize;

	// 将向量 v 分解为 av1 + bv2 的形式.
	// 使用矩阵运算求出 a, b.
	vec2 ab = inverse(mat2(v1, v2)) * v;
	float a = ab.x;
	float b = ab.y;

	// 求出向量附近的 4 个顶点.
	vec2 p1 = floor(a) * v1 + floor(b) * v2;
	vec2 p2 = floor(a) * v1 + ceil(b)  * v2;
	vec2 p3 = ceil(a)  * v1 + floor(b) * v2;
	vec2 p4 = ceil(a)  * v1 + ceil(b)  * v2;

	// 求出到每个顶点的距离.
	float d1 = distance(p1, v);
	float d2 = distance(p2, v);
	float d3 = distance(p3, v);
	float d4 = distance(p4, v);

	// 计算最近的那个顶点.
	// 由于不支持动态索引, 所以目前只能枚举.
	float minD = min(d1, min(d2, min(d3, d4)));

	if (d1 == minD) {
		return p1;
	}
	else if (d2 == minD) {
		return p2;
	}
	else if (d3 == minD) {
		return p3;
	}
	else if (d4 == minD) {
		return p4;
	}
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
	vec2 roundV = pixelSize == 1.0 ? v : getHexagonCenter(v, pixelSize);

	// 将整数化处理的中心坐标转为纹理坐标.
	vec2 centerTextureCoord = (originInPx + roundV) / iResolution;

	vec4 color1 = texture(iChannel[0], centerTextureCoord);
	vec4 color2 = texture(iChannel[1], centerTextureCoord);

	// 在中间的 20% 进行过渡.
	float newRate = smoothstep(0.4, 0.6, iProgress);

	return mix(color1, color2, newRate);
}

void main() { 
	fragColor = getFragColor();
}
