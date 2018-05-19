const path = require('path')
const glob = require('glob')
//获取文件绝对路径
function absolutePath(otherPath='') {
  return path.resolve(__dirname, '..', otherPath)
}

//获取入口文件
function getEntries(paths) {
  const files = glob.sync(absolutePath(paths))
  let entries = {}

  files.forEach(filePath => {
    const toArray = filePath.split('/')
    const fileName = toArray[toArray.length - 2]
    entries[fileName] = filePath
  })

  return entries
}

module.exports = {
  absolutePath,
  getEntries
}