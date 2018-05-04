const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractPlugin = require('extract-text-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')

function absolutePath(otherPath='') {
  return path.resolve(__dirname, '..', otherPath)
}

module.exports = {
  entry: {
    index: absolutePath('src/index/js/main.js'),
    product: absolutePath('src/product/js/product.js')
  },
  output: {
    path: absolutePath('dist'),
    filename: "[name].[hash:4].js",
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
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: absolutePath('tmp')
          },
        },
        include: absolutePath('src'),
        exclude: absolutePath('node_modules')
      },
      {
        test: /\.css$/,
        use: ExtractPlugin.extract({
          use: [
            {loader: 'css-loader'},
            {loader: 'postcss-loader'}
          ],
          publicPath: '../'
        }),
        include: absolutePath('src'),
        exclude: absolutePath('node_modules'),
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              outputPath: 'img/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanPlugin(['dist'],{
      root: absolutePath()
    }),
    new HtmlPlugin({
      template: absolutePath('src/index/index.html'),
      filename: 'index.html',
      chunks: ['index']
    }),
    new HtmlPlugin({
      template: absolutePath('src/product/index.html'),
      filename:'product.html',
      chunks: ['product']
    }),
    new ExtractPlugin({
      filename: "css/[name].[hash:4].css"
    })
  ]
}