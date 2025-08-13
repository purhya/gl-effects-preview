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
/** 将向量旋转指定的弧度. */
vec2 rotate(vec2 v, float rad) {
	float sinValue = sin(rad);
	float cosValue = cos(rad);

	mat2 rotateMatrix = mat2(
		 cosValue, sinValue,
		-sinValue, cosValue
	);

	return rotateMatrix * v;
}

/** 将向量旋转指定的角度. */
vec2 rotateFromAngle(vec2 v, float angle) {
	return rotate(v, radians(angle));
}

/** 将弧度的旋转表示为向量. */
vec2 vectorFromRadians(float rad) {
	float sinValue = sin(rad);
	float cosValue = cos(rad);

	return vec2(cosValue, sinValue);
}

/** 将角度的旋转表示为向量. */
vec2 vectorFromAngle(float angle) {
	return vectorFromRadians(radians(angle));
}

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
