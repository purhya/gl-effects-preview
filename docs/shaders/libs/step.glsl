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

#export linearstep, rangeStep