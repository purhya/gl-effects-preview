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
/** 在区间上进行线性过渡, 区间左侧返回 1, 右侧返回 0. */
float linearstep(float min, float max, float value) {
	return clamp((value - min) / (max - min), 0.0, 1.0);
}

/** 
 * 类似于 `smoothstep`, 不过它用于一个范围的边界处插值, 在范围内返回 1, 范围外返回 1.
 * 边界处的插值区间由 `smoothRange` 决定.
 */
float rangestep(float minValue, float maxValue, float smoothRange, float value) {
	float valueToCenter = abs(value - (minValue + maxValue) / 2.0);
	float edgeValue = (maxValue - minValue) / 2.0;

	// 这一步非常重要, 如果区间范围小于平滑范围, 将平滑范围设置为区间范围.
	float halfRange = min(edgeValue, smoothRange / 2.0);

	return 1.0 - smoothstep(edgeValue - halfRange, edgeValue + halfRange, valueToCenter);
}

uniform float cellSizeRate;		// 网格单元相对于宽高较大值的比率.
uniform bool beZoomOut;			// 如果是 true, 原图的单元格缩小直到消失, 否则新图的单元格变大直到占满.
uniform vec2 cellZoomOrigin;	// 网格单元格的缩放变化的起点在单元格内的相对坐标, 默认为 (0.5, 0.5), 范围为 0~1.

// 自然基底向量,也可以用一个 mat2 表示, 不过用向量可能自然一些.
vec2 origin = vec2(0.5, 0.5);
vec2 baseV1 = vec2(1.0, 0.0);	// e^0i
vec2 baseV2 = vec2(0.0, 1.0);	// e^πi/4

// 求出向量最近的单元格的中心点.
vec2 getCellCenter(vec2 v, float cellSize) {
	// 根据旋转角度和 cellSize 构建两个基础向量.
	vec2 v1 = baseV1 * cellSize;
	vec2 v2 = baseV2 * cellSize;

	// 将向量 v 分解为 av1 + bv2 的形式.
	// 使用矩阵运算求出 a, b.
	vec2 ab = inverse(mat2(v1, v2)) * v;
	vec2 roundAB = round(ab);

	return roundAB.x * v1 + roundAB.y * v2;
}

vec4 getFragColor() {
	vec2 coord = fTextureCoord * iResolution / iResolution;
	vec2 coordInPx = fTextureCoord * iResolution - iResolution * origin;

	// 获得当前 progress 下单元格的大小.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float cellSize = cellSizeRate * maxOfWH;

	// 将该向量的 x, y 相对于 cellSize 进行整数化, 得到所在单元格的中点位置.
	// 然后获得相对于原点的位移向量.
	vec2 center = getCellCenter(coordInPx, cellSize);
	vec2 cellOrigin = center + (- vec2(0.5, 0.5) + cellZoomOrigin) * cellSize;
	vec2 vFromOrigin = coordInPx - cellOrigin;

	// 计算出相对于原点的边界范围.
	// 这里向外额外扩张了 1px (模糊范围 / 2) 是因为边界平滑造成结束时在边缘处的平滑残像, 所以稍微扩张边界来抹除.
	float extendRate = beZoomOut ? 1.0 - iProgress : iProgress;
	vec2 rangeInX = (vec2(center.x - cellSize / 2.0 - 1.0, center.x + cellSize / 2.0 + 1.0) - cellOrigin.x) * extendRate;
	vec2 rangeInY = (vec2(center.y - cellSize / 2.0 - 1.0, center.y + cellSize / 2.0 + 1.0) - cellOrigin.y) * extendRate;

	// 在两个方向分别针对边界做平滑滤波, 然后相乘.
	// 为什么这里的模糊范围是 2px?
	// 这是由于 1px 的平滑并不是真正的平滑, 渲染移动的 1px 平滑时会产生波动, 不过这种波动由于较小并不太容易被留意到.
	// 但是, 如果这种波动以明显的周期性方式重复, 那么就会很容易被留意到.
	float innerColorRateInX = rangestep(rangeInX.x, rangeInX.y, 2.0, vFromOrigin.x);
	float innerColorRateInY = rangestep(rangeInY.x, rangeInY.y, 2.0, vFromOrigin.y);
	float innerColorRate = innerColorRateInX * innerColorRateInY;

	// 混合颜色
	vec4 oldColor = texture(iChannel[0], coord);
	vec4 newColor = texture(iChannel[1], coord);

	return mix(oldColor, newColor, beZoomOut ? 1.0 - innerColorRate : innerColorRate);
}

void main() { 
	fragColor = getFragColor();
}
