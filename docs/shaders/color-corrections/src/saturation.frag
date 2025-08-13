#include ../includes/header.frag
#include ../includes/hsl-rgb.frag

in vec2 fTextureCoord;

// 穿过 (-1, 0.3), (0, 1), (1, 3) 三个点.
float getPowerExp(float x) {
	return (-0.55555556 * x - 1.0) / (0.48148148 * x - 1.0);
}

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	vec3 hsl = RGB2HSL(color.rgb);
	float exp = getPowerExp(iPercent / 100.0);

	hsl.y = 1.0 - pow(1.0 - hsl.y + 0.0001, exp);

	return vec4(HSL2RGB(hsl), color.a);	
}

void main() {
	fragColor = getFragColor(); 
}
