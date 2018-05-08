const path = require('path')
const webpack = require('webpack')
module.exports = {
  entry: {
    vendor: ['jquery'] //jquery模块打包到一个动态连接库
  },
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: 'dll/[name].dll.js', //输出动态连接库的文件名称
    library: '_dll_[name]' //全局变量名称
  },
  plugins: [
    new webpack.DllPlugin({
      name: '_dll_[name]', //和output.library中一致，也就是输出的manifest.json中的 name值
      path: path.resolve(__dirname, '../dist/dll', '[name].manifest.json')
    })
  ]
}