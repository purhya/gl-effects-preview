#include ../includes/header.frag
#import luminance from ../../libs/color.glsl

uniform float smoothRange;	// 进行颜色过渡的区间长度.

vec4 getFragColor() {
	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	// 对新图的明度值进行滤波, 结果是新图的偏白的部分会更早显示出来.
	float maskValue = 1.0 - luminance(color2.xyz);
	float newRate = smoothstep(maskValue, maskValue + smoothRange, iProgress * (1.0 + smoothRange));

	return mix(color1, color2, newRate);
}

void main() { 
	fragColor = getFragColor();
}
