#include ../includes/header.frag

uniform sampler2D mask;		// 用于进行过渡的蒙版图的采样器.
uniform float smoothRange;	// 进行颜色过渡的区间长度.

vec4 getFragColor() {
	// 使用纹理作为蒙版, 蒙版的较黑色区域会让新图更早出现.
	float maxOfWH = max(iResolution.x, iResolution.y);
	vec2 maskCoord = fTextureCoord * iResolution / iResolution;
	float maskValue = texture(mask, maskCoord).r;
	float newRate = smoothstep(maskValue, maskValue + smoothRange, iProgress * (1.0 + smoothRange));

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, newRate);
}

void main() { 
	fragColor = getFragColor();
}
