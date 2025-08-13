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

uniform float maxPixelSizeRate;	// 像素达到最大时相对于宽高较大值的比率.

vec2 origin = vec2(0.5, 0.5);	// 原点坐标.

// 这个函数通过 (0, 0), (0.5, 1), (1, 0).
float getPixelSizeRate(float x) {
	return 1.0 - pow(abs(2.0 * (x - 0.5)), 1.0);
}

vec4 getFragColor() {
	// 获得当前 progress 下像素的大小.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float maxPixelSize = maxPixelSizeRate * maxOfWH;
	float pixelSize = getPixelSizeRate(iProgress) * maxPixelSize + 1.0;

	// 获得相对于原点的向量.
	vec2 originInPx = origin * iResolution;
	vec2 v = fTextureCoord * iResolution - originInPx;

	// 将该向量的 x, y 相对于 pixelSize 进行整数化, 得到了所在像素格的中点位置.
	// 其中 pixelSize = 1 时, 必须保持显示为原图, 所以不进行像素化.
	vec2 roundV = pixelSize == 1.0 ? v : vec2(
		round(v.x / pixelSize) * pixelSize,
		round(v.y / pixelSize) * pixelSize
	);

	// 将整数化处理的中心坐标转为纹理坐标.
	vec2 centerTextureCoord = (originInPx + roundV) / iResolution;

	vec4 color1 = texture(iChannel[0], centerTextureCoord);
	vec4 color2 = texture(iChannel[1], centerTextureCoord);

	// 在中间的 20% 进行过渡.
	float newRate = smoothstep(0.4, 0.6, iProgress);

	return mix(color1, color2, newRate);
}

void main() { 
	fragColor = getFragColor();
}
