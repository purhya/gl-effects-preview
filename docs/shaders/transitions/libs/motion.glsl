#import vectorFromAngle from ../../libs/vector.glsl

struct MotionMoves {
	vec2 start;
	vec2 end;
	vec2 direction;
	float length;
};

// 获得某个运动方向下会在屏幕上划过的距离.
MotionMoves getMotionMoves(float directionAngle, vec2 resolution) {
	// 运动方向的单位向量.
	vec2 direction = vectorFromAngle(directionAngle);

	// 运动的起点.
	vec2 start = vec2(
		direction.x >= 0.0 ? 0.0 : resolution.x,
		direction.y >= 0.0 ? 0.0 : resolution.y
	);

	// 运动的终点
	vec2 end = vec2(
		direction.x < 0.0 ? 0.0 : resolution.x,
		direction.y < 0.0 ? 0.0 : resolution.y
	);

	// 扫过的 px 总长, 等于起点到终点的向量在运动方向向量上的投影.
	float length = dot(end - start, direction);

	return MotionMoves(start, end, direction, length);
}

#export MotionMoves, getMotionMoves