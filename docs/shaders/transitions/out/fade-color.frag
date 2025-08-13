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
// 在区间上进行线性过渡, 区间左侧返回 1, 右侧返回 0.
float linearstep(float min, float max, float value) {
	return clamp((value - min) / (max - min), 0.0, 1.0);
}

// 类似于 `smoothstep`, 不过它用于一个范围的边界处插值, 在范围内返回 1, 范围外返回 1.
// 边界处的插值区间由 `smoothRange` 决定.
float rangestep(float minValue, float maxValue, float smoothRange, float value) {
	float valueToCenter = abs(value - (minValue + maxValue) / 2.0);
	float edgeValue = (maxValue - minValue) / 2.0;

	// 这一步非常重要, 如果区间范围小于平滑范围, 将平滑范围设置为区间范围.
	float halfRange = min(edgeValue, smoothRange / 2.0);

	return 1.0 - smoothstep(edgeValue - halfRange, edgeValue + halfRange, valueToCenter);
}

uniform vec3 fadeToColor;	// 在过渡中间位置插入的颜色.

vec4 getFragColor() {
	float rate1 = 1.0 - linearstep(0.0, 0.5, iProgress);
	float rate2 = linearstep(0.5, 1.0, iProgress);
	vec3 color1 = texture(iChannel[0], fTextureCoord).rgb;
	vec3 color2 = texture(iChannel[1], fTextureCoord).rgb;

	// 两个颜色的总权重不足 1 的部分混入指定的颜色.
	return vec4(color1 * rate1 + color2 * rate2 + (1.0 - rate1 - rate2) * fadeToColor, 1.0);
}

void main() { 
	fragColor = getFragColor();
}
