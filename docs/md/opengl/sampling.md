# 采样 (Sampling)

### 采样参数

其中的 Linear 采样, 我们直觉上可能会认为其会采样一个小块, 然后做一个区域的颜色混合. 但是实际上它固定采样最近的四个像素, 即使采样时和纹理的像素完全对齐, 它仍会采样四个像素. 所以在纹理产生了比较大的缩放时, 应当设置 mipmap, 它会从几个金字塔形的贴图上选择合适的层级. 另外注意如果设置了 mipmap 采样, 那么必须手动调用在当前的纹理单元上调用 `generateMipmap()`, 否则采样会静默失败.

![Mipmap](https://webglfundamentals.org/webgl/lessons/resources/mipmap-low-res-enlarged.png)

关于采样以及采样参数, 这篇文章讲解的非常细致: [WebGL 三维纹理](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-textures.html), 上面的图片也来自于此.


### 如何设置采样方式

如何设置采样方式, 是一种绘制效率和绘制效果的平衡. 放大时的采样方式非常好理解, 这里只描述缩小时的采样方式的区别:

<transition-preview .names='["NEAREAST", "LINEAR", "NEAREST_MIPMAP_NEAREST", "NEAREST_MIPMAP_LINEAR", "LINEAR_MIPMAP_NEAREST", "LINEAR_MIPMAP_LINEAR"]' .paused></transition-preview>

 - Nearest: 读取最邻近的 `1` 个像素, 适用于原图缩放比例不大, 并且处于静态的情况, 或者像素画风.
 - Linear: 读取最邻近的 `4` 个像素做线性插值, 适用于原图缩放比例不算大, 并且会运动的情况.
 - NEAREST_MIPMAP_NEAREST: 读取最邻近的层上的 `1` 个像素, 适用于处于静态, 并且不是特别关心其细节的情况, 例如远处的物体.
 - NEAREST_MIPMAP_LINEAR: 读取两个层上的各 1 个像素共 `2` 个像素做线性插值, 仍然不是特别关心其细节, 但是物体的远近可能会产生变化, 例如会拉近的远处的物体. 不过由于在每个层上仍然使用临近插值, 在拉近的过程中会产生像素抖动.
 - LINEAR_MIPMAP_NEAREST: 读取最近的层上的 `4` 个像素做线性插值. 适用于远近不会发生大的变化但是会运动的物体.
 - LINEAR_MIPMAP_LINEAR: 读取两个层上的各 4 个像素共 `8` 个像素做线性插值. 适用于远近会发生大的变化的物体.

当开启了各向异性过滤时, 会在 mipmap 的某个层级或者某几个层次上进行多次的采样 (最大次数为设置值), 例如开启了 `x16`, 那么当物体表面偏斜角度很大时, 最大可能会在上面的采样的读取像素的基础上, 乘以 16, 但是如果物体表面正对着你, 那么仍然会维持上述的像素读取数目.

另外需要注意的是我们直觉上可能认为读取像素的数目和最后的绘制效率成反比, 但是实际上并不会, 因为我们前面说过 OpenGL 对于纹理数据的访问有非常多的优化, 这意味着在一个 GPU 单元开始着色之前, 可以预测它可能需要读取的采样数据并且提前将这些数据块加载到离它最近的缓存. 不过仍然建议尽量通过设置合适的采样方式来降低读取像素的数目.

![](md/images/2020-03-05_17-25-29.jpg)

### 采样器

前面说过如果两个着色程序使用同一份纹理数据, 不同的采样参数, 那么可能就得重新上传一份纹理数据.

不过从 OpenGL 3.0 开始, 支持为纹理单元设置采样器, 它会替代所在的纹理单元的纹理对象对应的采样参数, 并且还可以更改采样器的采样参数. 因此可以实现一份纹理数据, 轮换采样器来实现不同的采样方式. 如果单个着色使用了单个纹理数据, 不同的采样方式, 也可以将此纹理数据和不同的采样方式绑定到多个纹理单元.

<pre class="language-ts">
// 注意这是一个简化的 OpenGL 上下文模型, 没有区分 CPU 和 GPU 端的结构.
class OpenGLContext {
	
	currentProgram: ShaderProgram
	currentVertexObject: VertexObject

	textureUnits: TextureObject[] = Array[16]
	currentTextureIndex: number = 0
	samplersForUnits: Sampler[] = Array[16]

	bindSampler(index, sampler) {
		samplersForUnits[index] = sampler
	}

	draw() {
		use(currentVertexObject)
		use(textureUnits)
		drawBy(currentProgram)
	}
}
</pre>