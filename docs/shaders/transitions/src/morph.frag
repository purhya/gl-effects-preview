#include ../includes/header.frag

// 参考自 https://gl-transitions.com/editor/morph

uniform float offsetRadius;	// 采样的偏移半径, 0~1.

vec4 getFragColor() {
	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	// 红蓝绿都对采样位置产生了扰动.
	// 需要注意的是, 由于是对采样位置产生的扰动, 所以可以看到实际的斜向的偏离不是以 45° 为基准, 而是斜对角线.
	// 最终产生的结果是:
	// 	   接近中间灰的颜色几乎不产生扭曲;
	//     红色部分在 x 方向移动;
	//     蓝色部分在 y 方向移动;
	//     绿色部分在对角线方向移动;
	vec2 offset1 = color1.rg + color1.b - 1.0;	// [-1, 1]
	vec2 offset2 = color2.rg + color2.b - 1.0;	// [-1, 1]
	vec2 maxOffset = mix(offset1, offset2, 0.5) * offsetRadius;

	// 原图扭曲逐渐增大, 新图扭曲逐渐减小.
	vec2 textureCoord1 = fTextureCoord + maxOffset * iProgress;
	vec2 textureCoord2 = fTextureCoord - maxOffset * (1.0 - iProgress);

	return mix(
		texture(iChannel[0], textureCoord1),
		texture(iChannel[1], textureCoord2),
		iProgress
	);
}

void main() { 
	fragColor = getFragColor();
}
