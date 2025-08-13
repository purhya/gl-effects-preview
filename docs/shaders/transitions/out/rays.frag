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

uniform float startDirectionAngle;	// 擦除的起始方向.
uniform int moveDirection;			// 擦除的方向, 顺时针为 1, 逆时针为 0.
uniform int raysCount;				// 射线数目.
uniform float blurRate;			    // 边界平滑的角度的百分比.

vec2 origin = vec2(0.5, 0.5);		// 中心点坐标.

vec4 getFragColor() {
	float rayRadians = 2.0 * PI / float(raysCount);
	float smoothRadians = rayRadians * blurRate;

	// 求出当前点在极坐标建模下的角度和半径, 角度为逆时针方向.
	vec2 originInPx = origin * iResolution;
	vec2 v = fTextureCoord * iResolution - originInPx;
	float r = length(v);
	float rad = atan(v.y, v.x);

	// 计算 rad 的梯度, 等于 fwidth(rad).
	float baseSmoothRange = 1.0 / r;

	// 将当前点的角度转为以 startDirectionAngle 作参考的旋转角度, 再标准化.
	// 由于我们需要在每个周期的起始位置做 1px 的平滑, 所以将角度略微往回转动半个平滑范围来保证中线的位置.
	float radFromStart = mod(rad - radians(startDirectionAngle) - baseSmoothRange / 2.0 + 2.0 * PI, 2.0 * PI);

	// 如果是顺时针, 将角度调转.
	if (moveDirection == 1) {
		radFromStart = 2.0 * PI - radFromStart;
	}

	float radInRay = mod(radFromStart, rayRadians);

	// 总的需要划过的弧度, 由于首尾需要模糊, 所以需要额外移动来防止模糊区域在首尾显示.
	float totalRadians = rayRadians + 2.0 * smoothRadians;

	// 进行平滑, 其中基础的 1px 平滑的范围对应的弧度为 1/r.
	float boundary = totalRadians * iProgress - smoothRadians;
	float smoothRange = baseSmoothRange + smoothRadians;
	float oldRate = smoothstep(boundary - 0.5 * smoothRange, boundary + 0.5 * smoothRange, radInRay);

	// 在左侧接缝处进行 1px 平滑.
	// 这里有一个很关键的步骤: 当转场接近结束的时候, 右侧变为 0, 但是这里的左侧仍保持 1, 前后的两个 ray 无法平滑连接.
	// 所以我们需要乘以上一个 Ray 周期的末尾处理平滑时传递过来的滤波, 它绝大部分时候保持 1, 直到转场末尾.
	float leftSmooth = 1.0 - smoothstep(0.0, baseSmoothRange, radInRay);
	float smoothFromPrevious = smoothstep(boundary - rayRadians - 0.5 * smoothRange, boundary - rayRadians + 0.5 * smoothRange, radInRay);
	leftSmooth *= smoothFromPrevious;
	oldRate = max(oldRate, leftSmooth);

	// 当转场进行完成后, 中间还会剩余一个很小的点. 我们在结束前的 5% 淡出.
	oldRate *= 1.0 - smoothstep(0.95, 1.0, iProgress);

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, 1.0 - oldRate);
}

void main() { 
	fragColor = getFragColor();
}
