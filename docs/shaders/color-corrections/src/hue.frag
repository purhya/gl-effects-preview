#include ../includes/header.frag
#include ../includes/hsl-rgb.frag

in vec2 fTextureCoord;

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	vec3 hsl = RGB2HSL(color.rgb);
	
	hsl.x = mod(hsl.x + iPercent / 100.0 * 3.0 + 6.0, 6.0);

	return vec4(HSL2RGB(hsl), color.a);	
}

void main() {
	fragColor = getFragColor(); 
}
