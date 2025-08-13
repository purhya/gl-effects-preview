#include ../includes/header.frag

in vec2 fTextureCoord;

// 穿过 (-1, 0.6), (0, 1), (1, 1.6) 三个点.
float getContrastFactor(float x) {
	return (-0.28 * x - 1.0) / (0.2 * x - 1.0);
}

float changeContrast(float channelValue, float factor) {
	return (channelValue - 0.5) * factor + 0.5;
}

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	float factor = getContrastFactor(iPercent / 100.0);

	return vec4(
		changeContrast(color.r, factor),
		changeContrast(color.g, factor),
		changeContrast(color.b, factor),
		color.a
	);
}

void main() {
	fragColor = getFragColor(); 
}
