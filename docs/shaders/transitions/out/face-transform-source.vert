#version 300 es

#ifdef GL_ES 
precision mediump float;
#define GLSLIFY 1
#define GLSLIFY 1 
#endif

uniform float iProgress;
uniform vec2  iResolution;
uniform mat4  iTransform;

in  vec4 vPosition;
in  vec2 vTextureCoord;
out vec2 fTextureCoord;

in vec3 translate;

void main() {
	gl_Position = iTransform * vPosition + vec4(iProgress * translate, 0.0);
	fTextureCoord = vTextureCoord;
}
