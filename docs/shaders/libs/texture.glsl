#import noise2 from ./math.glsl


/** 类似于高斯模糊权重的一个二次权重, x 的范围从 0 ~ sampleCount, 必定经过 0. */
// 经过了 (0, 0), (0.5, 1), (1, 0)
float getMotionSamplingWeight(int index, int sampleCount) {
	// 注意这里的 +1, 否则的话首位的权重为 0, 没有意义.
	float x = float(index + 1) / float(sampleCount + 1);

	return 4.0 * x * (1.0 - x);
}

// 参考自: https://gl-transitions.com/editor/CrossZoom, https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-27-motion-blur-post-processing-effect
/** 向运动的方向进行采样然后按权重合并以近似实现运动模糊.
 * @param motionV 转换为采样坐标系内的矢量, 其长度等于模糊的半径. 其长度大致相当于每一帧该点所划过的长度, 注意 motionV 的长度不宜过长, 否则它会导致前后采样的长度过大而造成 GPU 缓存未命中率提高.
 * @param sampleCount 采样数目, 运动越快或者希望得到越高的平滑度则设置得越大. 常用的选择为 16, 32 或者 64.
 * @param frequency 偏移采样坐标的频率, 很小的频率, 例如值小于 1 会产生可见的波纹, 而值过大时则会产生噪点. 常用的选择为 2 或者 4.
 */
vec4 motionSampling(sampler2D sampler, vec2 textureCoord, vec2 motionV, int sampleCount, float frequency) {
	vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);

	// 这里为何不使用随机数而使用噪声: 因为两个相邻像素产生的随机数不连续, 随意采样会产生一定程度的差异, 从而产生噪点.
	float noiseValue = noise2(gl_FragCoord.xy * frequency);
	
	for (int i = 0; i < sampleCount; i++) {
		float rate = (float(i) + noiseValue) / float(sampleCount);

		// 朝运动方向的反方向进行采样.
		vec2 coord = textureCoord - rate * motionV;
		totalColor += texture(sampler, coord);
	}

	return totalColor / float(sampleCount);
}

#export motionSampling