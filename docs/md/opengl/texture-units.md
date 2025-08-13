# 纹理单元 (Texture Units)

纹理单元是最容易让人晕头的东西, 每一个初学者估计都被纹理对象和纹理单元到底是啥玩意有啥区别折腾过.

和顶点数据类似, 只要显存不爆表, 纹理对象也可以存在很多个. 不过同一时刻只能激活最多 16 个 (跟具体的设备或者系统有关, 不过最低也有 8 个, 比较新的设备会有 32 个或者 64 个), 对应着 16 个纹理单元.

当我们需要进行某个着色时, 我们可以将它依赖的所有的纹理对象, 分配到一个纹理单元上, 然后这些纹理单元的索引作为参数传递给着色程序中的采样器参数. 所以单个着色最多只能使用最多 16 个纹理数据.

至于为什么不将纹理对象的引用直接作为着色器参数, 猜测可能跟 GPU 的缓存结构有关, 例如当纹理单元中存储某些纹理对象时, 可以将他们的数据拷贝到距离 GPU 核心更近的缓存. 所以越少修改纹理单元对应的纹理对象, 对于着色效率越有利.

纹理对象和顶点对象一样, 可供多个着色程序使用, 但是纹理对象设置了纹理参数之后, 实测更改这些参数无效. 所以如果两个着色程序使用同一份纹理数据, 不同的采样参数, 那么可能就得重新上传一份纹理数据了. 不过使用 OpenGL 3.0 支持的采样器可以避免这个问题.


### 伪代码

<pre class="language-ts">
// 注意这是一个简化的 OpenGL 上下文模型, 没有区分 CPU 和 GPU 端的结构.
class OpenGLContext {
	
	currentProgram: ShaderProgram
	currentVertexObject: VertexObject

	textureUnits: TextureObject[] = Array[16]
	currentTextureIndex: number = 0

	activeTexture(index) {
		currentTextureIndex = index
	}

	bindTexture(textureObject) {
		textureUnits[currentTextureIndex] = textureObject
	}

	texImage2D(data) {
		textureObject = textureUnits[currentTextureIndex]
		textureObject.textureData

		if (alreadyAllocateMemoryFor(textureObject)) {
			if (sizeOf(data) == allocatedSize(textureObject) {
				textureObject.textureData = data
			}
			else {
				// 替换数据失败.
			}
		}
		else {
			allocateMemoryFor(textureObject, sizeOf(data))
			textureObject.textureData = data
		}
	}

	texParameter(parameters) {
		textureUnits[currentTextureIndex].parameters = parameters
	}

	generateMipmap() {
		textureObject = textureUnits[currentTextureIndex]
		textureObject.mipmapData = generateMipmapFor(textureObject.data)
	}

	draw() {
		use(currentVertexObject)
		use(textureUnits)
		drawBy(currentProgram)
	}
}

interface TextureObject {
	textureData
	mipmapData
	parameters
}
</pre>



### 纹理数据的管理

首先我们要知道用于采样的纹理数据是以完全解码的像素格式存在的, 这意味着 200KB 的 1080p JPEG 图片会占用 1920 \* 1080 \* 4 = 8M 的显存. (也可能只占用内存, 即提交纹理数据时, CPU 将解码的纹理数据对应的内存块托管给 GPU 端, GPU 可以选择在需要的时候才将它们加载到显存中, 也可以选择立即将它们拷贝到显存中. 另有压缩纹理格式不会其压缩比较有限而且会牺牲访问速度)

所以在许多场景中, 无法将所有的纹理数据一次上传, 需要分阶段或者根据事件再进行上传.

另外如果已上传的纹理数据超过了纹理单元, 那么需要管理纹理单元, 将不同的着色过程中所需要的纹理数据轮流放入纹理单元, 然后将它们的纹理单元索引作为变量传递给着色程序.



### 纹理数据应用于动态索引访问

有一点需要注意, 着色器不支持任何的动态索引访问, 例如 `array[i]` 中 `i` 必须是常量或者在运行期不会更改的 uniform 类型变量, 不能是可变的变量, 这是为了保证其高度并行性的效率.

如果每个着色单元都需要访问整个一组数据, 那么将这些数据为每个着色单元都拷贝到其最近的缓存, 可能需要拷贝很多的数据, 而不拷贝就会需要访问速度更慢的缓存.

OpenGL 对于纹理数据的访问有非常多的优化, 如果这些索引数据以纹理的方式缓存, 那么根据临近的着色单元访问过的索引, 可以预测之后的着色单元可能会访问的索引并且提前将对应的数据块拷贝到距离这些单元最近的缓存.
