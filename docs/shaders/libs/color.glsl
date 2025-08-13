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


#export blend, luminance;