# 对比度 (Contrast)


### 预览

<color-correction-preview .name="contrast"></color-correction-preview>


### 算法简介

参考 <https://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-5-contrast-adjustment/>.

算法首先根据一个函数计算出调整因数, x 为调整百分比, y 为校正之后的因数:

`f = 259 * (x * 100 + 255) / (255 * (259 - x * 100))`

<function-curve .fn="y = 259 * (x * 100 + 255) / (255 * (259 - x * 100));" .xRange="[-1,1]"></function-curve>

然后将 RGB 偏离中间值 0.5 的距离按照该因数进行缩放.

注意对比度的调整非常容易产生截断从而丢失细节, 自然饱和度相比之下会好得多.

算法部分有一篇讲述函数的文章, 描述了这个函数的生成方式.
