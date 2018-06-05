1. 使用dll打包vue后，再使用`build:prod`打包业务代码时，vendor里面还有vue，也就是说在dll和vendor中同时存在vue

  原因：在prod.js中指定了引入vue的位置，但是在dll.js中没有指定vue，所以两次引入的vue不是同一个地址
  ```
  alias: {
    vue: 'vue/dist/vue.min.js'
  }
  ```
  解决方法：在dll.js加入上述代码

2.