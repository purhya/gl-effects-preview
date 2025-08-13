/** 返回旋转指定弧度对应的变换矩阵. */
mat2 rotationMatrix(float rad) {
	float sinValue = sin(rad);
	float cosValue = cos(rad);

	return mat2(
		 cosValue, sinValue,
		-sinValue, cosValue
	);
}

/** 返回旋转指定角度对应的变换矩阵. */
mat2 rotationMatrixFromAngle(float angle) {
	return rotationMatrix(radians(angle));
}

#export rotationMatrix, rotationMatrixFromAngle