#include ../includes/header.frag

in vec2 fTextureCoord;

// 穿过 (-1, 0.4), (0, 1), (1, 2) 三个点
float getContrastFactor(float x) {
	return (-0.5 * x - 1.0) / (0.25 * x - 1.0);
}

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	float avgOfRGB = (color.r + color.g + color.b) / 3.0;
	float factor = getContrastFactor(iPercent / 100.0);

	return vec4(
		(color.r - avgOfRGB) * factor + avgOfRGB,
		(color.g - avgOfRGB) * factor + avgOfRGB,
		(color.b - avgOfRGB) * factor + avgOfRGB,
		color.a
	);
}

void main() {
	fragColor = getFragColor(); 
}
