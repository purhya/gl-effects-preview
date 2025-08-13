# Slant-Wipe (斜线擦除)

<transition-preview .names='["slant-wipe-to-top-right", "slant-wipe-to-top-left", "slant-wipe-to-bottom-right", "slant-wipe-to-bottom-left"]'></transition-preview>


### 算法简介

通过向量建模, 将所有的运算投影到擦除方向上.

当前点对应的向量投影到擦除方向上, 根据得到的长度和新旧图的区分边界位置, 来进行 smoothstep.


### 建议的缓动方式

ease in out 或者 ease out.
