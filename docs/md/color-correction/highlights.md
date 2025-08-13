# 高光 (Highlights)


### 预览

<color-correction-preview .name="highlights"></color-correction-preview>


### 算法简介

阴影的调整首先基于当前的颜色计算出一个归属于亮区的比例, 颜色越亮则比值越大, 然后根据这个比值来决定调整颜色的大小, 从而呈现更多亮色区域的细节.

Photoshop 实现的高光调整更好, 其实现方式和阴影类似, 请参考阴影.

最后的曲线函数如下, 其中 x 为原亮度值, y 为校正之后的亮度值:

<div>
<f-row>
	<f-col .span="6">
		<code>percent = -100</code>
		<function-curve .fn="y = 1 - Math.pow(1 - x, 1.5)"></function-curve>
	</f-col>
	<f-col .span="6">
		<code>percent = 100</code>
		<function-curve .fn="y = 1 - Math.pow(1 - x, 0.5)"></function-curve>
	</f-col>
<f-row>
</div>
