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
