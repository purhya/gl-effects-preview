#version 300 es

#ifdef GL_ES
precision mediump float;
#define GLSLIFY 1
#define GLSLIFY 1
#endif

uniform sampler2D iChannel[1];	// 输入待调色的图片对应的纹理.
uniform vec2      iResolution;	// 输出图像的尺寸, 即画布尺寸.
uniform float     iPercent;		// 要调整的百分比, 范围为 -100~100.

out vec4 fragColor;	// 输出的颜色.

uniform float rPercent;		// -100~100
uniform float gPercent;		// -100~100
uniform float bPercent;		// -100~100

in vec2 fTextureCoord;

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);

	return vec4(
		color.r + rPercent * 0.005,
		color.g + gPercent * 0.005,
		color.b + bPercent * 0.005,
		color.a
	);
}

void main() {
	fragColor = getFragColor(); 
}
