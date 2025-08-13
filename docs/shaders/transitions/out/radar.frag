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
uniform float blurAngle;			// 边界平滑的角度范围.

vec2 origin = vec2(0.5, 0.5);		// 中心点坐标.

vec4 getFragColor() {
	float smoothRadians = radians(blurAngle);

	// 求出当前点在极坐标建模下的角度和半径, 角度为逆时针方向.
	vec2 originInPx = origin * iResolution;
	vec2 v = fTextureCoord * iResolution - originInPx;
	float r = length(v);
	float rad = atan(v.y, v.x);

	// 将当前点的角度转为以 startDirectionAngle 作参考的旋转角度, 再标准化.
	float radFromStart = mod(rad - radians(startDirectionAngle) + 2.0 * PI, 2.0 * PI);

	// 如果是顺时针, 将角度调转.
	if (moveDirection == 1) {
		radFromStart = 2.0 * PI - radFromStart;
	}

	// 总的需要划过的弧度, 由于首尾需要模糊, 所以需要额外移动来防止模糊区域在首尾显示.
	float totalRadians = 2.0 * PI + 2.0 * smoothRadians;

	// 进行平滑, 其中基础的 1px 平滑的范围对应的弧度为 1/r.
	float boundary = totalRadians * iProgress - smoothRadians;
	float smoothRange = 1.0 / r + smoothRadians;
	float oldRate = smoothstep(boundary - 0.5 * smoothRange, boundary + 0.5 * smoothRange, radFromStart);

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, 1.0 - oldRate);
}

void main() { 
	fragColor = getFragColor();
}
