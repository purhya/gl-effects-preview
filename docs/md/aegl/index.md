# AEGL - 使用 OpenGL 渲染 AE 工程

AEGL 旨在使用 OpenGL 技术实时渲染 After Effects (AE) 工程的导出资源, 这个项目旨在递进地渲染 AE 的层和各类效果, 并且最终能够渲染大多数常用的 AE 效果.

这个项目会尽最大努力实现在较低端的设备也能全屏满帧率渲染, 并为此在基础架构部分做了大量的工作.



### 这里包含

这里包含了 AEGL 项目的架构信息, 以及一些已有模板的演示.



### 进度信息

- **Core**
	- [✓] 时间轴调度 (Timeline Scheduling)
	- [✓] 渲染树编译和优化 (Render Tree Compiling, Optimization)
	- [✓] 音乐同步和视频渲染 (Audio Sync and Video Rendering)
	- [✓] 坐标和变换 (Location and Transform)
	- [✓] 三维摄影机 (3D Camera)
	- [✓] 基于贴图的文字渲染 (Texture-based Text Rendering), 由于模版使用文字的大小是可预测的, 所以一般足够, 但是部分场景下仍然会因为二次采样而边缘模糊.

- **Effects**
	- [✓] 单个文字或者单个单词, 单个行的动画渲染 (Per Text / Per Word / Per Line Text Animation)
	- [✓] 运动模糊 (Motion Blur)
	- [✓] 快速高斯模糊, 径向模糊和投影 (Fast Gaussian Blur, Radial Blur, Drop Shadow).
	- [✓] 遮罩, 渐变遮罩和视频遮罩渲染 (Mask, Gradient Mask, Video Mask)
	- [✓] 渐变 (Ramp)
	- [✓] 填充 (Fill)
	- [✓] 颜色混合 (Color Blending) - Multiply, Screen, Overlay, Difference.
	- [✓] 色调映射 (Tint)
	- [✓] 动态平铺 (Motion Tile)
	- [✓] Gamma 映射 (Gamma Map)
	- [✓] 分形噪声 (Fractal Noise)
	- [✓] 位移映射 (Displacement Map)
	- [✓] 鱼眼镜头 (Bulge)

- **Plan to do but may never**
	- 基于形状的文字渲染 (Geometry-based Text Rendering)
	- 双三次插值采样图片 (Bicubic Interpolation Sampling for Images)
	- 曲线和形状, 以及描边 (Curve and Shapes Rendering and Stroking)
	- 提供通用的形状 (Provides Base Shapes)
	- 景深模糊 (Lens Blur)
	- 形状边缘扰动 (Roughen Edges)
	- 基本颜色滤镜 (Color Filters) - RGB Channel Adjustment, Gray, Sharp, More Color Blending, Matte, Hue, Saturation...
	- 发光效果 (Glow)
	- 文字阴影光照和浮雕特效 (Bevel Alpha)
	- 文字的粒子效果 (Text Particle)
	- 文字的路径动画 (Text Path Motion)
	- 基于字体几何属性的伪字体属性 (Faux Bold)



### 时间统计

以下是 AEGL 各个部分的消耗统计:

- 算法设计, 标定 (和 AE 对比参数差别然后拟合映射函数对齐), 15%.
- 资源分配调度以及渲染器, 着色代码编写, 30%.
- AE 插件编写以及调试, 40%.
- 导出视频以及优化, 15%.



### 为什么此项目会被舍弃

#### 1. 编码缓慢

此项目的首要目标是实时预览, 其次是直接编码视频并且输出. 只可许 wasm 版本的 ffmpeg 只有普通版本的 5% 左右的编码速度. 这导致 (在我的台式机上) 1080P 30帧的编码时长达到视频时长的 3 倍.

此外, 大部分模版都嵌有视频素材, 这些视频素材需要经由 ffmpeg 导出为帧图像并编码, 再由浏览器解码. 如果视频素材是透明的, 还需要额外编解码 Alpha 通道. 经此 (在我的台式机上) 1080P 30帧的编码时长轻松达到视频时长的 15 倍.

直到此项目废弃的一年多之后, 2021 年底 WebCodecs API 发布. 现在这个演示的视频编码使用的即是此 API, 它使得编码速度提升了 10 多倍.


#### 2. AE 插件难产

此项目的 AE 插件用于将 AE 模版导出为 AEGL 依赖的数据格式, 以及对资源的重编码和压缩. 但是此插件的开发非常困难.

为了缓解这种困难, 我搭建了一个使用 TypeScript 开发 AE 插件的环境, 并且很大程度上简化了其开发. 但是我仍然不得不面对:

- 数据格式混乱 - 看起来 AE 插件是外包并且由不同团队接手过, 里面充满了数据重复, 命名不规范不统一, 看起来就像是一个塞满了各种杂物的杂物间.
- 不稳定 - 每日卡死数十次, 一点也不夸张. 甚至让我锻炼出了每次死掉后两秒内重启的手速.


#### 3. AE 效果黑洞

一些动画插件例如 Motion Bro 非常强大, 它可以一键创建组合式的效果, 将一个图层分为几十个图层以及创建十几个特效. 但是对于渲染, 尤其是实时渲染而言, 困难重重.

大量的插件生成的参数无法直接导出, 只能按照频率采样.



### 关于 AEGL 的更多的思考

#### 目标和定位

首先, 我认为 AEGL 的目标不应该定在还原 AE 模版的渲染, 而在于塑造一个新的特效渲染系统:

- 不使用插件, 或者简化插件以仅导入 AE 模版的骨架.
- 可以交互式创建 AEGL 自己的模版, 不必依赖 AE.
- 字体管理和素材管理系统, 以及提供一个平台让设计师可以上传和分享制作的模版, 以及让用户使用这些模版.


#### 关于设计的想法

在编写 AEGL 时, 我发现通过非常简单的设计形式的组合可以产生震撼人心的效果. 但是我以及我身边的人都无法解释它是怎么产生的.

我一直梦想有一个 "超人" 般的角色作为搭档, 他熟知各类设计软件和设计风格, 熟知各种 颜色/形状/效果/声音 和人的情感的关联, 懂得如何使用简单的搭配制作出 **打动人** 的东西. 他既通人性, 又了解不同的文化元素和差异. 这大概是我缺失却又向往的.

