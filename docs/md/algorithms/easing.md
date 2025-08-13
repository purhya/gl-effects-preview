# 缓动 (Easing)


### 参考

建议阅读 <<计算机图形学>> 的插值部分.

[Wiki of Bézier curve](https://en.wikipedia.org/wiki/B%C3%A9zier_curve)


### 缓动的重要性

如果你发现自己的动画总是和动画师调整的动画差了那么些感觉, 那么很有可能你未对一些关键的动画应用合适的缓动.

决定应用哪个缓动和具体的经验有很大的关系, 一般而言应当尽量还原现实中的物体的运动动作. 对此我没有太多的发言权, 请参考动画师的意见.


### 起始位置的缓动 (Ease in)

起始位置的缓动可以用简单的函数来模拟.

注意每一个缓动都有一个标准名称, 这些名称来源于 CSS 预编译语言 Sass, 可以使用这些名称作为词汇来进行沟通.

<div style="margin-top: 10px;">
	<f-row>
		<f-col .span="6">
			<header>ease in</header>
			<code>y = x^1.7</code>
			<function-curve .fn="y = Math.pow(x, 1.7)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease in quad</header>
			<code>y = x^2</code>
			<function-curve .fn="y = Math.pow(x, 2)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease in qubic</header>
			<code>y = x^3</code>
			<function-curve .fn="y = Math.pow(x, 3)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease in quart</header>
			<code>y = x^4</code>
			<function-curve .fn="y = Math.pow(x, 4)"></function-curve>
		</f-col>
	</f-row>
	<f-row style="margin-top: 30px;">
		<f-col .span="6">
			<header>ease in quint</header>
			<code>y = x^5</code>
			<function-curve .fn="y = Math.pow(x, 5)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease in sine</header>
			<code>y = 1 - cos(x)</code>
			<function-curve .fn="y = 1 - Math.cos(x * Math.PI / 2)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease in expo</header>
			<code>y = 2^(-10(1-x))</code>
			<function-curve .fn="y = Math.pow(2, -10 * (1 - x))"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease in circ</header>
			<code>y = (1-x^2)^0.5</code>
			<function-curve .fn="y = 1 - Math.sqrt(1 - x*x)"></function-curve>
		</f-col>
	</f-row>
	<f-row style="margin-top: 30px;">
		<f-col .span="24">
			<header>ease in back</header>
			<code>y = x^2 \* ((π/2 + 1) \* x - π/2)</code>
			<function-curve .fn="y = Math.pow(x, 2) * ((Math.PI/2 + 1) * x - Math.PI/2)"></function-curve>
		</f-col>
	</f-row>
</div>


### 结束位置的缓动 (Ease out)

结束位置的缓动也可以用简单的函数来模拟.

<div style="margin-top: 10px;">
	<f-row>
		<f-col .span="6">
			<header>ease out</header>
			<code>y = 1 - (1-x)^1.7</code>
			<function-curve .fn="y = 1 - Math.pow(1-x, 1.7)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease out quad</header>
			<code>y = (1-x)^2</code>
			<function-curve .fn="y = 1 - Math.pow(1-x, 2)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease out qubic</header>
			<code>y = 1 - (1-x)^3</code>
			<function-curve .fn="y = 1 - Math.pow(1-x, 3)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease out quart</header>
			<code>y = 1 - (1-x)^4</code>
			<function-curve .fn="y = 1 - Math.pow(1-x, 4)"></function-curve>
		</f-col>
	</f-row>
	<f-row style="margin-top: 30px;">
		<f-col .span="6">
			<header>ease out quint</header>
			<code>y = 1 - x^5</code>
			<function-curve .fn="y = 1 - Math.pow(1-x, 5)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease out sine</header>
			<code>y = sin(x)</code>
			<function-curve .fn="y = Math.sin(x * Math.PI / 2)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease out expo</header>
			<code>y = 1 - 2^(-10x)</code>
			<function-curve .fn="y = 1 - Math.pow(2, -10 * x)"></function-curve>
		</f-col>
		<f-col .span="6">
			<header>ease out circ</header>
			<code>y = (2x - x^2)^0.5</code>
			<function-curve .fn="y = Math.sqrt(2*x - x*x)"></function-curve>
		</f-col>
	</f-row>
	<f-row style="margin-top: 30px;">
		<f-col .span="24">
			<header>ease out back</header>
			<code>y = 1 - (1-x)^2 \* ((π/2 + 1) \* (1-x) - π/2)</code>
			<function-curve .fn="y = 1 - Math.pow((1-x), 2) * ((Math.PI/2 + 1) * (1-x) - Math.PI/2)"></function-curve>
		</f-col>
	</f-row>
</div>


### 贝塞尔曲线

如果需要起始和结束位置都有缓动, 函数会至少需要达到三次方, 理论上我们可以通过插值找到这样的函数, 但是使用贝塞尔曲线更加简单.

三次贝塞尔属于二元三次曲线, 但是由于它的 `x` 和 `y` 纠缠, 将其表达为 `y = f(x)` 的形式会比较困难或者表达式过于复杂不利于计算.

另外, 以上的缓动均有贝塞尔曲线对应, 其函数曲线几乎和以上的函数曲线重叠. 参数为:

| Ease in       | 参数                            |
| ---           | ---                             |
| ease-in       | `[0.420,  0.000, 1.000, 1.000]` |
| ease-in-quad  | `[0.550,  0.085, 0.680, 0.530]` |
| ease-in-cubic | `[0.550,  0.055, 0.675, 0.190]` |
| ease-in-quart | `[0.895,  0.030, 0.685, 0.220]` |
| ease-in-quint | `[0.755,  0.050, 0.855, 0.060]` |
| ease-in-sine  | `[0.470,  0.000, 0.745, 0.715]` |
| ease-in-expo  | `[0.950,  0.050, 0.795, 0.035]` |
| ease-in-circ  | `[0.600,  0.040, 0.980, 0.335]` |
| ease-in-back  | `[0.600, -0.280, 0.735, 0.045]` |


| Ease out       | 参数                            |
| ---            | ---                             |
| ease-out       | `[0.000,  0.000, 0.580, 1.000]` |
| ease-out-quad  | `[0.250,  0.460, 0.450, 0.940]` |
| ease-out-cubic | `[0.215,  0.610, 0.355, 1.000]` |
| ease-out-quart | `[0.165,  0.840, 0.440, 1.000]` |
| ease-out-quint | `[0.230,  1.000, 0.320, 1.000]` |
| ease-out-sine  | `[0.390,  0.575, 0.565, 1.000]` |
| ease-out-expo  | `[0.190,  1.000, 0.220, 1.000]` |
| ease-out-circ  | `[0.075,  0.820, 0.165, 1.000]` |
| ease-out-back  | `[0.175,  0.885, 0.320, 1.275]` |


### 贝塞尔曲线的算法

贝塞尔曲线的算法描述如下, 它根据一个已知的 `x` 求出对应的 `y`:

1. 曲线关于 `t` 的函数: `F(t) = (1-t)^3 * P0 + 3t(1-t)^2 * P1 + 3t^2(1-t)^2 * P2 + t^3 * P3`
2. 求 `F(t)` 的 `x` 方向的投影, 得到: `Px(t) = (1-t)^3 * x0 + 3t(1-t)^2 * x1 + 3t^2(1-t)^2 * x2 + t^3 * x3`.
3. 将以上函数展开为关于 `t` 的函数, 然后代入 `x0 = 0` 和 `x3 = 1` 得到: `Px(t) = (3x1 - 3x2 + 1) * t^3 + (-6x1 + 3x2) * t^2 + 3x1 * t`
4. 已知 `x`, 根据 `Px(t) = x` 计算 `t`. 可以使用二分法迭代, 精度大概为每迭代 10 次向小数点后移动 3 位 (2^10 约等于 10^3).
4. 根据求出的 `t` 再代入 `F(t)` 的 `y` 方向投影函数 (和以上的 `Px` 格式相同) 即可求出对应的 `y`.

注意该算法不太适宜于着色器端运行, 建议在 CPU 端运行然后将结果作为参数传入着色器.


### 首尾缓动 (Ease in out)

有一个常用函数, 它即实现了首尾缓动, GLSL 还内置了它作为一个函数: `smoothstep`.

<div style="margin-top: 10px;">
	<f-row>
		<f-col .span="12">
			<code>y = -2x^3 + 3x^2</code>
			<function-curve .fn="y = -2 * Math.pow(x, 3) + 3 * Math.pow(x, 2)"></function-curve>
		</f-col>
	</f-row>
</div>

它的特点是首尾处倒数为 0, 所以可以在边缘处得到更加自然的过渡.

如果希望首尾过渡的更加平缓, 可以使用以下函数, 它是我在 <https://thebookofshaders.com/11/> 上找到的.

<div style="margin-top: 10px;">
	<f-row>
		<f-col .span="12">
			<code>y = 6x^5 - 15x^4 + 10x^3</code>
			<function-curve .fn="y = 6 * Math.pow(x, 5) - 15 * Math.pow(x, 4) + 10 * Math.pow(x, 3)"></function-curve>
		</f-col>
	</f-row>
</div>


### 贝塞尔曲线首尾缓动 (Ease in out)

一般的首尾缓动还是通过贝塞尔曲线得到:

<div style="margin-top: 10px;">
	<f-row>
		<f-col .span="6">
			<header>ease in out</header>
			<code style="font-size: 12px;">[0.420,  0.000, 0.580, 1.000]</code>
			<bezier-function .name="ease-in-out"></bezier-function>
		</f-col>
		<f-col .span="6">
			<header>ease in out quad</header>
			<code style="font-size: 12px;">[0.455,  0.030, 0.515, 0.955]</code>
			<bezier-function .name="ease-in-out-quad"></bezier-function>
		</f-col>
		<f-col .span="6">
			<header>ease in out qubic</header>
			<code style="font-size: 12px;">[0.645,  0.045, 0.355, 1.000]</code>
			<bezier-function .name="ease-in-out-cubic"></bezier-function>
		</f-col>
		<f-col .span="6">
			<header>ease in out quart</header>
			<code style="font-size: 12px;">[0.770,  0.000, 0.175, 1.000]</code>
			<bezier-function .name="ease-in-out-quart"></bezier-function>
		</f-col>
	</f-row>
	<f-row style="margin-top: 30px;">
		<f-col .span="6">
			<header>ease in out quint</header>
			<code style="font-size: 12px;">[0.860,  0.000, 0.070, 1.000]</code>
			<bezier-function .name="ease-in-out-quint"></bezier-function>
		</f-col>
		<f-col .span="6">
			<header>ease in out sine</header>
			<code style="font-size: 12px;">[0.445,  0.050, 0.550, 0.950]</code>
			<bezier-function .name="ease-in-out-sine"></bezier-function>
		</f-col>
		<f-col .span="6">
			<header>ease in out expo</header>
			<code style="font-size: 12px;">[1.000,  0.000, 0.000, 1.000]</code>
			<bezier-function .name="ease-in-out-expo"></bezier-function>
		</f-col>
		<f-col .span="6">
			<header>ease in out circ</header>
			<code style="font-size: 12px;">[0.785,  0.135, 0.150, 0.860]</code>
			<bezier-function .name="ease-in-out-circ"></bezier-function>
		</f-col>
	</f-row>
	<f-row style="margin-top: 30px;">
		<f-col .span="6">
			<header>ease in out back</header>
			<code style="font-size: 12px;">[0.680, -0.550, 0.265, 1.550]</code>
			<bezier-function .name="ease-in-out-back"></bezier-function>
		</f-col>
	</f-row>
</div>