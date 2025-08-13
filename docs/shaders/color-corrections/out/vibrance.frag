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
