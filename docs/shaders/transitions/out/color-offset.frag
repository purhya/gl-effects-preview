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

uniform float offsetRadius;	// 采样的偏移的半径, 0~1.

// 三个用于根据进行偏移的基础向量, 各自成 120° 角.
vec2 vr = vec2(1.0, 0.0);
vec2 vg = vec2(-0.5, 0.86602540);
vec2 vb = vec2(-0.5, -0.86602540);

vec4 getFragColor() {
	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	// 红蓝绿都对采样位置产生了扰动.
	vec2 offset1 = (color1.r * vr + color1.g * vg + color1.b * vb);	// [-1, 1]
	vec2 offset2 = (color2.r * vr + color2.g * vg + color2.b * vb);	// [-1, 1]

	// 用于纠正宽高不等产生的位置偏移.
	vec2 ratio = iResolution / max(iResolution.x, iResolution.y);
	offset1 *= ratio;
	offset2 *= ratio;

	vec2 maxOffset = mix(offset1, offset2, 0.5) * offsetRadius;

	// 原图扭曲逐渐增大, 新图扭曲逐渐减小.
	vec2 textureCoord1 = fTextureCoord - maxOffset * iProgress;
	vec2 textureCoord2 = fTextureCoord + maxOffset * (1.0 - iProgress);

	return mix(
		texture(iChannel[0], textureCoord1),
		texture(iChannel[1], textureCoord2),
		iProgress
	);
}

void main() { 
	fragColor = getFragColor();
}
