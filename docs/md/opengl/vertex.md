# 顶点数据 (Vertex Data)

顶点数据用于供着色程序的顶点着色步骤使用. 顶点数据会包含用于多个顶点的结构数据, 例如一般都会包含当前顶点的的坐标以及采样坐标, 也可以包含其他的值标识当前顶点的某个状态.

顶点数据可以输出某个状态值, 这个值会在片元着色阶段, 根据到每个顶点的距离进行双线性插值. 这里并不会讨论这个, 网上可以找到非常详细的资料.

顶点数据被上传之后, 会获得一个 VAO 对象, 可以供多个着色对象使用, 不过需要为每一个着色器对象都设置顶点数据的内存布局结构. 理解内存布局非常重要, 不过因为资料很多, 这里也不会讨论.



### 伪代码

<pre class="language-ts">
// 注意这是一个简化的 OpenGL 上下文模型, 没有区分 CPU 和 GPU 端的结构.
class OpenGLContext {

	currentProgram: ShaderProgram
	currentVertexObject: VertexObject
	textureUnits: TextureUnits

	// 设置当前的着色程序如何解析顶点数据, 即设置顶点数据的内存布局.
	// 如果两个着色器使用同一份顶点数据, 那么需要为每一个着色器都做此设置.
	vertexAttribPointer() {
		setVertexDataLayoutForProgram(currentProgram)
	}

	bindVertexArray(vertexObject) {
		currentVertexObject = vertexObject
	}

	setVertexData(data) {
		currentVertexObject.data = data
	}

	bindVertexIndices(indices) {
		currentVertexObject.indices = indices
	}

	draw() {
		use(currentVertexObject)
		use(textureUnits)
		drawBy(currentProgram)
	}
}

class VertexObject {
	data: VertexData
	indices: VertexIndices
}
</pre>


### 顶点数据的管理

由于现实中很少会牵扯到几百万顶点的着色 (即使会出现, 其占用的显存仍然不大), 所以顶点大可以供一个着色程序专用.

不过如果让多个着色器程序共享一份顶点数据, 则可以稍微提升绘制效率. 不过这需要在应用程序中管理顶点数据.


### 顶点坐标的选择

尽管 OpenGL 最终使用 -1~1 的坐标范围进行裁剪并且映射到绘制区, 但是顶点坐标的运算过程中我们应当使用最熟悉的坐标形式, 例如左上角开始, 逐像素 +1 的坐标系统.

然后在顶点着色器中通过一个转换: 例如乘以一个转换矩阵, 或者做一个简单的线性运算转为 OpenGL 坐标即可.