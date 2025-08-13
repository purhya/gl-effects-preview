#include ../includes/header.frag

vec4 getFragColor() {
	return mix(
		texture(iChannel[0], fTextureCoord),
		vec4(0, 0, 0, 1.0),
		sin(iProgress * PI / 2.0) * 0.8
	);
}

void main() {
	fragColor = getFragColor();
}
