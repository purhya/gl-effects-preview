#include ../includes/header.frag
#import rotateFromAngle from ../../libs/vector.glsl
#import rotationMatrixFromAngle from ../../libs/matrix.glsl

uniform float maxPixelSizeRate;	// 像素达到最大时相对于宽高较大值的比率.
uniform float rotatedAngle;		// 基础向量旋转的角度.

vec2 origin = vec2(0.5, 0.5);			// 原点坐标.
vec2 baseV1 = vec2(0.86602540, 0.5);	// e^πi/6
vec2 baseV2 = vec2(0.86602540, -0.5);	// e^-πi/6


// 这个函数通过 (0, 0), (0.5, 1), (1, 0).
float getPixelSizeRate(float x) {
	return 1.0 - pow(abs(2.0 * (x - 0.5)), 1.0);
}

// 包含了当前的六边形中心点以及最近的另一个中心点坐标.
// distanceDiff 代表了从当前点到 current 和 closest 两个中心点的距离的差. 负值时代表离 current 更近.
struct HexagonCenter {
	vec2 current;
	vec2 closest;
	float distanceDiff;
};

// 求出向量最近的 6 边形中心点.
HexagonCenter getHexagonCenter(vec2 v, float pixelSize) {
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

	// 计算最近的那个顶点, 以及次最近的顶点.
	// 由于不支持动态索引, 所以这个目前只能枚举.
	float minD = min(d1, min(d2, min(d3, d4)));
	float secMinD = max(d1, max(d2, max(d3, d4)));

	if (d1 > minD && d1 < secMinD) {
		secMinD = d1;
	}
	if (d2 > minD && d2 < secMinD) {
		secMinD = d2;
	}
	if (d3 > minD && d3 < secMinD) {
		secMinD = d3;
	}
	if (d4 > minD && d4 < secMinD) {
		secMinD = d4;
	}

	vec2 current;
	vec2 closest;

	if (d1 == minD) {
		current = p1;
	}
	else if (d2 == minD) {
		current = p2;
	}
	else if (d3 == minD) {
		current = p3;
	}
	else if (d4 == minD) {
		current = p4;
	}

	if (d1 == secMinD) {
		closest = p1;
	}
	else if (d2 == secMinD) {
		closest = p2;
	}
	else if (d3 == secMinD) {
		closest = p3;
	}
	else if (d4 == secMinD) {
		closest = p4;
	}

	float distanceDiff = distance(v, current) - distance(v, closest);

	return HexagonCenter(current, closest, distanceDiff);
}

// 获得指定的中点坐标位置对应的六边形颜色.
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
	HexagonCenter hexagonCenter = getHexagonCenter(v, pixelSize);
	vec2 current = pixelSize == 1.0 ? v : hexagonCenter.current;
	vec2 closest = pixelSize == 1.0 ? v : hexagonCenter.closest;
	float distanceDiff = hexagonCenter.distanceDiff;

	// 获得当前六边形颜色以及最近的那个六边形颜色.
	vec4 color = getPixelColor(originInPx + current, pixelSize);
	vec4 closestColor = getPixelColor(originInPx + closest, pixelSize);

	// 在 distanceDiff 处于 0 附近的 1px 范围做平滑滤波.
	// 在 distanceDiff 为负值时距离 current 更近, rateOfClosest 此时为 0.
	float rateOfClosest = smoothstep(-0.5, 0.5, distanceDiff);

	return mix(color, closestColor, rateOfClosest);

}

void main() { 
	fragColor = getFragColor();
}
