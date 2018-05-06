require('./index.css')
require('./sub')
require('core-js/fn/array/find-index')
import $ from 'jquery'
import {sayUtil} from "../../util/util"


$('.red').css({color: '#f6a'}).click(()=> {
  location.href = '../product.html'
})
sayUtil()
function add(a, b) {
  return a + b
}
console.log(add(2,3))
const arr = [1,2,3,5,0]
const curIndex = arr.findIndex((d) => {
  return d === 2
})
console.log(curIndex)
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  },1000)
})

promise1.then((val) => {
  console.log(val)
}, (err) => {
  console.log(err)
})