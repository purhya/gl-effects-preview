#include ../includes/header.frag
#import noise2 from ../../libs/math.glsl

uniform float smoothRange;	// 进行颜色过渡的区间长度.
uniform float noiseRadius;	// 噪声的半径, 相对于偏高较大值的百分比.
uniform float noiseOffset;	// 噪声的偏移.

vec4 getFragColor() {
	// 使用噪声作为蒙版, 噪声的较黑色区域会让新图更早出现.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float noiseRadiusInPx = noiseRadius * maxOfWH;
	float maskValue = noise2(fTextureCoord * iResolution / noiseRadiusInPx + vec2(noiseOffset, 0.0));
	float newRate = smoothstep(maskValue, maskValue + smoothRange, iProgress * (1.0 + smoothRange));

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, newRate);
}

void main() { 
	fragColor = getFragColor();
}
