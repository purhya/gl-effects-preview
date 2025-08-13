#include ../includes/header.frag

vec4 getFragColor() {
	vec4 rawColor = texture(iChannel[0], fTextureCoord);

	//这里在降低透明度的同时混入了一些黑色, 来防止其容易吸引注意力.
	vec4 color = mix(rawColor, vec4(0, 0, 0, 1), iProgress);
	color.a *= 1.0 - iProgress;
	
	return color;
}

void main() { 
	fragColor = getFragColor();
}
