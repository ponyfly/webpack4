const webpack = require('webpack')
const utils = require('./utils')

module.exports = {
  entry: utils.getEntries('src/pages/*/index.js'),
  resolve: {
    extensions: ['.js']
  },
  devServer: {
    contentBase: utils.absolutePath('dist'), //静态文件根目录
    host: 'localhost',
    port: 9000, // 端口
    open: true
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[hash:6].[ext]',
              outputPath: 'imgs/'
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: 'html-withimg-loader'
      },
      {
        test: /\.(eot|ttf|woff|svg)$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV:JSON.stringify(process.env.NODE_ENV)
    }),
  ]
}