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

uniform vec3 flashToColor;	// 在过渡中间位置插入的颜色.

vec4 getFragColor() {
	float rate1 = 1.0 - smoothstep(0.0, 0.8, iProgress);
	float rate2 = smoothstep(0.2, 1.0, iProgress);
	vec3 color1 = texture(iChannel[0], fTextureCoord).rgb;
	vec3 color2 = texture(iChannel[1], fTextureCoord).rgb;

	// 两个颜色的总权重不足 1 的部分混入指定的颜色.
	return vec4(color1 * rate1 + color2 * rate2 + (1.0 - rate1 - rate2) * flashToColor, 1.0);
}

void main() { 
	fragColor = getFragColor();
}
