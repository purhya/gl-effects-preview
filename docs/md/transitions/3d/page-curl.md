# Page-Curl (卷曲翻页)

<transition-preview .names='["page-curl-to-top-left", "page-curl-to-top-right", "page-curl-to-bottom-left", "page-curl-to-bottom-right", "page-curl-to-right", "page-curl-to-left", "page-curl-to-top", "page-curl-to-bottom"]'></transition-preview>


### 算法简介

首先通过向量建模, 将之后的运算都投影到卷动方向上.

将渲染分为 6 个部分: 圆上方, 圆下方, 左侧阴影, 右侧阴影, 旧图, 新图, 然后融合取到的颜色.

请参考着色器代码.


### 建议的缓动方式

所有的缓动方式均可.

