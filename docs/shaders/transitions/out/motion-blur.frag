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

/** 类似于高斯模糊权重的一个二次权重, x 的范围从 0 ~ sampleCount, 必定经过 0. */
// 经过了 (0, 0), (0.5, 1), (1, 0)
float getMotionSamplingWeight(int index, int sampleCount) {
	// 注意这里的 +1, 否则的话首位的权重为 0, 没有意义.
	float x = float(index + 1) / float(sampleCount + 1);

	return 4.0 * x * (1.0 - x);
}

// 参考自: https://gl-transitions.com/editor/CrossZoom, https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-27-motion-blur-post-processing-effect
/** 向运动的方向进行采样然后按权重合并以近似实现运动模糊.
 * @param motionV 转换为采样坐标系内的矢量, 其长度等于模糊的半径. 其长度大致相当于每一帧该点所划过的长度, 注意 motionV 的长度不宜过长, 否则它会导致前后采样的长度过大而造成 GPU 缓存未命中率提高.
 * @param sampleCount 采样数目, 运动越快或者希望得到越高的平滑度则设置得越大. 常用的选择为 16, 32 或者 64.
 * @param frequency 偏移采样坐标的频率, 很小的频率, 例如值小于 1 会产生可见的波纹, 而值过大时则会产生噪点. 常用的选择为 2 或者 4.
 */
vec4 motionSampling(sampler2D sampler, vec2 textureCoord, vec2 motionV, int sampleCount, float frequency) {
	vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);

	// 这里为何不使用随机数而使用噪声: 因为两个相邻像素产生的随机数不连续, 随意采样会产生一定程度的差异, 从而产生噪点.
	float noiseValue = noise2(gl_FragCoord.xy * frequency);
	
	for (int i = 0; i < sampleCount; i++) {
		float rate = (float(i) + noiseValue) / float(sampleCount);

		// 朝运动方向的反方向进行采样.
		vec2 coord = textureCoord - rate * motionV;
		totalColor += texture(sampler, coord);
	}

	return totalColor / float(sampleCount);
}

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
