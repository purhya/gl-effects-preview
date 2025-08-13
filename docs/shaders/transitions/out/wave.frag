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
#define PI 3.1415926

uniform float waveRadius;				// 波浪正弦波的半个周期, 相对于较长的一边的比率. 默认为 0.1.
uniform float waveStrength;				// 波浪的强度, 强度越高, 则因为震动较强, 照片越难看得清. 0~1, 默认 0.5.
uniform float photoDeep;				// 图片放置的位置距离水面的深度, 相对于较长的一边的比率. 深度越高, 则照片越难看得清. 0~1, 默认 0.1.
uniform float blurRadius;				// 波浪在扩散时边缘的模糊半径, 相对于较长的一边的比率, 建议设置的和 waveRadius 相同.
float refractiveIndexOfWater = 1.33;	// 水的折射率, 固定值.
float waveEndExtendingAt = 0.5;			// 在进度到达多少时结束波浪的扩散. 0~1.

// 根据 progress 返回当前的波浪强度, 它会在 waveEndExtendingAt 之后从 1 逐渐减为 0.
float getCurrentWaveStrength(float x) {
	return 1.0 - smoothstep(waveEndExtendingAt, 1.0, x);
}

vec4 getFragColor() {
	float currentWaveStrength = getCurrentWaveStrength(iProgress);
	float maxOfWH = max(iResolution.x, iResolution.y);

	// 由进度决定的波浪外延, 其长度以对角线为基础.
	float cornerRadius = length(iResolution) / 2.0;
	float maxRadius = cornerRadius * iProgress / waveEndExtendingAt;

	// 中间位置到当前位置的向量.
	vec2 coordRelativeToCenter = fTextureCoord * iResolution - 0.5 * iResolution;

	// 当前位置跟随波浪移动的方向向量.
	vec2 normalizedMovingVector = normalize(coordRelativeToCenter);

	// 当前位置距离中心点的半径.
	float radius = length(coordRelativeToCenter);

	// 从波浪外侧 (角度为 0) 向内递增的角度值, 每移动 waveRadius 递增 π.
	float sita = (maxRadius - radius) / (maxOfWH * waveRadius) * PI;

	// 当前位置的表面导数值 (sinx 函数的导数为 cosx), 它经过了预设的最大波浪强度和当前波浪强度来校正. 也可以称为表面切向量和向右的水平向量的旋转角的 tan 值.
	float tangentValue = cos(sita) * waveStrength * currentWaveStrength;

	// 当前位置的表面法向量到负的入射光线的旋转角, 这个角度等于切向量到向右的水平面向量的旋转角.
	float incidentAngle = atan(tangentValue);
	
	// 当前位置的深度, 等于基础深度加上当前波的函数值.
	float waveY = maxOfWH * ((sin(sita) + 1.0) * waveRadius / PI + photoDeep);

	// 计算光线折射, 然后将两个角度相减, 得到的 diffAngle 等于反射向量到向下垂直向量的旋转角. 也可以使用 refract 函数.
	float incidentSinValue = sin(incidentAngle);
	float refractionSinValue = sin(incidentAngle) / 1.33;
	float diffAngle = incidentAngle - asin(refractionSinValue);

	// 从原始的采样位置到新的采样位置的距离, 乘以当前位置的移动方向得到了采样位置偏移的向量.
	float moves = tan(diffAngle) * waveY;
	vec2 sampleCoordMoves = normalizedMovingVector * moves;
	vec2 sampleTextureCoordMoves = sampleCoordMoves / iResolution;

	// 对波浪边缘进行平滑, 新图的 alpha 值根据 radius 在 maxRadius 附近时从 1 过渡到 0, 半径通过 blurRadius 指定.
	// 为什么 blurRadius 指定的也是半径却要除以 2: 因为一般意义上的模糊半径指的是高斯模糊的半径,
	// 在边缘从物体表面到模糊结束位置刚好为模糊半径. 所以我们的渐变直径应该和模糊半径相等. 
	float radiusGradiantWidth = maxOfWH * blurRadius / 2.0;
	float alpha = 1.0 - smoothstep(maxRadius - radiusGradiantWidth, maxRadius + radiusGradiantWidth, radius);

	return mix(
		texture(iChannel[0], fTextureCoord),
		texture(iChannel[1], fTextureCoord + sampleTextureCoordMoves),
		alpha
	);
}

void main() {
	fragColor = getFragColor();
}
