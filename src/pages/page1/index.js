// chinese.js
import classA from '../../util/a';

let chinnese = {
   teacher: 'chinnese', age: 47
};

import (/* webpackChunkName:"async-class-b" */ '../../util/b').then(classB => {
   classB.push(chinnese)
})

import (/* webpackChunkName:"async-class-c" */ '../../util/c').then(classC => {
   classC.push(chinnese)
})

classA.push(chinnese);