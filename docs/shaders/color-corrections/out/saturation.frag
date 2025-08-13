#version 300 es

#ifdef GL_ES
precision mediump float;
#define GLSLIFY 1
#define GLSLIFY 1
#endif

uniform sampler2D iChannel[1];	// 输入待调色的图片对应的纹理.
uniform vec2      iResolution;	// 输出图像的尺寸, 即画布尺寸.
uniform float     iPercent;		// 要调整的百分比, 范围为 -100~100.

out vec4 fragColor;	// 输出的颜色.
#define GLSLIFY 1
vec3 RGB2HSL(vec3 color) {
	float r = color.r;
	float g = color.g;
	float b = color.b;

	float minOfRGB = min(min(r, g), b);
	float maxOfRGB = max(max(r, g), b);
	float l = (minOfRGB + maxOfRGB) / 2.0;

	float s = minOfRGB == maxOfRGB
		? 0.0
		: (maxOfRGB - minOfRGB) / (l <= 0.5 ? minOfRGB + maxOfRGB : 2.0 - minOfRGB - maxOfRGB);

	float h = 0.0;

	if (s == 0.0) {}
	else if (r == maxOfRGB) {
		h = mod((g - b) / (maxOfRGB - minOfRGB) + 6.0, 6.0);
	}
	else if (g == maxOfRGB) {
		h = (b - r) / (maxOfRGB - minOfRGB) + 2.0;
	}
	else if (b == maxOfRGB) {
		h = (r - g) / (maxOfRGB - minOfRGB) + 4.0;
	}

	return vec3(h, s, l);
}

float hue2RGB(float minOfRGB, float maxOfRGB, float hueDiff) {
	if (hueDiff < 1.0) {
		return (maxOfRGB - minOfRGB) * hueDiff + minOfRGB;
	}
	else if (hueDiff < 3.0) {
		return maxOfRGB;
	}
	else if (hueDiff < 4.0) {
		return (maxOfRGB - minOfRGB) * (4.0 - hueDiff) + minOfRGB;
	}
	else {
		return minOfRGB;
	}
}

vec3 HSL2RGB(vec3 hsl) {
	float h = hsl.x;
	float s = hsl.y;
	float l = hsl.z;

	float maxOfRGB = l <= 0.5 ? l * (s + 1.0) : l + s - (l * s);
	float minOfRGB = l * 2.0 - maxOfRGB;
	
	return vec3(
		hue2RGB(minOfRGB, maxOfRGB, mod(h + 2.0, 6.0)),
		hue2RGB(minOfRGB, maxOfRGB, h),
		hue2RGB(minOfRGB, maxOfRGB, mod(h - 2.0 + 6.0, 6.0))
	);
}

// 返回两个颜色在 HSL 颜色空间的距离.
float HSLColorDiff(vec3 hsl1, vec3 hsl2) {
	vec3 diff = hsl1 - hsl2;

	if (abs(diff.x) >= 3.0) {
		diff.x = 6.0 - abs(diff.x);
	}

	return length(diff);
}

in vec2 fTextureCoord;

// 穿过 (-1, 0.3), (0, 1), (1, 3) 三个点.
float getPowerExp(float x) {
	return (-0.55555556 * x - 1.0) / (0.48148148 * x - 1.0);
}

vec4 getFragColor() {
	vec4 color = texture(iChannel[0], fTextureCoord);
	vec3 hsl = RGB2HSL(color.rgb);
	float exp = getPowerExp(iPercent / 100.0);

	hsl.y = 1.0 - pow(1.0 - hsl.y + 0.0001, exp);

	return vec4(HSL2RGB(hsl), color.a);	
}

void main() {
	fragColor = getFragColor(); 
}
