#include ../includes/header.frag
#include ../includes/hsl-rgb.frag

in vec2 fTextureCoord;

float linearstep(float x, float min, float max) {
	return clamp((x - min) / (max - min), 0.0, 1.0);
}

float adjustLightness(float x, float rate) {

	// 穿过 (-1, 0.6), (0, 1), (1, 2) 三个点.
	float exp = (-0.14285714 * rate - 1.0) / (0.42857143 * rate - 1.0);

	return 1.0 - pow(1.0 - x, exp);
}

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	vec3 hsl = RGB2HSL(color.rgb);

	// 阴影部分的分界值.
	float shadowThreshold = 0.6;
  
	// 调整的强度, 0~1.
	float intensity = iPercent / 100.0;
  
	// 归属于阴影部分的比例, 0~1, 全黑为 1, 分界值为 0.
	float shadowRate = 1.0 - linearstep(hsl.z, 0.0, shadowThreshold);

	// 按照归属于阴影的比例调整亮度.
	hsl.z = adjustLightness(hsl.z, intensity * shadowRate);

	return vec4(HSL2RGB(hsl), 1.0);
}

void main() {
	fragColor = getFragColor(); 
}
