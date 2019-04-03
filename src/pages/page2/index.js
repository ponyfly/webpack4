// math.js
import classA from '../../util/a';
import classB from '../../util/b';

let math = {
   teacher: 'math', age: 47
};

import (/* webpackChunkName:"async-class-c" */ '../../util/c').then(classC => {
   classC.push(math)
})

classA.push(math);
classB.push(math);