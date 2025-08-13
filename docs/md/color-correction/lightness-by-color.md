# 亮度 (Lightness) - 针对颜色调整


### 预览

<color-correction-preview-for-channel .name="lightness-by-color"></color-correction-preview-for-channel>


### 算法简介

针对颜色的亮度调整基于 HSL 颜色空间, 请参考 <https://en.wikipedia.org/wiki/HSL_and_HSV>.

请参考针对颜色的色相调整和通用的亮度调整.

其算法和饱和度调整类似, 不过仅仅针对某个色相调整亮度会产生非常容易被察觉的梯度变化, 所以最后的可调整范围被限制的较小.

亮度的调整和色相调整一样应用了根据 HSL 颜色空间的距离进行线性插值.