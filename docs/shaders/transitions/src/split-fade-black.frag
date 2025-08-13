#include ../includes/header.frag

vec4 getFragColor() {
	vec4 rawColor = texture(iChannel[0], fTextureCoord);
	
	return mix(rawColor, vec4(0, 0, 0, 1), iProgress);
}

void main() { 
	fragColor = getFragColor();
}
