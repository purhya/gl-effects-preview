# 色彩平衡 (Color Balance)

这里未像友商那样使用色温和色调, 而是像 Photoshop 那样调整色彩平衡, 这样能够独立调整每个颜色.


### 预览

<color-correction-preview .name="color-balance"></color-correction-preview>


### 算法简介

算法很简单, 将 RGB 分量的百分比转为 -0.5~0.5 的数字然后添加到对应的通道.
