#include ../includes/header.vert

in vec3 translate;

void main() {
	gl_Position = iTransform * vPosition + vec4(iProgress * translate, 0.0);
	fTextureCoord = vTextureCoord;
}
