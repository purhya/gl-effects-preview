# 六边形像素化 (Hexagon Pixelate)

<transition-preview .names='["hexagon-pixelate-herizontal", "hexagon-pixelate-vertical", "hexagon-pixelate-noise-herizontal", "hexagon-pixelate-noise-vertical"]'></transition-preview>


### 算法简介

6 边形通过连接中心点形成网络然后使用一对基向量进行向量建模实现.

非 Noise 像素化的均匀采样通过梯度采样实现. 请参考 [梯度采样](#math/gradient-sampling).

另外非 Noise 像素化实现了像素块边缘的平滑, 所以在动画执行时看起来比较流畅.