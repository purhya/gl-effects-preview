#include ../includes/header.frag
#import rangestep from ../../libs/step.glsl

/*
每一个条纹循环都由两部分组成:
	前 50%:
		stripeHeight px 条纹显示新图.
		stripeLoopHeight - stripeHeight px 条纹显示旧图.

	后 50%:
		stripeLoopHeight - stripeHeight px 条纹显示新图.
		stripeHeight px 条纹显示旧图.
*/

uniform float fixedYPosition;		// 条纹收缩的 Y 位置, 0~1, 0 是最上面, 1 是最下面.
uniform float stripeHeight;			// 条纹的高度, 单位 px.
uniform float maxStripeLoopHeight;	// 开始时以及结束时条纹的循环长度, 单位 px.

// 60 -> 2 -> 60.
// 1.5 用于处理中间的变换平滑, 如果是 1, 则中间停留在 2px 附近的时间会过短.
float getStripeLoopHeight(float x) {
	return pow(abs(0.5 - x) * 2.0, 1.5) * (maxStripeLoopHeight - stripeHeight) + stripeHeight * 2.0;
}

// 在开始的 10% 渐显.
float stripeOpacity(float x) {
	return smoothstep(0.0, 0.1, x);
}

// 在最后的 10% 渐淡.
float oldTextureOpacity(float x) {
	return 1.0 - smoothstep(0.9, 1.0, x);
}

vec4 getFragColor() {
	// 获得当前的条纹循环长度.
	float stripeLoopHeight = getStripeLoopHeight(iProgress);

	// 这里的 y 值代表了从一个不动点计量产生的当前位置的 y 坐标.
	// 使用 y + stripeHeight 是因为我们在边界处要将 stripeHeight px 的条纹埋在屏幕的上下两侧之外, 不然看起来会有点奇怪.
	float y = (iResolution.y + stripeHeight) * (1.0 - fixedYPosition) - fTextureCoord.y * iResolution.y;

	// 获得当前最近的一个条纹循环的起始位置. 注意这里的 y 必须加 1, 否则会被并入上一个条纹循环.
	float loopStartY = floor((y + 1.0) / stripeLoopHeight) * stripeLoopHeight;
	
	// 获得条纹的第一部分 - 新图所在的条纹的结束位置, 它根据当前进度是否大于 50% 而不同.
	float loopNewEndY = iProgress < 0.5
		? loopStartY + stripeHeight
		: loopStartY + stripeLoopHeight - stripeHeight;

	// 处理边缘平滑, 在范围内返回 1, 范围外 0, 平滑范围 1px.
	float newAlpha = rangestep(loopStartY, loopNewEndY, 1.0, y);
	//float newAlpha = clamp(min(y + 1.0, loopNewEndY) - max(y, loopStartY), 0.0, 1.0);
	float oldAlpha = 1.0 - newAlpha;

	// 在开始和结束位置处理条纹的透明度渐变, 如果旧图要减小透明度, 则将减小的部分加入新图.
	newAlpha = newAlpha * stripeOpacity(iProgress) + oldAlpha * (1.0 - oldTextureOpacity(iProgress));

	return mix(
		texture(iChannel[0], fTextureCoord),
		texture(iChannel[1], fTextureCoord),
		newAlpha
	);
}

void main() { 
	fragColor = getFragColor();
}
