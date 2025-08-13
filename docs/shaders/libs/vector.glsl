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

#export rotate, vectorFromAngle, vectorFromRadians