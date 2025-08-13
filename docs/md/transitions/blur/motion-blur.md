# 运动模糊 (Motion Blur)

<transition-preview .names='["motion-blur-to-top", "motion-blur-to-bottom", "motion-blur-to-left", "motion-blur-to-right", "motion-blur-to-top-left", "motion-blur-to-top-right", "motion-blur-to-bottom-left", "motion-blur-to-bottom-right"]'></transition-preview>



### 算法简介

模糊了一个胶片在移动时产生的运动模糊.



### 建议的缓动方式

linear.

由于必须在片元着色器中知道当前的运动速度来进行运动模糊, 所以运动速度和缓动的处理在片元着色器中完成, 外层给予的缓动方式应当固定为 linear.
