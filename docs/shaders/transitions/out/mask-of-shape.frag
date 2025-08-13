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

uniform sampler2D mask;				// 用于形状蒙版的采样器.
uniform float maxMaskExtandRate;	// 形状的最大的扩展倍数.\

vec2 origin = vec2(0.5, 0.5);		// 中心点坐标.

// 只进行 [0, 1] 的范围采样, 范围外返回 1.
float sampleMask(vec2 coord) {
	float xAlpha = rangestep(0.0, 1.0, 0.0, coord.x);
	float yAlpha = rangestep(0.0, 1.0, 0.0, coord.y);

	return texture(mask, coord).r * xAlpha * yAlpha + (1.0 - xAlpha * yAlpha);
}

vec4 getFragColor() {
	// 求出当前点相对于原点的坐标.
	vec2 originInPx = origin * iResolution;
	vec2 v = fTextureCoord * iResolution - originInPx;

	// 计算当前的形状, 其外边缘应该扩张到哪里.
	// 这里首先确定最大扩张边界, 然后根据 progress 计算当前的边界.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float totalRadius = maxMaskExtandRate * maxOfWH / 2.0;
	float currentRadius = totalRadius * iProgress;

	// 通过上面的边界计算在蒙版纹理上的采样坐标.
	vec2 maskCoord = vec2(0.5, 0.5) + v / currentRadius;
	float oldRate = sampleMask(maskCoord);

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, 1.0 - oldRate);
}

void main() { 
	fragColor = getFragColor();
}
