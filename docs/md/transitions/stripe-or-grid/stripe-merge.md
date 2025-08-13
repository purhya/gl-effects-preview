# 条纹 (Stripe)

原 Scratch-Merge.

<transition-preview .names='["stripe-merge"]'></transition-preview>


### 算法简介

1. 首先创建根据 `progress` 生成条纹间隔的函数, 注意这个函数返回 float 值, 否则会造成条纹 step 方式步进, 而产生咯噔咯噔的感觉.
2. 计算当前的像素位置被包含于的一个条带周期.
3. 计算当前像素位于条带中的比例和背景中的比例, 然后进行混合.

请参考着色器代码.


### 建议的缓动方式

linear.

