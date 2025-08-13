#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

in vec2 fTextureCoord;	// 采样坐标.
out vec4 fragColor;		// 输出的颜色.

uniform vec2      iResolution;		// 输出图像的尺寸, 即画布尺寸.
uniform sampler2D iChannel[1];		// 输入待调色的图片对应的纹理.
uniform vec2      samplingRadius;	// 采样在 xy 两方向的模糊像素半径.

// 高斯模糊权重.
const vec2 guassBlurPriority[33] = vec2[](
	vec2(-16.0, 0.0138),
	vec2(-15.0, 0.0158),
	vec2(-14.0, 0.018),
	vec2(-13.0, 0.0203),
	vec2(-12.0, 0.0226),
	vec2(-11.0, 0.025),
	vec2(-10.0, 0.0274),
	vec2(-9.0, 0.0298),
	vec2(-8.0, 0.0321),
	vec2(-7.0, 0.0343),
	vec2(-6.0, 0.0364),
	vec2(-5.0, 0.0382),
	vec2(-4.0, 0.0397),
	vec2(-3.0, 0.0409),
	vec2(-2.0, 0.0418),
	vec2(-1.0, 0.0424),
	vec2(0.0, 0.0426),
	vec2(1.0, 0.0424),
	vec2(2.0, 0.0418),
	vec2(3.0, 0.0409),
	vec2(4.0, 0.0397),
	vec2(5.0, 0.0382),
	vec2(6.0, 0.0364),
	vec2(7.0, 0.0343),
	vec2(8.0, 0.0321),
	vec2(9.0, 0.0298),
	vec2(10.0, 0.0274),
	vec2(11.0, 0.025),
	vec2(12.0, 0.0226),
	vec2(13.0, 0.0203),
	vec2(14.0, 0.018),
	vec2(15.0, 0.0158),
	vec2(16.0, 0.0138)
);

/** 进行高斯模糊透明度采样. */
vec4 gaussBlurSampling() {
	vec4 color;
	float samplingCount = 32.0;
	vec2 d = samplingRadius / iResolution / samplingCount;

	for (int i = 0; i < 33; i++) {
		vec2 priority = guassBlurPriority[i];
		color += texture(iChannel[0], fTextureCoord - priority.x * d) * priority.y;
	}

    return color /= color.a;
}

vec4 getFragColor() {
    vec4 color = gaussBlurSampling();
    return color;
}

void main() {
	fragColor = getFragColor();
}