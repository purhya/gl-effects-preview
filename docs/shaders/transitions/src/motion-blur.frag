#include ../includes/header.frag
#import motionSampling from ../../libs/texture.glsl
#import MotionMoves, getMotionMoves from ../libs/motion.glsl

uniform int movesCount;			// 当其运动时, 它会经过过多少个整数倍的重复的周期.
uniform float directionAngle;	// 运动的方向在标准数轴中对应的角度.

// 这个函数类似于一个高斯分布函数, 关于 x=0.5 对称, 通过 (0, 0), (0.5, 1), (1, 0).
float getMotionSpeed(float x) {
	float y;
	if (x <= 0.5) {
		y = pow(2.0 * x, 3.0);
	}
	else {
		y = pow(2.0 * (1.0 - x), 3.0);
	}

	return y;
}

// 这个函数是 getMotionSpeed 的积分形式, 关于 x=0.5, y=0.5 对称, 通过 (0, 0), (0.5, 0.5), (1, 1), 并且在起始位置和结束位置都有较平滑的过渡.
float getMotionPasses(float x) {
	float y;
	if (x <= 0.5) {
		y = pow(2.0 * x, 4.0) * 0.5;
	}
	else {
		y = 1.0 - pow(2.0 * (1.0 - x), 3.0) * 0.5;
	}

	return y;
}

vec4 getFragColor() {
	// 计算运动距离和方向.
	MotionMoves moves = getMotionMoves(directionAngle, iResolution);
	vec2 direction = moves.direction;

	// 获得运动的像素总长, 等于起点到终点的向量在运动方向向量上的投影再乘以 movesCount.
	// 总长还需要在 XY 方向分别 round 为分辨率的 2 倍的整数倍, 以确保运动结束在 XY 方向刚好和边缘对齐.
	vec2 totalMoves = moves.length * direction * float(movesCount);
	vec2 roundTotalMoves = round(totalMoves / iResolution / 2.0) * iResolution * 2.0;
	vec2 currentMoves = roundTotalMoves * getMotionPasses(iProgress);

	// 获得当前点在还原经过移动之后的像素坐标, 然后使用其生成采样坐标.
	vec2 v = fTextureCoord * iResolution - currentMoves;
	vec2 textureCoord = v / iResolution;

	// 获得运动方向向量, 它根据 progress, 以及当前坐标距离中心点的距离变化.
	// 我们假设整个转场动画有 120 帧, 共移动 movesCount, 那么每一帧会移动 motionV.
	vec2 motionV = direction * getMotionSpeed(iProgress) * float(movesCount) / 120.0;

	vec4 color1 = motionSampling(iChannel[0], textureCoord, motionV, 16, 0.5);
	vec4 color2 = motionSampling(iChannel[1], textureCoord, motionV, 16, 0.5);

	// 在 65% 的 10% 左右范围进行过渡.
	float newRate = smoothstep(0.6, 0.7, iProgress);

	return mix(color1, color2, newRate);
}

void main() {
	fragColor = getFragColor();
}
