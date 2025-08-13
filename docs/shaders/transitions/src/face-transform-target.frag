#include ../includes/header.frag

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	color *= iProgress;

	return color;
}

void main() {
	fragColor = getFragColor();
}
