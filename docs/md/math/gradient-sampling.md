# 梯度采样 (Gradient Sampling)

为了实现像素化, 模糊等效果, 均需要在某个超过 1px 的范围做均匀采样, 此时我们需要进行梯度采样.

OpenGL 3.0 提供的梯度采样函数为 `textureGrad(sampler2D, P, dPdx, dPdy)`, 还有几个变种函数, 意义相同.

梯度采样依据的是在纹理坐标内的坐标的 $P$ 的变化, 或者也将其分解为 $(\mu, \nu)$ 两个方向的变化, 相对于片元坐标系内的 $x$, $y$ 坐标的变化的偏导数, 即:

$dPdx = \frac{dP}{dx} = (\frac{d\mu}{dx}, \frac{d\nu}{dx})$

$dPdy = \frac{dP}{dy} = (\frac{d\mu}{dy}, \frac{d\nu}{dy})$

也可以写成:

$
\begin{pmatrix}
		dPdx \\\\
		dPdy \\\\
	\end{pmatrix}
 = 
 \begin{pmatrix}
		d\mu \\\\
		d\nu \\\\
	\end{pmatrix}
 \times
 \begin{pmatrix}
		\displaystyle \frac{1}{dx} & \displaystyle \frac{1}{dy}
	\end{pmatrix}
$



### 如何理解梯度采样

为了理解梯度采样, 我们首先假设纹理坐标系和片元坐标系完全对应, 那么 $d\mu$ 和 $dx$ 的变化方向相同, 而在 $dy$ 方向无变化. $d\nu$ 和 $dy$ 的变化方向相同, 而在 $dx$ 方向无变化:

![](md/images/2019-12-01_11-23-23.jpg)

$
\begin{pmatrix}
	dPdx \\\\
	dPdy \\\\
 \end{pmatrix}
 = 
 \begin{pmatrix}
	\frac{1}{resolution.x} & 0 \\\\
	0 & \frac{1}{resolution.y} \\\\
 \end{pmatrix}
$



##### 缩放

然后我们假设要将纹理缩小到原来的 1/2 倍, 此时 P 的变化速率提高到原来的两倍, 或者说 $d\mu$ 和 $d\nu$ 的值变为原来的两倍:

![](md/images/2019-12-01_11-24-57.jpg)

$
\begin{pmatrix}
	dPdx' \\\\
	dPdy' \\\\
 \end{pmatrix}
 =
 2
 \times
 \begin{pmatrix}
	dPdx \\\\
	dPdy \\\\
 \end{pmatrix}
= 
 \begin{pmatrix}
	\frac{2}{resolution.x} & 0 \\\\
	0 & \frac{2}{resolution.y} \\\\
 \end{pmatrix}
$



##### 旋转

然后我们假设将纹理逆时针方向旋转 θ°, P 的变化方向也会跟着旋转, 即:

![](md/images/2019-12-01_11-29-21.jpg)

$
\begin{pmatrix}
	dPdx' \\\\
	dPdy' \\\\
 \end{pmatrix}
 =
  \begin{pmatrix}
	\cos\theta  & \sin\theta \\\\
	-\sin\theta & \cos\theta \\\\
 \end{pmatrix}
 \times
 \begin{pmatrix}
	dPdx \\\\
	dPdy \\\\
 \end{pmatrix}
= 
 \begin{pmatrix}
	\frac{\cos\theta}{resolution.x} & \frac{\sin\theta}{resolution.y} \\\\
	\frac{-sin\theta}{resolution.x} & \frac{\cos\theta}{resolution.y} \\\\
 \end{pmatrix}
$



##### 总结

我们可以通过简单地分析 $d\mu$ 和 $d\nu$ 的变化, dPdx 为 ($d\mu$, $d\nu$) 在片元坐标系 x 方向的投影, dPdy 为 ($d\mu$, $d\nu$) 在片元坐标系 y 方向的投影.

反应在采样上面, 片元坐标系内的一个 1px 宽高的片元, 梯度采样为在纹理上会采样一块以 P 为中心点, dP 或者 ($d\mu$, $d\nu$) 决定方向的菱形.



### 像素化

为了实现像素化, 在采样时需要采样一个大块, 我们假设像素化颗粒的边长为 $r$, 那么:

$
\begin{pmatrix}
		dPdx \\\\
		dPdy \\\\
	\end{pmatrix}
 = 
 \begin{pmatrix}
	\frac{r}{resolution.x} & 0 \\\\
	0 & \frac{r}{resolution.y} \\\\
 \end{pmatrix}
$


如果希望旋转一定的角度获得一个倾斜的方形像素化, 拿上面的两个向量分别乘以旋转矩阵即可.



### 运动模糊

当运动时, 因为视觉暂留的缘故, 人眼会将前后几帧的图像重叠. 理论上应该有一个类似于高斯模糊一样的权重, 其中当前帧的权重应该最高. 不过在此我们只实现一个均值的运动方向模糊, 而带权重的模糊其实也可以通过不同半径, 不同权重的均值模糊来合成.

首先我们比对 $d\mu$, $d\nu$ 以及运动方向向量. 假设我们需要模糊前后长度为 l 的距离, 这个 l 随着运动速度的增加等比例增加, 那么采样会在运动方向上被拉长为 l 倍. 此时我们将 $d\mu$ 和 $d\nu$ 投影到运动方向, 分解为投影部分和投影垂直部分, 然后将投影的部分增大为原先的 l 倍, 再将其加上投影垂直部分还原. 看起来像是 $d\mu$, $d\nu$ 都向运动方向弯曲.

![](md/images/2019-12-01_15-29-49.jpg)

理论非常美好, 然而实现上有一个无法跨越的问题: 各向异性过滤. 所以 AEGL 最终选择的运动模糊的实现方式基于多重采样.



### 各向异性过滤

在我们实现运动模糊时, 很明显我们在运动方向需要的采样数目要远远高于其垂直方向, 但是 Mipmap 的结构设计只适合于 dPdx 和 dPdy 的长度比例接近于 1 时. 当他们的比例过大时, 我们需要开启各向异性过滤才能让他们很好地呈现, 得到一个接近于显示的纹理效果.

各向异性过滤的设置有一个最大值, 一般是 16, 当采样的表面倾斜时, 各向异性过滤会在 Mipmap 的某个层级或者某几个层次上进行多次的采样 (最大次数为设置值), 然后将他们按权重混合.

否则不管怎么进行采样, 对于运动模糊这类在运动方向需要的采样数目要远远高于其垂直方向的采样, 都不适合 (除非各向异性过滤的值能够设置的极其大).

所以在实际实现时, 建议还是在运动方向上手动采样多个像素然后加权.

关于如何获得运动模糊的每个像素的运动速度和方向, [GPU Terms](https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-27-motion-blur-post-processing-effect) 上有一篇很不错的文章, 它的大意是是通过当前时刻的每个像素的最终坐标, 转换为原始坐标, 然后减去上一次渲染的得到的最终坐标, 以得到其最终坐标变化的速度和方向.