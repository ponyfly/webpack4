const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    vendor: ['jquery']
  },
  output: {
    path: path.resolve(__dirname, '..' , 'dist'),
    filename: 'dll/[name].dll.js',
    library: '_dll_[name]' // 全局变量名，其他模块会从此变量上获取里面模块
  },
  // manifest是描述文件
  plugins: [
    new webpack.DllPlugin({
      name: '_dll_[name]',
      path: path.resolve(__dirname, '..' , 'dist/dll/[name].manifest.json')
    })
  ]
}