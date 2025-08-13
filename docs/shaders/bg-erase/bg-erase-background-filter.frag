#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

in vec2 fTextureCoord;	// 采样坐标.
out vec4 fragColor;		// 输出的颜色.

uniform vec2      iResolution;				// 输出图像的尺寸, 即画布尺寸.
uniform sampler2D iChannel[2];			// 输入 0 为原图, 1 为蒙版图,
uniform int       maxMaskErrorPixels;	// 允许的最大的 mask 图片的误差像素范围. 参考 `bg-erase-blend.frag` 中的注释.

// 获取当前像素周围的均值透明度.
// 这个默认的半径应当设置大体和 mask 图形的最大误差像素相一致.
float getAverageMaskAlpha() {
	float alphaTotal = 0.0;
	float pixelCount = pow(float(maxMaskErrorPixels * 2 + 1), 2.0);

    for (int i = -maxMaskErrorPixels; i <= maxMaskErrorPixels; i++) {
 		for (int j = -maxMaskErrorPixels; j <= maxMaskErrorPixels; j++) {
			vec2 pixelCoord = fTextureCoord + vec2(i, j) / iResolution;
			vec4 pixelMaskColor = texture(iChannel[1], pixelCoord);
			float pixelMaskAlpha = pixelMaskColor.r * 0.333 + pixelMaskColor.g * 0.333 + pixelMaskColor.b * 0.334;

			alphaTotal += pixelMaskAlpha;
		}
	}

	return alphaTotal / pixelCount;
}

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	float averageMaskAlpha = getAverageMaskAlpha();

	// 移除可能为前景的区域.
	if (averageMaskAlpha > 0.0) {
		color *= 0.0;
	}
	
	return color;
}

void main() {
	fragColor = getFragColor(); 
}
