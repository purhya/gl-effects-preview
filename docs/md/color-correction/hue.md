# 色相 (Hue)


### 预览

<color-correction-preview .name="hue"></color-correction-preview>


### 算法简介

色相的改变基于 HSL 颜色空间, 请参考 <https://en.wikipedia.org/wiki/HSL_and_HSV>.

具体的算法是将百分比映射到 -3~3 (-180°~180°), 通过色相偏移得到一个新的颜色.

除非你想反色, 否则整体调整色相会让照片变得非常糟糕, 所以建议使用单色色相只针对某个颜色调整色相.
