#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

// 参考了 https://www.cnblogs.com/Imageshop/p/3550185.html.

in vec2 fTextureCoord;	// 采样坐标.
out vec4 fragColor;		// 输出的颜色.

uniform vec2      iResolution;				// 输出图像的尺寸, 即画布尺寸.
uniform sampler2D iChannel[3];				// 输入 0 为原图, 1 为蒙版图, 2 为背景色.

// 最多在多大的像素范围内搜索接近的前景色.
// 默认为 5px, 即最多会搜索到 5px 范围的颜色作为前景色.
// 注意整个着色运算量和其平方正相关, 不应设置得过大, 例如超过 10.
uniform int       maxSearchingFgRadius;

// 允许的最大的 mask 图片的误差像素范围.
// 例如我们的 AI 抠图生成的 mask 的精度一般在 1px 内, 但是细节处会有 2px 误差, 所以应该设置为 2px.
// 因此在距离边缘超过 2px 的内部像素点, 可以立即判定其为前景色, 而距离边缘超过 2px 的外部像素点, 可以立即判定其为背景色.
// 这个值只跟 mask 图片的精度有关, 不适合做调整, 此外它不应当超过 maxSearchingFgRadius 的一半.
uniform int       maxMaskErrorPixels;

// 获取附近最接近前景色的颜色, 即首先它的透明度接近 1,
// 其次它的颜色要比较远离背景色.
vec4 guessForegroundColor(vec4 color, vec4 bgColor) {
	vec4 fgColor = vec4(0);
	float fgTargetValue = 0.0;

    for (int i = -maxSearchingFgRadius; i <= maxSearchingFgRadius; i++) {
 		for (int j = -maxSearchingFgRadius; j <= maxSearchingFgRadius; j++) {
			vec2 pixelCoord = fTextureCoord + vec2(i, j) / iResolution;
			vec4 pixelFgColor = texture(iChannel[0], pixelCoord);
			vec4 pixelMaskColor = texture(iChannel[1], fTextureCoord);
			float pixelMaskAlpha = pixelMaskColor.r * 0.333 + pixelMaskColor.g * 0.333 + pixelMaskColor.b * 0.334;

			// 使用当前位置的颜色作为前景色对颜色进行分解.
			float pixelAlpha = dot(color.rgb - bgColor.rgb, pixelFgColor.rgb - bgColor.rgb)
				/ pow(length(pixelFgColor.rgb - bgColor.rgb), 2.0);
			pixelAlpha = clamp(pixelAlpha, 0.0, 1.0);

			// 蒙版透明度权值, 0~1, 0.95 时权重减半.
			float beFrontPriority = pow((pixelMaskAlpha + 1.0) / 2.0, 24.0);

			// 距离权值, 距离自己越近越高. 3 级区分.
			float distancePriority = float(maxSearchingFgRadius) / float(maxSearchingFgRadius + abs(i) + abs(j));

			// 颜色分解的权值, 10 级区分.
			float colorDecompressionPriority = pow(1.0 / (0.5 + distance(color, pixelFgColor * pixelAlpha + (1.0 - pixelAlpha) * bgColor)), 2.0);

			// 背离背景色权值, 30 级区分, 如果颜色在 RGB 空间和背景色更接近, 则越高.
			// 把它的比重调大会让背景杂边减小.
			float farFromBgPriority = pow(distance(pixelFgColor, bgColor) + 0.5, 3.0);

			float targetValue = beFrontPriority
				* distancePriority
				* farFromBgPriority
				* colorDecompressionPriority;

			if (targetValue > fgTargetValue) {
				fgColor = pixelFgColor;
				fgTargetValue = targetValue;
			}
		}
	}

	// 将颜色的透明度填满.
	fgColor /= fgColor.a;

	return fgColor;
}

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

	// 前景和背景色只是一个大概猜测, 实际如果能列出临近的多个颜色组, 然后将他们分别测试会最好.
	vec4 bgColor = texture(iChannel[2], fTextureCoord);

	// 计算前景色.
	vec4 fgColor = guessForegroundColor(color, bgColor);

	// 计算当前位置的 mask alpha 的临近均值.
	float averageMaskAlpha = getAverageMaskAlpha();

	// 通过前景和背景以及当前颜色计算出合适的透明度, 以让合成的颜色和原始颜色在 RGB 空间内最接近.
	float alpha = dot(color.rgb - bgColor.rgb, fgColor.rgb - bgColor.rgb)
		/ pow(length(fgColor.rgb - bgColor.rgb), 2.0);
	
	alpha = clamp(alpha, 0.0, 1.0);

	if (averageMaskAlpha == 1.0) {
		return color;
	}
	else if (averageMaskAlpha == 0.0) {
		return vec4(0, 0, 0, 0);
	}
	else {
		//return fgColor * alpha;
		return color - (1.0 - alpha) * bgColor;
	}
}

void main() {
	fragColor = getFragColor(); 
}
