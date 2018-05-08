const glob = require('glob')
const path = require('path')
const HappyPack = require('happypack')
const os = require('os')
const webpack = require('webpack')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const HtmlPlugin = require('html-webpack-plugin')
const ExtractPlugin = require('extract-text-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const PurifyCSSPlugin = require('purifycss-webpack')
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')

function absolutePath(otherPath='') {
  return path.resolve(__dirname, '..', otherPath)
}

function getEntries(paths) {
  const files = glob.sync(paths)
  let entries = {}

  files.forEach(filePath => {
    const toArray = filePath.split('/')
    const fileName = toArray[toArray.length - 2]
    entries[fileName] = filePath
  })

  return entries
}

function createHtml(entries) {
  let tarHtmls = []

  Object.keys(entries).forEach(name => {
    const htmlTempPlugin = new HtmlPlugin({
      template: absolutePath(`src/pages/${name}/index.html`),
      filename:`${name}.html`,
      chunks: [`runtime~${name}`, name, 'vendor.dll', 'vendors', 'utils']
    })
    tarHtmls.push(htmlTempPlugin)
  })

  return tarHtmls
}

const entries = getEntries(absolutePath('src/pages/*/index.js'))
const tartHtmls = createHtml(entries)

module.exports = {
  entry: entries,
  output: {
    path: absolutePath('dist'),
    filename: "js/[name].[chunkhash:6].js",
    chunkFilename: "js/[name].[chunkhash:6].js",
    publicPath: "/"
  },
  devServer: {
    contentBase: absolutePath('dist'), //静态文件根目录
    host: 'localhost',
    port: 9000, // 端口
    open: true
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'happypack/loader?id=happy-babel-js', // 增加新的HappyPack构建loader
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
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test:  /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'initial'
        },
        utils: {
          test: /[\\/]util[\\/]/,
          name: 'utils',
          chunks: 'initial',
          minSize: 0
        }
      }
    },
    runtimeChunk: true
  },
  plugins: [
    new CleanPlugin(['dist'],{
      root: absolutePath(),
      exclude: ["dll"]
    }),
    new webpack.DefinePlugin({
      NODE_ENV:JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.HashedModuleIdsPlugin(),
    ...tartHtmls,
    new HtmlWebpackIncludeAssetsPlugin({
      assets: [
        'dll/vendor.dll.js'
      ],
      append: false
    }),
    new HappyPack({
      id: 'happy-babel-js',
      loaders: ['babel-loader?cacheDirectory=true'],
      threadPool: happyThreadPool
    }),
    new ExtractPlugin({
      filename: "css/[name].[hash:6].css"
    }),
    new PurifyCSSPlugin({
      paths: glob.sync(absolutePath('src/pages/*/*.html'))
    }),
    new WebpackParallelUglifyPlugin({
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
    new webpack.DllReferencePlugin({
      manifest: absolutePath('dist/dll/vendor.manifest.json')
    })
  ]
}