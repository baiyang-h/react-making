import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';



let element = <h1 className='title' style={{ color: 'red' }}>
    <span>hello</span>
    world
</h1>

// 进过 babel 转义后， 上面的写法就是如下
let element1 = React.createElement('h1', {
    className: 'title',
    style: {
        color: 'red'
    }
}, React.createElement('span', null, 'hello'), 'world')

console.log(element1)  // 打印 React.createElement 的结果，如下虚拟 dom
/*
jsx在webpack打包的时候，会走 babel-loader，babel-loader会把jsx转义成为 createElement
真正的浏览器跑的时候就是执行 createElement，在浏览器里运行的时候，才会执行 createElement方法得到 虚拟 dom
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

// ReactDOM 才是最核心干活的，它在浏览器里执行的时候，可以把 React 元素，也就是虚拟 DOM 转换成真是 DOM
ReactDOM.render(
  <App />,
  document.getElementById('root')
);

/*
执行顺序：
1. 我们写代码的时候写的JSX
2. 打包的时候，会调用 webpack 中的 babel-loader 把 JSX 写法转换成 JS 写法 createElement
3. 我们在浏览器里执行 createElement，得到虚拟DOM，也就是 React 元素，他是一个普通的 JS 对象，描述了你在界面上想看到的 DOM 元素的样式。
4. 把 React 元素（虚拟DOM）给了 ReactDOM.render，render 会把虚拟 DOM 转为真是 DOM，并且插入页面。
 */