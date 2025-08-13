#version 300 es

#ifdef GL_ES 
precision mediump float;
#define GLSLIFY 1
#define GLSLIFY 1 
#endif

#define PI 3.1415926

uniform float     iProgress;
uniform vec2      iResolution;
uniform sampler2D iChannel[2];

in  vec2 fTextureCoord;
out vec4 fragColor;

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
