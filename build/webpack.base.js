const utils = require('./utils')

module.exports = {
  entry: utils.getEntries('src/pages/*/index.js'),
  resolve: {
    extensions: ['.js'],
    alias: {
      vue: 'vue/dist/vue.min.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1,
              name: '[name].[ext]',
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
  }
}