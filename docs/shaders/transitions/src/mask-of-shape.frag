#include ../includes/header.frag
#import rangestep from ../../libs/step.glsl

uniform sampler2D mask;				// 用于形状蒙版的采样器.
uniform float maxMaskExtandRate;	// 形状的最大的扩展倍数.\

vec2 origin = vec2(0.5, 0.5);		// 中心点坐标.

// 只进行 [0, 1] 的范围采样, 范围外返回 1.
float sampleMask(vec2 coord) {
	float xAlpha = rangestep(0.0, 1.0, 0.0, coord.x);
	float yAlpha = rangestep(0.0, 1.0, 0.0, coord.y);

	return texture(mask, coord).r * xAlpha * yAlpha + (1.0 - xAlpha * yAlpha);
}

vec4 getFragColor() {
	// 求出当前点相对于原点的坐标.
	vec2 originInPx = origin * iResolution;
	vec2 v = fTextureCoord * iResolution - originInPx;

	// 计算当前的形状, 其外边缘应该扩张到哪里.
	// 这里首先确定最大扩张边界, 然后根据 progress 计算当前的边界.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float totalRadius = maxMaskExtandRate * maxOfWH / 2.0;
	float currentRadius = totalRadius * iProgress;

	// 通过上面的边界计算在蒙版纹理上的采样坐标.
	vec2 maskCoord = vec2(0.5, 0.5) + v / currentRadius;
	float oldRate = sampleMask(maskCoord);

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, 1.0 - oldRate);
}

void main() { 
	fragColor = getFragColor();
}
