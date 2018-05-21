const glob = require('glob')
const HappyPack = require('happypack')
const os = require('os')
const webpack = require('webpack')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const merge = require('webpack-merge')

const base = require('./webpack.base')
const utils = require('./utils')

function getEntryHtml() {
  const entries = utils.getEntries('src/pages/*/index.html')
  let entryHtmls = []

  Object.keys(entries).forEach(name => {
    entryHtmls.push(new HtmlPlugin({
      template: entries[name],
      filename:`${name}.html`,
      chunks: [name, 'vendors', 'utils']
    }))
  })
  return entryHtmls
}

module.exports = merge(base, {
  mode: 'production',
  output: {
    path: utils.absolutePath('dist'),
    filename: "js/[name].[chunkhash:6].js",
    chunkFilename: "js/[name].[chunkhash:6].js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'happypack/loader?id=happy-babel-js', // 增加新的HappyPack构建loader
        },
        include: utils.absolutePath('src'),
        exclude: utils.absolutePath('node_modules')
      },
      {
        test: /\.css$/,
        use: [
          {loader: MiniCssExtractPlugin.loader},
          {loader: 'css-loader'},
          {loader: 'postcss-loader'}
        ],
        include: utils.absolutePath('src'),
        exclude: utils.absolutePath('node_modules'),
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks:'initial',
          minChunks: 2,
          priority: -10
        },
        vendors: {
          test:  /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',//可选initial async all,all=inintial+async,initial会提取所有的同步加载的公共模块，而async会提取异步引入的模块中的公共木模块
          priority: -20
        },
      },
    },
    // runtimeChunk: true,
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new CleanPlugin(['dist'],{
      root: utils.absolutePath(),
      exclude: ['dll']
    }),
    new webpack.HashedModuleIdsPlugin(),
    ...getEntryHtml(),
    // new HtmlWebpackIncludeAssetsPlugin({
    //   assets: [
    //     'dll/vendor.dll.js'
    //   ],
    //   append: false
    // }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:6].css",
    }),
    new HappyPack({
      id: 'happy-babel-js',
      loaders: ['babel-loader?cacheDirectory=true'],
      threadPool: happyThreadPool
    }),
    new WebpackParallelUglifyPlugin({
      cacheDir: utils.absolutePath('tmp'),
      uglifyJS: {
        output: {
          beautify: false, //不需要格式化
          comments: false //不保留注释
        },
        compress: {
          warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
          drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
          collapse_vars: true, // 内嵌定义了但是只用到一次的变量
          reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
        }
      }
    }),
    // new webpack.DllReferencePlugin({
    //   manifest: utils.absolutePath('dist/dll/vendor.manifest.json')
    // }),
    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
    })
  ]
})