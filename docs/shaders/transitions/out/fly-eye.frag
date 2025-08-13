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

uniform float offsetRadius;		// 采样的最大偏移的半径, 0~1.
uniform float offsetPeriod;		// 采样偏移的周期, 0~1.
uniform float colorSeparation;	// 红绿色彩分离的程度, 0~1.
 
vec4 getFragColor() {
	vec2 coord = fTextureCoord * iResolution / iResolution;

	// XY 方向的正弦周期性偏移, 来形成一种类似于破浪的效果.
	vec2 offset = offsetRadius * vec2(sin(coord.x * PI / offsetPeriod), sin(coord.y * PI / offsetPeriod));

	// RGB 三色分离, 相当于三色拥有不同的折射率.
	vec4 oldColor = vec4(
		texture(iChannel[0], coord + iProgress * offset * (1.0 - colorSeparation)).r,
		texture(iChannel[0], coord + iProgress * offset).g,
		texture(iChannel[0], coord + iProgress * offset * (1.0 + colorSeparation)).b,
		1.0
	);

	vec4 newColor = texture(iChannel[1], coord + (1.0 - iProgress) * offset);

	return mix(oldColor, newColor, iProgress);
}

void main() { 
	fragColor = getFragColor();
}
