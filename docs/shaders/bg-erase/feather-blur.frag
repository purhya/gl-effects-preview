#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

in vec2 fTextureCoord;	// 采样坐标.
out vec4 fragColor;		// 输出的颜色.

uniform vec2      iResolution;		// 输出图像的尺寸, 即画布尺寸.
uniform sampler2D iChannel[1];		// 输入待调色的图片对应的纹理.
uniform vec2      samplingRadius;	// 采样在 xy 两方向的像素偏移半径.

/** 进行高斯模糊透明度采样. */
float gaussBlurAlphaSampling() {
    float alpha = 0.0;
	float samplingCount = 16.0;
	vec2 d = samplingRadius / iResolution / samplingCount;

	// 进行 16 + 1 采样.
	alpha += texture(iChannel[0], fTextureCoord - 8.0 * d).a * 0.0273;
	alpha += texture(iChannel[0], fTextureCoord - 7.0 * d).a * 0.0355;
	alpha += texture(iChannel[0], fTextureCoord - 6.0 * d).a * 0.0447;
	alpha += texture(iChannel[0], fTextureCoord - 5.0 * d).a * 0.0542;
	alpha += texture(iChannel[0], fTextureCoord - 4.0 * d).a * 0.0635;
	alpha += texture(iChannel[0], fTextureCoord - 3.0 * d).a * 0.0718;
	alpha += texture(iChannel[0], fTextureCoord - 2.0 * d).a * 0.0784;
	alpha += texture(iChannel[0], fTextureCoord - 1.0 * d).a * 0.0826;
	alpha += texture(iChannel[0], fTextureCoord + 0.0 * d).a * 0.0841;
	alpha += texture(iChannel[0], fTextureCoord + 1.0 * d).a * 0.0826;
	alpha += texture(iChannel[0], fTextureCoord + 2.0 * d).a * 0.0784;
	alpha += texture(iChannel[0], fTextureCoord + 3.0 * d).a * 0.0718;
	alpha += texture(iChannel[0], fTextureCoord + 4.0 * d).a * 0.0635;
	alpha += texture(iChannel[0], fTextureCoord + 5.0 * d).a * 0.0542;
	alpha += texture(iChannel[0], fTextureCoord + 6.0 * d).a * 0.0447;
	alpha += texture(iChannel[0], fTextureCoord + 7.0 * d).a * 0.0355;
	alpha += texture(iChannel[0], fTextureCoord + 8.0 * d).a * 0.0273;

    return alpha;
}

vec4 getFragColor() {
    vec4 color = texture(iChannel[0], fTextureCoord);
    float alpha = gaussBlurAlphaSampling();

	// 实际上只保留 alpha 通道来作为下一次的输入.
    return vec4(color.rgb, alpha);
}

void main() {
	fragColor = getFragColor();
}