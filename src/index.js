// import React from 'react';
// import ReactDOM from 'react-dom';
import React from './react';
import ReactDOM from './react-dom';

class Welcome extends React.Component {
    render() {
        return <h1>hello, {this.props.name}</h1>
    }
}

let element = <Welcome name='aaa' />

console.log(element)

ReactDOM.render(
    element,
    document.getElementById('root')
);


/*
类组件 ---》 进过babel 转义，，

class Welcome extends React.Component {
    render() {
        return React.createElement("h1", null, "hello, ", this.props.name);
    }
}

在经过 react 转义，打印console.log(element) 

打印 React.createElement 的结果
{
    type: class Welcome,
    props: {
        name: "aaa"
    },
    key: null,
    ......
}

注意： 其实类和函数的 typeof xx  都是返回 'function'
*/

/*
1. React 元素可能是字符串（原生DOM类型），也可能一个函数（函数组件），也可能是一个类函数（类组件）
2. 在定义组件元素的时候，会把JSX所有的属性封装成一个props对象传递给组件
3. 组件的名称一定要首字母的大写，React 是通过首字母来区分原生还是自定义组件
4. 组件要先定义，在使用
5. 组件要返回并且只能返回一个 React 根元素 JSX

类组件时如何渲染的？
1. element 定义一个类组件 React 元素
2. render 
    2.1. 会先创建类组件的实例  new Welcome(props)  this.props = props
    2.2  调用实例的 render 方法得到一个 react 元素
    2.3  把这个 React 元素转换成真实的 DOM 元素并插入到页面中去
*/

/*
jsx = React.createElement  在浏览器执行的时候，createElement 方法返回值才是React元素=虚拟dom
jsx 是一种语法，或者是一种写代码的方法，打包的时候会进行编译，编译成 React.createElement
React.createElement 只是创建 React 元素的方法
虚拟DOM ，也就是一个普通的jsx对象，描述了真实DOM的样式
*/