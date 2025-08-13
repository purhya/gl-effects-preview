#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

in vec2 fTextureCoord;	// 采样坐标.
out vec4 fragColor;		// 输出的颜色.

uniform vec2      iResolution;		// 输出图像的尺寸, 即画布尺寸.
uniform sampler2D iChannel[2];		// 输入待调色的图片对应的纹理.

vec4 getFragColor() {
    vec4 color = texture(iChannel[0], fTextureCoord);
	float alpha = texture(iChannel[1], fTextureCoord).a;

	// 边缘一般情况下获得 alpha 值为 0.5, 此时我们将 0.5-1 的范围拉长为 0~1 的范围.
    return color * (alpha * 2.0 - 1.0);
}

void main() {
	fragColor = getFragColor();
}