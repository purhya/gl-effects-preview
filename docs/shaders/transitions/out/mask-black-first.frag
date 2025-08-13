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
// 混合两个颜色, 模式为我们正常观察透明物品的模式.
// 请注意这不是一个标准的混合模型, 而是基于我 (FM) 对于颜色混合的物理分析而创建的一个模型.
vec4 blend(vec4 top, vec4 bottom) {
	vec3 finalRGB = top.rgb * top.a + bottom.rgb * bottom.a * (1.0 - top.a);
	float finalAlpha = top.a + bottom.a * (1.0 - top.a);

	return vec4(
		finalRGB / (finalAlpha == 0.0 ? 1.0 : finalAlpha),
		finalAlpha
	);
}

// 获得颜色的亮度值
float luminance(vec3 color) {
	return color.r * 0.3 + color.g * 0.59 + color.b * 0.11;
}

uniform float smoothRange;	// 进行颜色过渡的区间长度.

vec4 getFragColor() {
	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	// 对新图的明度值进行滤波, 结果是新图的偏黑的部分会更早显示出来. 看起来像是黑色的墨水渗了过来.
	float maskValue = luminance(color2.xyz);
	float newRate = smoothstep(maskValue, maskValue + smoothRange, iProgress * (1.0 + smoothRange));

	return mix(color1, color2, newRate);
}

void main() { 
	fragColor = getFragColor();
}
