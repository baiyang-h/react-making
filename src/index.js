import React from './react';
import ReactDOM from './react-dom';

let element = <h1 className='title' style={{ color: 'red' }}>
    <span>hello</span>
    world
</h1>

// 进过 babel 转义后， 上面的写法就是如下
// let element1 = React.createElement('h1', {
//     className: 'title',
//     style: {
//         color: 'red'
//     }
// }, React.createElement('span', null, 'hello'), 'world')

ReactDOM.render(
    element,
    document.getElementById('root')
);


/*
打印 React.createElement 的结果
{
    type: 'h1',
    props: {
        className: 'title',
        style: {
            color: 'red'
        },
        children: [
            {
                type: 'span',
                props: {
                    children: 'hello'
                }
            },
            world
        ]
    }
}
*/

/*
执行顺序：
1. 我们写代码的时候写的JSX
2. 打包的时候，会调用 webpack 中的 babel-loader 把 JSX 写法转换成 JS 写法 createElement
3. 我们在浏览器里执行 createElement，得到虚拟DOM，也就是 React 元素，他是一个普通的 JS 对象，描述了你在界面上想看到的 DOM 元素的样式。
4. 把 React 元素（虚拟DOM）给了 ReactDOM.render，render 会把虚拟 DOM 转为真是 DOM，并且插入页面。
 */
