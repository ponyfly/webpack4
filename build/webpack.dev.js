const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const base = require('./webpack.base')
const merge = require('webpack-merge')
const utils = require('./utils')

function getEntryHtml() {
  const entries = utils.getEntries('src/pages/*/index.html')
  let entryHtmls = []

  Object.keys(entries).forEach(name => {
    entryHtmls.push(new HtmlPlugin({
      template: entries[name],
      filename:`${name}.html`,
      chunks: [name]
    }))
  })
  return entryHtmls
}

module.exports = merge(base, {
  mode: 'development',
  output: {
    path: utils.absolutePath('dist'),
    filename: "js/[name].js",
    chunkFilename: "js/[name].js",
    publicPath: "/"
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    contentBase: utils.absolutePath('dist'), //静态文件根目录
    host: 'localhost',
    port: 9000, // 端口
    hot: true,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options:{
            cacheDirectory: true
          }
        },
        include: utils.absolutePath('src'),
        exclude: utils.absolutePath('node_modules')
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    ...getEntryHtml()
  ]
})


