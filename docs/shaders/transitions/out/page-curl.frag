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
/** 在区间上进行线性过渡, 区间左侧返回 1, 右侧返回 0. */
float linearstep(float min, float max, float value) {
	return clamp((value - min) / (max - min), 0.0, 1.0);
}

/** 
 * 类似于 `smoothstep`, 不过它用于一个范围的边界处插值, 在范围内返回 1, 范围外返回 1.
 * 边界处的插值区间由 `smoothRange` 决定.
 */
float rangestep(float minValue, float maxValue, float smoothRange, float value) {
	float valueToCenter = abs(value - (minValue + maxValue) / 2.0);
	float edgeValue = (maxValue - minValue) / 2.0;

	// 这一步非常重要, 如果区间范围小于平滑范围, 将平滑范围设置为区间范围.
	float halfRange = min(edgeValue, smoothRange / 2.0);

	return 1.0 - smoothstep(edgeValue - halfRange, edgeValue + halfRange, valueToCenter);
}

/** 混合两个颜色, 模式为我们正常观察透明物品的模式. 所有的输入颜色均经过了 alpha 预乘. */
vec4 blend(vec4 top, vec4 bottom) {
	vec3 finalRGB = top.rgb + bottom.rgb * (1.0 - top.a);
	float finalAlpha = top.a + bottom.a * (1.0 - top.a);

	return vec4(
		finalRGB,
		finalAlpha
	);
}

/** 获得颜色的亮度值. */
float luminance(vec3 color) {
	return color.r * 0.3 + color.g * 0.59 + color.b * 0.11;
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

uniform float curlRadius;		// 卷曲的半径, 默认为 0.05.
uniform float shadowBlurRadius;	// 卷曲的边缘的阴影模糊半径 (事实上不会真的模糊), 默认为 0.02, 即 curlRadius.
uniform float shadowAlphaRate;	// 卷曲的边缘的阴影的黑度, 默认为 0.2.
uniform float directionAngle;	// 卷曲的方向.
uniform float backfaceOpacity;	// 照片背面的透明度.

float ambientStrength = 0.4;
float lightStrength = 0.6;

// 只进行 [0, 1] 的范围采样, 范围外返回 0, 并且进行边缘的平滑.
float sampleTextureAlphaOnlyInRange(vec2 coord, float blurPixels) {
	vec2 dCoord = fwidth(coord) * blurPixels;
	float xAlpha = rangestep(0.0, 1.0, dCoord.x, coord.x);
	float yAlpha = rangestep(0.0, 1.0, dCoord.y, coord.y);

	return xAlpha * yAlpha;
}

// 只进行 [0, 1] 的范围采样, 范围外透明度设置为 0, 并且进行边缘的透明度平滑.
vec4 sampleTextureOnlyInRange(sampler2D channel, vec2 coord) {
	float alpha = sampleTextureAlphaOnlyInRange(coord, 1.0);
	vec4 color = texture(channel, coord);
	color *= alpha;

	return color;
}

// 添加阴影, angle 为向上的垂直向量到表面法向量旋转角.
vec4 addLightToColor(vec4 color, float angle) {
	// 漫反射比率.
	float diffuseRate = cos(angle);
	float light = ambientStrength + diffuseRate * lightStrength;

	// 将原始颜色按照光照强度降低, 剩余的分量混合黑色, 并且保持原始的透明度.
	return vec4(light * color.rgb, color.a);
}

vec4 getFragColor() {
	// 计算阴影半径.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float r = curlRadius * maxOfWH;
	float shadowR = shadowBlurRadius * maxOfWH;

	// 计算运动距离和方向.
	MotionMoves moves = getMotionMoves(directionAngle, iResolution);
	vec2 direction = moves.direction;
	vec2 origin = moves.start;

	// 扫过的 px 总长, 等于起点到终点的向量在运动方向向量上的投影. 我们称这条线为 运动方向线.
	// 这里要加上一个 shadowR 是因为我们要稍微向右多移动一点以隐藏左边的阴影.
	float totalLength = moves.length + shadowR;

	// 从起点到卷轴的中线位置在方向向量上的投影长度, 在 progress=0 时为 r, progress=1 时为 totalLength + r.
	float center = iProgress * totalLength + r;

	// 起点到当前位置的向量.
	vec2 v = fTextureCoord * iResolution - origin;

	// 起点到当前位置的向量在运动方向的投影.
	vec2 vProjectToDirection = dot(v, direction) * direction;

	// 垂直于运动方向, 从 运动方向线 的某个位置到当前位置的向量.
	vec2 vNormal = v - vProjectToDirection;

	// 当前位置在方向向量上的投影长度.
	float x = length(vProjectToDirection);

	// 在方向投影下, 当前位置到卷轴中点的距离, 卷轴的对应范围为 [-r, r].
	float xFromCenter = x - center;

	// 在纵切面投影下, 当前位置对应的卷轴顶部的点, 从最底部中点顺时针方向转动组成的旋转角. [-π/2, π/2].
	float angle = asin(clamp(xFromCenter / r, -1.0, 1.0));

	// 因为溢出了卷轴范围而需要将两边的透明度设置为 0, 稍后会用于乘以卷轴上下两部分的采样值.
	float curlAlpha = rangestep(-r, r, 1.0, xFromCenter);

	/* 处理顶部, 即照片背面. */
	// 在纵切面投影下, 当前位置对应的卷轴顶部的点, 到最底部中点的弧长.
	float topArcLength = r * (PI + angle);

	// 在方向投影下, 将上面的弧长展平到原纹理上, 以恢复起点到该点的长度.
	float topTextureCoordLength = center - topArcLength;

	// 恢复采样纹理的坐标, 由于在非投影方向没有任何变化, 所以我们将投影方向的向量加上原先的非投影方向的向量即可.
	vec2 topTextureCoord = (origin + topTextureCoordLength * direction + vNormal) / iResolution;

	// 只采样 [0, 1] 范围, 超出范围将透明度设置为 0, 并且进行边缘的透明度过渡. 然后混合照片背面的白色, 以及光源形成的阴影.
	vec4 topColor = sampleTextureOnlyInRange(iChannel[0], topTextureCoord);
	topColor = mix(topColor, vec4(topColor.a), 1.0 - backfaceOpacity);
	topColor = addLightToColor(topColor, angle);

	// 处理底部, 即照片正面.
	// 在纵切面投影下, 当前位置对应的卷轴底部的点, 到最底部中点的弧长.
	float bottomArcLength = r * (- angle);

	// 在方向投影下, 将下面的弧长展平到原纹理上, 以恢复起点到该点的长度.
	float bottomTextureCoordLength = center - bottomArcLength;

	// 恢复采样纹理的坐标, 由于在非投影方向没有任何变化, 所以我们将投影方向的向量加上原先的非投影方向的向量即可.
	vec2 bottomTextureCoord = (origin + bottomTextureCoordLength * direction + vNormal) / iResolution;

	// 只采样 [0, 1] 范围, 超出范围将透明度设置为 0, 并且进行边缘的透明度过渡.
	vec4 bottomColor = sampleTextureOnlyInRange(iChannel[0], bottomTextureCoord);
	bottomColor = addLightToColor(bottomColor, angle);

	// 如果是底部右侧范围, 这部分会直接在原图采样对应位置, 而不是在卷轴上采样. 左侧为 1, 右侧为 0.
	// 这里由于底部中心点和原图已经是连续的, 所以不用进行进行平滑.
	bottomColor *= (1.0 - step(0.0, xFromCenter));

	// 混合上面和下面的颜色得到了卷轴部分的颜色, 并且透明度叠加上上面得到的一个范围溢出检查.
	vec4 curlColor = blend(topColor, bottomColor);
	curlColor *= curlAlpha;

	
	// 旧图的采样, 左侧为 0, 右侧为 1. 由于底部中心点和卷轴底部已经是连续的, 所以不用进行进行平滑.
	float oldAlpha = step(0.0, xFromCenter);
	vec4 oldColor = texture(iChannel[0], fTextureCoord);
	oldColor *= oldAlpha;

	// 新图的采样
	vec4 newColor = texture(iChannel[1], fTextureCoord);

	// 左侧阴影, 以卷轴左侧半径为中心, shadowR 为半径.
	// 我们先检查卷轴最右侧位置的坐标是否能采样到纹理.
	float leftXFromCenter = center - 0.5 * PI * r;
	vec2 leftTextureCoord = (origin + leftXFromCenter * direction + vNormal) / iResolution;

	// 这是一个在滚动方向的垂直方向上随着到达了纹理边缘逐渐从 1 变为 0 的过渡.
	float leftShadowSampleAlpha = sampleTextureAlphaOnlyInRange(leftTextureCoord, 2.0 * shadowR);

	// center 在 0.5πr 时阴影由于到达了阈值会突然出现, 所以需要在 0.5πr ~ πr 之间进行过渡.
	float leftAppearanceShadowAlpha = smoothstep(0.5 * PI * r, 1.0 * PI * r, center);

	float leftShadowBlurAlpha = rangestep(-shadowR - r, shadowR - r, 2.0 * shadowR, xFromCenter);
	vec4 leftShadowColor = vec4(0.0, 0.0, 0.0, leftShadowBlurAlpha * leftShadowSampleAlpha * leftAppearanceShadowAlpha * shadowAlphaRate);

	// 右侧阴影, 以卷轴右侧半径为中心, shadowR 为半径.
	// 我们先检查卷轴最右侧位置的坐标是否能采样到纹理.
	float rightXFromCenter = center - 1.5 * PI * r;
	vec2 rightTextureCoord = (origin + rightXFromCenter * direction + vNormal) / iResolution;

	// 这是一个在滚动方向的垂直方向上随着到达了纹理边缘逐渐从 1 变为 0 的过渡.
	float rightShadowSampleAlpha = sampleTextureAlphaOnlyInRange(rightTextureCoord, 2.0 * shadowR);

	// center 在 1.5πr 时阴影由于到达了阈值会突然出现, 所以需要在 1.5πr ~ 2πr 之间进行过渡.
	float rightAppearanceShadowAlpha = smoothstep(1.5 * PI * r, 2.0 * PI * r, center);

	// 在滚动方向的阴影过渡.
	float rightShadowBlurAlpha = rangestep(-shadowR + r, shadowR + r, 2.0 * shadowR, xFromCenter);
	vec4 rightShadowColor = vec4(0.0, 0.0, 0.0, rightShadowSampleAlpha * rightShadowBlurAlpha * rightAppearanceShadowAlpha * shadowAlphaRate);

	// 混合所有颜色.
	vec4 color = curlColor;
	color = blend(color, rightShadowColor);	// 由于右侧阴影打在旧图上, 所以必须先于旧图混合.
	color = blend(color, oldColor);
	color = blend(color, leftShadowColor);	// 左侧阴影打在新图上.
	color = blend(color, newColor);

	return color;
}

void main() { 
	fragColor = getFragColor();
}
