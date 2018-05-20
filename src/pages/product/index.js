require('./index.css')
import $ from 'jquery'
import {sayUtil} from "../../util/util"

sayUtil()
$('.red').css({color: '#f6a'})
const p1 = Promise.resolve(1)
console.log('start')
p1.then((value) => console.log(value))
console.log(p1)