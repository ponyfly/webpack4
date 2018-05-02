const path = require('path')
const htmlPlugin = require('html-webpack-plugin')

function absolutePath(otherPath) {
  return path.resolve(__dirname, '..', otherPath)
}

module.exports = {
  entry: {
    index: absolutePath('src/index/js/main.js')
  },
  output: {
    path: absolutePath('dist'),
    filename: "[name].[hash].js"
  },
  devServer: {
    contentBase: absolutePath("dist"), //静态文件根目录
    port: 9000, // 端口
    host: 'localhost',
    overlay: true,
    compress: true // 服务器返回浏览器的时候是否启动gzip压缩
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: absolutePath('tmp')
          }
        },
        include: absolutePath('src'),
        exclude: absolutePath('node_modules')
      },
      {

      }
    ]
  },
  plugins: [
    new htmlPlugin({
      template: absolutePath('src/index/index.html')
    })
  ]
}