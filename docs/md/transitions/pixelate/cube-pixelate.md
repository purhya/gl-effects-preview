# 方格像素化 (Cube Pixelate)

<transition-preview .names='["cube-pixelate", "slant-cube-pixelate", "glass-pixelate", "cube-pixelate-noise", "slant-cube-pixelate-noise"]'></transition-preview>


### 算法简介

通过向量建模实现.

非 Noise 像素化的均匀采样通过梯度采样实现. 请参考 [梯度采样](#math/gradient-sampling).

另外非 Noise 像素化实现了像素块边缘的平滑, 所以当动画进行中时可以看到方格边缘的过渡很自然, 但是单独静止看每一帧时会因为像素格边缘的过渡而看起来不是一个完美的像素化效果. 由于我们的转场是动画形式, 所以这里的选择是平滑优先, 如果使用在单张图片的处理中, 应当选择无任何过渡的模式.

`Glass-Pixelate` 是我偶然间因为 BUG 调出来的, 但是感觉效果还不错, 有点玻璃的质感, 所以放到了这里.