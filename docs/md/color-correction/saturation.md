# 饱和度 (Saturation)


### 预览

<color-correction-preview .name="saturation"></color-correction-preview>


### 算法简介

饱和度的调整基于 HSL 颜色空间, 请参考 <https://en.wikipedia.org/wiki/HSL_and_HSV>.

不过这里有一个问题, 如果饱和度值线性增加的话, 当超过 1 的时候, 如果我们简单地截断, 会造成一些区域原本有梯度分布的颜色被统一截断变成 "平地", 从而留下一些饱和度值为 1 的色斑.

为了既能够进行适当的缩放, 又能够保持梯度, 我们需要函数将原来的 0~1 再重新映射回 0~1.

所以我们可以使用一个缓动函数来控制, 其幂数大概控制在 0.3(-1) ~ 3(1).
