# Filmora 转场的逆向分析

注意这里未包含一些已在 [Video Editor](#transitions/analysis/video-editor) 中出现的转场.


#### 扭曲

 - `Butterfly Wave Scrawler`: 原始算法大致为准备一个强度变大再变小的 <a href="http://www.iquilezles.org/apps/graphtoy/?f1(x)=pow(2.71828,%20cos(x))-2%20*%20cos(4*x)%20+%20pow(sin((2*x%20-%203.1416)/24),5)">弦波</a> 扭曲图像, 然后对 RGB 还进行了分离. 这不是一个特别好看, 也不是一个接近真实物理场景的效果, 建议这个算法自己实现: 首先准备一个 X 方向和 Y 方向分别扰动水平面的弦波, 然后通过光线折射 (可以考虑光散, 即 RGB 颜色折射率不同) 计算纹理偏移. 参考已实现的 [Wave](#transitions/wave).
 - `Swirl`: 将每个像素点围绕中心跟随 progress 做指定长度的旋转 (反向采样), 这样越靠近中间转动角度越大, 需要注意的是可能会产生边缘锯齿, 可能模糊 1~2px 或者做运动模糊效果会更好.
 - ~~`Morph`: 根据新图像素的 RGB 值以及 progress 决定一个偏移值, 向不同的方向分别偏移每个通道, 然后从新的位置获得像素.~~
 - ~~`Flyeye`: 根据当前坐标在 XY 方向分别经过弦波处理产生的值来决定采样偏移, 所以呈现明显的周期性.~~



#### 模糊

 - `Dispersion Blur`: 对当前位置向各个通过叠加旋转生成的方向采样, 然后等比例混合.
 - `Blurry Roll, Cross Roll, Simple Roll, Flip Roll 系列`: 参考 [Video Editor](#transitions/analysis/video-editor) 中的 `Blur`.
 - ~~`Warp 系列`: 运动模糊.~~
 - `Cross Zoom`: 参考 [Video Editor](#transitions/analysis/video-editor) 中的 `Glow`.
 - `Worm Hole`: 运动模糊加鱼眼镜头.
 - `Fuzzy Zoom 系列`: 运动模糊加针线包镜头 (Pin Cushion, 鱼眼的反向).
 - `Shift Zoom 系列`: 中心的略微旋转加运动模糊.
 - `Whirl 系列`: 旋转加运动模糊, 可以动态调整旋转中心.



#### 溶解

 - ~~`Colour Distance, Evaporate 1, Polka Dot, Star`: 黑白的蒙版纹理, 然后对于指定的像素位置采样这个纹理, 越接近黑色, 旧图的像素会更快地转变为新图.~~



#### 几何变换: 

 - `Col Merge`: 对中轴对称处理之后对运动方向进行向量建模.
 - `Round Zoom Out, Round Zoom in`: 对半径建模.
 - `Zoom`: 和之前的 `Central-In` 类似, 选择从中点向一个方向投影, 然后再做对称处理. 注意这里原图的放大比例是线性的, 最终大概放大 40 倍.
 - `Col Split 系列, Row Split`: 中间状态为两个的等比例混合. 参考已实现的 `Split`.
 - `Topple`: 向量建模, 首先处理分隔线的运动, 其次压缩下面的部分的对应向量.
 - `Kaleidoscope`: 大致的算法是将跟随 progress 变换的极坐标的某个角度范围做镜像重复, 但是中间过渡和原图以及新图都不协调, 建议参考设计师的意见做重新设计.
 - `Undulating`: 根据极坐标建模, 边缘半径通过两个同周期, 但是跟随 progress 移动方向相反的两个正弦函数扰动.
 - `Erase, Push, Wipe 系列`: 向量建模, 根据向量长度滤波时可以使用 smoothstep 决定边缘的混合半径.
 - `Doorway`: 和 `Split` 相同, 只是中间会跟随剩余的空间缩小.
 - `Cross Split, Cross Merge`: XY 方向分别进行以上的 `Split` 形式的建模.
 - `Pinwheel`: 和 `Rays` 相同, 只是平滑半径不同.
 - `Diamond Zoom Out, Diamond Zoom In`: XY 方向分别向量建模, 把中点到当前像素的矢量分别投影到为刚才的 XY 向量上, 计算比例, 根据比例之和是否大于 1 滤波.
 - `Sweep Clockwise, Sweep Anticlockwise, Roll Clockwise, Roll Anticlockwise`: 极坐标建模, 根据角度进行滤波.
 - `Twrl`: 顶点建模, 或者逆向应用变换矩阵还原采样坐标.
 - `Drop Bounce`: 回弹的函数会稍后创建在公用库中.
 - `Skew Left Split, Skew Right Split, Skew Left Merge, Skew Right Merge`: 按中线向外的运动方向进行向量建模, 按向量长度进行滤波.
 - `Row Split, Row Merge`: 参考已实现的 `Split`.
 - `Rectangle Zoom In, Rectangle Zoom Out`: 参考已实现的 `Enlarge`.


#### 像素化

 - `Mosaic Replica:` 类似于 `Pixelate`, 所不同的图像会跟随颗粒化的程度增大而减小, 也就是使用向量建模时, 采样使用的坐标相对于某个原点的距离也跟随颗粒化的程度增大而增大.
 - `Mosaic:` 采样时的相对于原点的向量处理刚好和 `Mosaic Replica` 相反.
 - `Pixels In, Pixels Out`: 和 `Pixelate` 类似, 只是增加了原图放大, 新图从放大的状态缩小, 另外新图有透明度渐变. 这两个效果不是特别好, 建议实现时稍微改进下.



#### 条纹或者小块

 - `Bar`: 通过向量建模, 然后在向量的在 x 和 y 方向上分别实现一个梯度函数即可. 注意边缘平滑.
 - `Blind 1`: 这个效果很容易实现, 但是它的特征有很大的设计特性, 建议让设计师再设计后再实现.
 - `Blind`: 对新旧交替的一个周期进行建模, 方式和 `Stride-Merge` 相同.
 - `Wind`: 根据噪声生成条纹的初始位移, 然后位移随着 progress 增加.
 - `Col Wisk, Row Wisk`: 查找所在的条纹归属以及所在半区. 建议通过向量建模.
 - `Cross Wisk`: 和 `Col Wisk` 相同, 只不过横纵都有条纹, 两个条纹相交位置负负得正.
 - `Row Cos Whisk`: 两个正弦波的非交叉地带 (大于较大者或者小于较小者) 才会绘制条纹. 这个效果不是特别好, 建议改进一下.
 - `Row Cos Slide`: 和 `Row Cos Whisk` 类似, 但是图像会有跟随波形的位移. 这个效果不是特别好, 建议改进一下.
 - `Drop`: 条纹移动到顶部之后再反方向移动. 参考 `Stripe Merge`.
 - `Move Rectangle 系列`: 建立一个从中心向外逐渐变小的函数处理垂直方向的移动, 例如二次函数, 水平方向则固定速度向外移动, 然后找到当前像素最近的一个块, 再通过其矩形区域进行滤波处理. 看起来有点丑, 建议改进.
 - ~~`Cross Shutter 系列, Grid Zoom In, Grid Zoon Out`: 找到当前像素最近的一个块, 再通过其矩形区域进行滤波处理.~~
 - ~~`Vertical Shutter, Herizontal Shutter`: 寻找所处条纹, 然后条纹内根据条纹起点创建向量, 再根据向量长度进行滤波.~~


#### 3D
 
 - `Cube`: 这是一个标准的 3D 效果, 我个人建议这个通过 3D 顶点建模来实现, 只需要在变换矩阵中改变摄像机位置和角度即可, 如果需要纯着色器实现, 需要将当前坐标通过观察变换矩阵的逆矩阵还原到每个纹理的坐标, 然后经过多道纹理边缘的滤波来实现.
 - `Box Turn, Box Flip`: 3D 盒子翻转和运动模糊效果, 参考 `Cube` 以及 `Blur`. 注意在翻转结束后还会再度过渡一次.
 - `Orb, Fisheye 系列`: 和 `Box` 类似, 也使用了运动模糊, 不过它是使用鱼眼镜头效果 (r - r^3 / (p * rmax)), 中心在运动的起始位置, 镜头的扭曲度随着 progress 增大再逐步减小.
 - `Swap`: 和 `Cube` 类似, 只是新旧图的运动方式有区别.
 - `Roll Right Up`: 这个应该是一个 3D 效果, 显示这里实现的非常不好, 建议在 `Page Curl` 的基础上改进.



#### 物理效果

 - `Ripper` - 和周期很短的 `Wave` 类似, 如果向要实现它, 在半径方向方向一个弦波指定的函数做偏移即可.



#### 由于效果较差不予考虑的转场

 - `Crazy Parammetric Fun`: 噪点太多.
 - `Vertical Line, Herizontal Line`: 线没有任何规律性, 看起来有点扎眼. 如果想实现的话, 控制随机生成的线的密度即可, 例如像素生成的随机数大于某个随 progress 变化的阈值.
 - `Roll`: 比已实现的 `Page-Curl` 差太多了.
