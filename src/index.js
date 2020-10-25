// import React from 'react';
// import ReactDOM from 'react-dom';
import React from './react';
import ReactDOM from './react-dom';

function Welcome(props) {
    return <h1>hello, { props.name }</h1>
}

let element = <Welcome name='aaa' />

console.log(element)

ReactDOM.render(
    element,
    document.getElementById('root')
);


/*
打印 React.createElement 的结果
{
    type: ƒ Welcome(props)',
    props: {
        name: "aaa"
    },
    key: null
}
*/

/*
函数组件的渲染过程
1. 定义一个React元素，也就是虚拟DOM，他的type=Welcome函数
2. render方法会执行这个 Welcome 函数，并传入props对象，得到返回的虚拟DOM，（即 函数组件中的return虚拟dom）
3. 把返回的虚拟DOM转成真实DOM并插入到页面中去
 */
