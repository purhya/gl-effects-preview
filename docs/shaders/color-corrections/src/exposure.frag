#include ../includes/header.frag

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
