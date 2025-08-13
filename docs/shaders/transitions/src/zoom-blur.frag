#include ../includes/header.frag
#import motionSampling from ../../libs/texture.glsl

uniform float maxBlurRadiusRate;	// 最大时的模糊半径, 相对于宽高较大值的比率.

vec2 origin = vec2(0.5, 0.5);	// 原点坐标.

// 这个函数通过 (0, 0), (0.5, 1), (1, 0), 并且在中间位置有较平滑的过渡.
// 经过测试感觉 1.5 是一个比较合适的值, 高了会在中间停留时间过长, 低了则在中间的过渡太快不自然.
float getBlurRadiusRate(float x) {
	return 1.0 - pow(abs(2.0 * (x - 0.5)), 1.5);
}

vec4 getFragColor() {
	// 获得当前点的像素坐标.
	vec2 originInPx = origin * iResolution;
	vec2 v = fTextureCoord * iResolution - originInPx;
	float maxOfWH = max(iResolution.x, iResolution.y);

	// 获得运动方向向量, 它根据 progress, 以及当前坐标距离中心点的距离变化.
	// 这里除以 maxOfWH 而不是 iResolution 所以可以保持向量的宽高比例到纹理采样中.
	vec2 motionV = v / maxOfWH * 2.0 * maxBlurRadiusRate * getBlurRadiusRate(iProgress);

	vec2 fTextureCoord = fTextureCoord * iResolution / iResolution;
	vec4 color1 = motionSampling(iChannel[0], fTextureCoord, motionV, 16, 0.5);
	vec4 color2 = motionSampling(iChannel[1], fTextureCoord, motionV, 16, 0.5);

	// 在中间的 20% 进行过渡.
	float newRate = smoothstep(0.3, 0.7, iProgress);

	return mix(color1, color2, newRate);
}

void main() {
	fragColor = getFragColor();
}
