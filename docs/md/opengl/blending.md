# 混合 (Blending)


### 参考

<https://apoorvaj.io/alpha-compositing-opengl-blending-and-premultiplied-alpha/>


### 简介

我们已经非常熟悉 $RGBA$ 颜色模型, 同样在简单的 OpenGL 编程中, 我们直接返回对应的 $RGBA$ 颜色来进行绘制.

目前为止都没有问题, 直到你遇到混合:


### 颜色混合

颜色混合的方式有很多, OpenGL 内部通过 `glBlendEquation` 和 `glBlendFunc`, 以及对应的 `Seperate` 方法只能实现其中的一部分, 不过一般而言已经足够了. 为更多的混合模式, 可以将需要混合的两者都绘制于帧缓存内, 然后通过一个着色来完成.

最常见的混合类似于半透明的玻璃的混合, 它在 Adobe 系列软件中被称为 **Normal**, 直觉中来说就是前景颜色按照 (1 - 自己的透明度) 的比例透出背景颜色 (这里的下标 $_s$ 和 $_d$ 分别表示 Source 和 Destnation 颜色, 即上面的颜色和下面的颜色):

$$RGBA = RGBA_s + RGBA_d \times (1 - A_s)$$

这个公式可以简单帮助理解发生了什么事情, 不过实际上例如一个红色混合时, 最终结果的红色程度还和这个红色的 Alpha 正相关, 即:

$$
\begin{aligned}
	RGB \times A &= RGB_s \times A_s + RGB_d \times A_d \times (1 - A_s) \\\\
	A &= A_s + A_d \times (1 - A_s)
\end{aligned}
$$

这个计算并不被 OpenGL 的颜色混合函数直接支持, 所以在一般的情况下, 需要使用一步单独的着色来进行此计算, 或者使用预乘颜色.


### 预乘颜色

预乘颜色意思就是 $A$ 分量已经乘到了 $RGB$ 分量中, 例如一个颜色 $RGBA = (1, 1, 1, 0.5)$ 对应的预乘色为 $RGBA_m = (0.5, 0.5, 0.5, 0.5)$.

当你打算进行颜色的权重混合时, 预乘颜色的计算几乎总是可以简单表示为 $RGBA_{m1} \times Priority_{1} + RGBA_{m2} \times Priority_2$. 此时使用预乘颜色总是好于非预乘颜色, 当然前提是你完全理解了预乘颜色.


### OpenGL 中预乘颜色的应用

如果要混合多步绘制的颜色, 只需要设置 `glBlendEquation(GL_FUNC_ADD)` 和 `glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA)`, 然后每一步绘制都返回预乘颜色即可.

如果在一个着色内混合两个颜色, 可以参考上面的预乘颜色的权重混合以及 Normal 混合的公式.

此外, 可以使用 `glPixelStorei(glUNPACK_PREMULTIPLY_ALPHA_WEBGL, true)` 将输入纹理图片转为预乘模式颜色.