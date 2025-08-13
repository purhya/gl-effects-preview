# 着色程序 (Shader Program)

一个着色程序用于将 **当前的** 顶点数据以及纹理数据, 通过顶点和片元着色处理, 最终输出像素数据.

你可以同时创建多个着色程序, 但是需要在其绘制之前 **使用 / 激活** 它.

要想实现某个效果, 你可能需要进行多道着色, 也就是来回切换多个着色程序以进行绘制. 这些绘制的结果会叠加, 就像用不同的颜料来回涂抹一幅画一样.

注意着色程序编译顶点和片元着色代码是需要时间的, 在我的电脑上 (低配) 平均达到 30ms, 超过了一帧的时间. 所以如果对于实时性要求很高, 可以选择提前创建所有着色程序.

另一方面不同的绘制, 如果顶点和片元着色代码相同, 只是顶点和纹理数据不同, 那么其实可以重用该着色程序. 此重用需要在应用程序中做处理.



### 伪代码

<pre class="language-ts">
// 注意这是一个简化的 OpenGL 上下文模型, 没有区分 CPU 和 GPU 端的结构.
class OpenGLContext {

	currentProgram: ShaderProgram
	currentVertexObject: VertexObject
	textureUnits: TextureUnits

	useProgram(program) {
		currentProgram = program
	}

	uniformXX(location, value) {
		currentProgram.uniformValues[location] = value
	}

	draw() {
		use(currentVertexObject)
		use(textureUnits)
		drawBy(currentProgram)
	}
}

class ShaderProgram {
	vertexCode: string
	fragmentCode: string
	uniformValues: {location: value}
}
</pre>