#include ../includes/header.frag
#import linearstep from ../../libs/step.glsl

uniform vec3 fadeToColor;	// 在过渡中间位置插入的颜色.

vec4 getFragColor() {
	float rate1 = 1.0 - linearstep(0.0, 0.5, iProgress);
	float rate2 = linearstep(0.5, 1.0, iProgress);
	vec3 color1 = texture(iChannel[0], fTextureCoord).rgb;
	vec3 color2 = texture(iChannel[1], fTextureCoord).rgb;

	// 两个颜色的总权重不足 1 的部分混入指定的颜色.
	return vec4(color1 * rate1 + color2 * rate2 + (1.0 - rate1 - rate2) * fadeToColor, 1.0);
}

void main() { 
	fragColor = getFragColor();
}
