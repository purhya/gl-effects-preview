# 阴影 (Shadows)


### 预览

<color-correction-preview .name="shadows"></color-correction-preview>


### 算法简介

阴影的调整首先基于当前的颜色计算出一个归属于暗区的比例, 颜色越暗则比值越大, 然后根据这个比值来决定调整颜色的大小, 从而呈现更多暗区域的细节.

Photoshop 实现的阴影调整非常完美, 它仅会调整一片暗区域, 而不会调整小的暗区域例如眼睛. 通过查找论文找到了大致的算法, 它是先通过高斯模糊处理, 然后便可以获得当前像素周围一个区域的大致亮度值, 再根据这个亮度选择 gamma 变换的幂. 这个算法可能不适合于着色器实现和处理视频.

最后的曲线函数如下, 其中 x 为原亮度值, y 为校正之后的亮度值:

<div>
<f-row>
	<f-col .span="6">
		<code>percent = -100</code>
		<function-curve .fn="y = Math.pow(x, 1.5)"></function-curve>
	</f-col>
	<f-col .span="6">
		<code>percent = 100</code>
		<function-curve .fn="y = Math.pow(x, 0.5)"></function-curve>
	</f-col>
<f-row>
</div>
