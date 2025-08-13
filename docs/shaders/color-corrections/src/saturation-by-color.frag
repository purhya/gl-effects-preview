#include ../includes/header.frag
#include ../includes/hsl-rgb.frag

uniform vec3 colorToAdjust;	// 要针对哪个颜色调整
uniform float tolerance;	// 容差, 较小的容差仅允许调整和 `colorToAdjust` 非常接近的颜色.

in vec2 fTextureCoord;

// 穿过 (-1, 0.4), (0, 1), (1, 4) 三个点.
float getFactor(float x) {
	return (1.2 * x + 1.8) * x + 1.0;
}

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	vec3 hsl = RGB2HSL(color.rgb);
	vec3 hslToAdjust = RGB2HSL(colorToAdjust);
	
	float powerFactor = getFactor(iPercent / 100.0);
	float diff = HSLColorDiff(hsl, hslToAdjust);
	float rateOfRawColor = clamp(diff / tolerance, 0.0, 1.0);

	hsl.y = 1.0 - pow(1.0001 - hsl.y, powerFactor);

	return mix(vec4(HSL2RGB(hsl), color.a), color, rateOfRawColor);	
}

void main() {
	fragColor = getFragColor(); 
}
