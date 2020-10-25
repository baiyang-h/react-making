import React from 'react';


let element = <h1 className='title' style={{ color: 'red' }}>
  <span>hello</span>
  world
</h1>


let element1 = React.createElement('h1', {
  className: 'title',
  style: {
    color: 'red'
  }
}, React.createElement('span', null, 'hello'), 'world')

/*
element =》 element1 =》 虚拟dom
1. element 进过 babel 转义成 React.createElement 的形式
2. React 内部 React.createElement 方法执行后的结果，就是一个虚拟 dom，打印后类似下面结构
{
  type: 'h1',
  props: {
    children: 'hello'
  }
}

*/


function App() {
  return (
    <div className="App">
      App
    </div>
  );
}

export default App;
