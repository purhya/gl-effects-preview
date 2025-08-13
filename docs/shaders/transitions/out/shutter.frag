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

uniform float shutterSizeRate;		// 条纹单元相对于宽高的比率.
uniform float shutterSlideOrigin;	// 条纹单元的缩放变化的起点在单元内的相对坐标, 默认为 (0.5, 0.5), 范围为 0~1.
uniform bool beVertical;			// 是否水平拉开.

// 自然基底向量,也可以用一个 mat2 表示, 不过用向量可能自然一些.
vec2 origin = vec2(0.5, 0.5);
vec2 baseV1 = vec2(1.0, 0.0);	// e^0i
vec2 baseV2 = vec2(0.0, 1.0);	// e^πi/4

// 求出向量最近的单元的中心点.
// 这里在假设横纵两个方向都有条纹循环.
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

	// 获得当前 progress 下单元的大小.
	float shutterSize = shutterSizeRate * (beVertical ? iResolution.x : iResolution.y);

	// 将该向量的 x, y 相对于 shutterSize 进行整数化, 得到所在单元的中点位置.
	// 然后获得相对于原点的位移向量.
	vec2 center = getCellCenter(coordInPx, shutterSize);
	vec2 cellOrigin = center + (- vec2(0.5, 0.5) + shutterSlideOrigin) * shutterSize;
	vec2 vFromOrigin = coordInPx - cellOrigin;

	// 计算出相对于原点的边界范围.
	// 这里向外额外扩张了 1px (模糊范围 / 2) 是因为边界平滑造成结束时在边缘处的平滑残像, 所以稍微扩张边界来抹除.
	vec2 rangeInX = (vec2(center.x - shutterSize / 2.0 - 1.0, center.x + shutterSize / 2.0 + 1.0) - cellOrigin.x) * iProgress;
	vec2 rangeInY = (vec2(center.y - shutterSize / 2.0 - 1.0, center.y + shutterSize / 2.0 + 1.0) - cellOrigin.y) * iProgress;

	// 在两个方向分别针对边界做平滑滤波, 然后相乘.
	// 为什么这里的模糊范围是 2px?
	// 这是由于 1px 的平滑并不是真正的平滑, 渲染移动的 1px 平滑时会产生波动, 不过这种波动由于较小并不太容易被留意到.
	// 但是, 如果这种波动以明显的周期性方式重复, 那么就会很容易被留意到.
	float innerColorRateInX = rangestep(rangeInX.x, rangeInX.y, 2.0, vFromOrigin.x);
	float innerColorRateInY = rangestep(rangeInY.x, rangeInY.y, 2.0, vFromOrigin.y);
	float innerColorRate = beVertical ? innerColorRateInX : innerColorRateInY;

	// 混合颜色
	vec4 oldColor = texture(iChannel[0], coord);
	vec4 newColor = texture(iChannel[1], coord);

	return mix(oldColor, newColor, innerColorRate);
}

void main() { 
	fragColor = getFragColor();
}
