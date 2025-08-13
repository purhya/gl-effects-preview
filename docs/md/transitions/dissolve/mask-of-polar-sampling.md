# 极坐标采样蒙版 (Mask of Polar Sampling)

<transition-preview .names='["heart", "star"]'></transition-preview>



### 极坐标数据采样

<svg-polar-sampling></svg-polar-sampling>



### 算法简介

蒙版通过极坐标采样获得形状数据, 所以可以随意调整边缘的模糊 (平滑) 范围. 不过它的形状必须为简单的类凸多边形. 对于一般的形状请使用 [形状蒙版](#transitions/dissolve/mask-of-shape).



### 建议的缓动方式

所有缓动均可.
