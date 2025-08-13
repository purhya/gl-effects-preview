#include ../includes/header.frag

uniform float rPercent;		// -100~100
uniform float gPercent;		// -100~100
uniform float bPercent;		// -100~100

in vec2 fTextureCoord;

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);

	return vec4(
		color.r + rPercent * 0.005,
		color.g + gPercent * 0.005,
		color.b + bPercent * 0.005,
		color.a
	);
}

void main() {
	fragColor = getFragColor(); 
}
