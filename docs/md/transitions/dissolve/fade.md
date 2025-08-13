# 淡入淡出 (Fade)

原 Dissolve, Dissolve-Black, Dissolve-White.

<transition-preview .names='["fade", "fade-black", "fade-white"]'></transition-preview>


### 建议的缓动方式

所有缓动均可.


### 备注

如果你觉得 Fade-[Color] 中间的颜色变化过快, 可以在着色器中将目前的线性下降和上升的调整为一个大于 1 的次方来进行中间部分的缓动.