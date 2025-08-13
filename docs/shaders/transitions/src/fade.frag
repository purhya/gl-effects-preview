#include ../includes/header.frag

vec4 getFragColor() {
	return mix(
		texture(iChannel[0], fTextureCoord),
		texture(iChannel[1], fTextureCoord),
		iProgress
	);
}

void main() {
	fragColor = getFragColor();
}
