import $ from 'jquery'
const p2 = new Promise((resolve, reject) => {
  resolve('index')
  console.log('has resolved')
})
p2.then((val) => {
  console.log(val+10888)
})
document.write('sub writeda')
$('.red').css({color: '#f6a'}).click(()=> {
  location.href = '../product.html'
})

export const sub = 'sub'