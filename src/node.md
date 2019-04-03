## splitChunks
---
```
// 这是默认配置
optimization: {
    minimize: true,
    splitChunks: {
      chunks: "async",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
```
### minSize
模块被抽离前最小的模块大小，以字节为单位，例如a.js(149b) 例如b.js(151b) 例如c.js(150b), 那么minSize设置为450b以上他们就不会抽离出来，如果设置为450b以下，他们会被抽离出来合并为新的文件
### chunks
#### async
打包后有五个文件：
例1

async-class-b.be1bc7.js
async-class-c.06460c.js
index.cde2f3.js
page1.bcbef5.js
page2.b8aa03.js

`async`只关心异步（动态）导入，即使english.js、 math.js 、chinese.js都引入了a.js,也不会被打包为一个单独的文件
#### initial
`initial`告诉webpack，将动态导入和非动态导入的文件分别打包，如果一个文件既被动态导入，也被非动态导入，则这个文件会被分离两次，分别打包到不同的文件中，设置默认配置的`chunks:initial`,打包后结果，如同例1,这是因为`minSize:30000`的影响，虽然我们三个文件都引入了a.js,但是a.js只有149b,所以不能单独打包
1. `chunks:initial, minSize: 30000`打包结果

`async-class-b.be1bc7.js,async-class-c.06460c.js,index.cde2f3.js,page1.bcbef5.js,page2.b8aa03.js`

2. `chunks:initial, minSize: 30`打包结果
打包结果为：
```
async-class-b.8df3c3.js
async-class-c.06460c.js
index~page1~page2.adbb88.js
index~page2.1d25d4.js
index.266816.js
page1.d6b7b3.js
page2.3defa3.js
```
因为index, page1, page2都引用了a.js,且a.js大于30b所以会分离出来一个`index~page1~page2.adbb88.js`,因为b.js被page1动态引入，所以分离出`async-class-b.8df3c3.js`,且被index和page2非动态引入，所以分离出`index~page2.1d25d4.js`
#### all
这个属性告诉webpack,不区分动态还是非动态
1. `chunks:all, minSize: 30`打包结果
```
async-class-b.be1bc7.js
async-class-c.06460c.js
index~page1~page2.adbb88.js
index.b1e95b.js
page1.d6727b.js
page2.0d53a3.js
```
b.js既被动态引入又被非动态引入，但是最终的名字是被动态引入时的名字`async-class-b.be1bc7.js`,而非`index~page2.1d25d4.js`,可能是只要这个模块被动态加载了一次，webpack就会按动态加载出来，共享给其他非动态模块
#### function
该方法返回一个boolean

```
chunks: function (chunk) {
            return chunk.name !== ''
        },
```
上例这样配置和`all`是一样的效果
```
chunks: function (chunk) {
            return chunk.name !== 'math'
},
```
上栗运行webpack，结果还是和 chunks: 'all' 几乎一样，但是仔细看`index~page1~page2.adbb88.js`文件变成了`page1~page2.fb2d0f.js`。打开index.3c09a3.js文件，在文件的下面你会发现a.js,b.js模块的全部内容，他们并没有被分离出去。但是c.js模块却被分离出去。仔细看文件最后的几行代码，c.js模块是动态加载的。

由此我们可以得出结论，当一个模块是非动态加载的那么他将不会被分离出去，如果这个模块是动态加载的，她就会被分离出去，并且还是动态引入关系。



