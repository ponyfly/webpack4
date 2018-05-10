
const p2 = new Promise((resolve, reject) => {
  resolve('index')
  console.log('has resolved')
})
p2.then((val) => {
  console.log(val+10888)
})
document.write('sub writeda')