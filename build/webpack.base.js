const utils = require('./utils')

module.exports = {
  entry: utils.getEntries('src/pages/*/index.js'),
  resolve: {
    extensions: ['.js']
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
  }
}