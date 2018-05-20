require('./index.css')
import {sayUtil} from "../../util/util"

import Vue from 'vue'

import {sub} from './sub'
import {sub2} from './sub2'
sayUtil()

console.log(sub, sub2)

const vm = new Vue({
  data: {
    msg: 'hello world'
  }
})

function add(a, b) {
  return a + b
}
console.log(add(2,3))
const arr = [1,2,3,5,6]
const curIndex = arr.findIndex((d) => {
  return d === 2
})
console.log(curIndex)
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('i am index 2888dfsad')
  },1000)
})

promise1.then((val) => {
  console.log(val)
}, (err) => {
  console.log(err)
})








if (module.hot) {
   module.hot.accept()
}
