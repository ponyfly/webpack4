import $ from 'jquery'
import {sayUtil} from "../../util/util"

sayUtil()

$('.bg-blue').css({fontSize: 60})

const p2 = new Promise((resolve, reject) => {
  resolve('product')
  console.log('has resolved')
})
p2.then((val) => {
  console.log(val)
})