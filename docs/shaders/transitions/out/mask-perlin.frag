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
// 以下的内容主要参考自: https://thebookofshaders.com/

/** 伪随机函数, 参数可以根据当前坐标来生成. */
float random1(float x) {
    return fract(sin(dot(x, 12.9898)) * 43758.5453);
}

float random2(vec2 v) {
    return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}

float random3(vec3 v) {
    return fract(sin(dot(v, vec3(12.9898, 78.233, 151.7182))) * 43758.5453);
}

/** 随机噪声, 返回范围为 [0, 1]. 参数可以根据当前坐标来生成. 其变化频率由 x 值的范围决定. */
float noise1(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);

    return mix(
        random1(i),
        random1(i + 1.0),
        u
    );
}

/** 随机二维噪声, 返回范围为 [0, 1]. 其变化频率由 v 值的范围决定. */
float noise2(vec2 v) {
    vec2 i = floor(v);
    vec2 f = fract(v);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = random2(i);
    float b = random2(i + vec2(1.0, 0.0));
    float c = random2(i + vec2(0.0, 1.0));
    float d = random2(i + vec2(1.0, 1.0));

    return mix(a, b, u.x) +
        (c - a)* u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

uniform float smoothRange;	// 进行颜色过渡的区间长度.
uniform float noiseRadius;	// 噪声的半径, 相对于偏高较大值的百分比.
uniform float noiseOffset;	// 噪声的偏移.

vec4 getFragColor() {
	// 使用噪声作为蒙版, 噪声的较黑色区域会让新图更早出现.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float noiseRadiusInPx = noiseRadius * maxOfWH;
	float maskValue = noise2(fTextureCoord * iResolution / noiseRadiusInPx + vec2(noiseOffset, 0.0));
	float newRate = smoothstep(maskValue, maskValue + smoothRange, iProgress * (1.0 + smoothRange));

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, newRate);
}

void main() { 
	fragColor = getFragColor();
}
