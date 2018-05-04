import '../css/product.css'
const p1 = Promise.resolve(1)
console.log('start')
p1.then((value) => console.log(value))
console.log(p1)