#include ../includes/header.frag

uniform sampler2D polarSampler;		// 极坐标采样数据.
uniform float minimalPolarRadius;	// 极坐标采样数据的最小值.
uniform float blurRadius;			// 边缘模糊的半径, 相对于宽高的较大值的比率.

vec2 origin = vec2(0.5, 0.5);		// 中心点坐标.

vec4 getFragColor() {
	// 求出当前点在极坐标建模下的角度和半径, 角度为逆时针方向.
	vec2 originInPx = origin * iResolution;
	vec2 v = fTextureCoord * iResolution - originInPx;
	float r = length(v);
	float rad = atan(v.y, v.x);
	float angle = degrees(rad);

	//边缘的模糊边界, 其中的 1 为边缘 1px 平滑.
	float maxOfWH = max(iResolution.x, iResolution.y);
	float smoothPixels = maxOfWH * blurRadius + 1.0;

	// 计算当前的形状在当前的极坐标角度下应该扩张到哪里.
	// 这里首先确定最大扩张边界, 然后根据 progress 计算当前的边界.
	float shapeRadius = texture(polarSampler, vec2(angle / 360.0, 0.0)).r;
	float maxRadiusExtandRate = 1.0 / minimalPolarRadius;
	float totalRadius = maxRadiusExtandRate * maxOfWH / 2.0 + smoothPixels;
	float radiusBoundary = iProgress * shapeRadius * totalRadius;

	float oldRate = smoothstep(radiusBoundary - smoothPixels / 2.0, radiusBoundary + smoothPixels / 2.0, r);

	vec4 color1 = texture(iChannel[0], fTextureCoord);
	vec4 color2 = texture(iChannel[1], fTextureCoord);

	return mix(color1, color2, 1.0 - oldRate);
}

void main() { 
	fragColor = getFragColor();
}
