require('./index.css')
require('./sub')
import $ from 'jquery'

$('.red').css({color: '#f6a'})
const p1 = Promise.resolve(1)
console.log('start')
p1.then((value) => console.log(value))
console.log(p1)