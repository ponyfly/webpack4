// english.js
import classA from '../../util/a';
import classB from '../../util/b';

let engligh = {
  teacher: 'english', age: 47
};

import (/* webpackChunkName:"async-class-c" */ '../../util/c').then(classC => {
  classC.push(engligh)
})

classA.push(engligh);
classB.push(engligh);
