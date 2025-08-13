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

in vec2 fTextureCoord;

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);

	// 这里增加了一个基底值 1.0 用来防止暗色增加曝光度后感知到的色相巨变.
	float sumOfRGB = color.r + color.g + color.b + 1.0;

	float factor = iPercent / 100.0 / sumOfRGB * 1.5;

	return vec4(
		color.r * (1.0 + factor),
		color.g * (1.0 + factor),
		color.b * (1.0 + factor),
		color.a
	);
}

void main() {
	fragColor = getFragColor(); 
}
