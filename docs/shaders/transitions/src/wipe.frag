#include ../includes/header.frag
#import getMotionMoves, MotionMoves from ../libs/motion.glsl

uniform float directionAngle;	// 擦除的方向对应的角度.
uniform float wipeBlurRate;		// 擦除的模糊距离相对于宽高的较大值的比率.

vec4 getFragColor() {
	// 计算平滑的距离.
	float blurPixels = max(iResolution.x, iResolution.y) * wipeBlurRate + 1.0;

	// 计算运动距离和方向.
	MotionMoves moves = getMotionMoves(directionAngle, iResolution);
	float totalLength = moves.length + blurPixels;

	// 当前像素在总长上面处于的位置.
	float currentLength = dot(fTextureCoord * iResolution - moves.start, moves.direction);

	// 分界线位置, 由于开始和结束时需要分别隐藏半个模糊距离, 所以减去一半.
	float boundary = totalLength * iProgress - 0.5 * blurPixels;

	// 在边缘 1px 处平滑, 取得的 alpha 为 progress 方向的, 即旧图的权重. 左侧为 0, 右侧为 1.
	float oldAlpha = smoothstep(
		boundary - 0.5 * blurPixels,
		boundary + 0.5 * blurPixels,
		currentLength
	);

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, 1.0 - oldAlpha);
}

void main() { 
	fragColor = getFragColor();
}
