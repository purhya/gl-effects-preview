#include ../includes/header.frag
#include ../includes/hsl-rgb.frag

uniform vec3 colorToAdjust;	// 要针对哪个颜色调整
uniform float tolerance;	// 容差, 较小的容差仅允许调整和 `colorToAdjust` 非常接近的颜色.

in vec2 fTextureCoord;

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	vec3 hsl = RGB2HSL(color.rgb);
	vec3 hslToAdjust = RGB2HSL(colorToAdjust);
	
	float diff = HSLColorDiff(hsl, hslToAdjust);
	float rateOfRawColor = clamp(diff / tolerance, 0.0, 1.0);

	hsl.z = 1.0 - pow(1.0 - hsl.z, 1.0 + iPercent * 0.005);

	return mix(vec4(HSL2RGB(hsl), color.a), color, rateOfRawColor);	
}

void main() {
	fragColor = getFragColor(); 
}
