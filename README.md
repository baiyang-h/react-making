# 3.实现类组件

继续上面函数组件的实现，现在来实现类组件。
```javascript
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
```
对类组件进行babel编译，转成代码如下：
```javascript
class Welcome extends React.Component {
    render() {
        return React.createElement("h1", null, "hello, ", this.props.name);
    }
}
```
通过打印 console.log 打印
```javascript
console.log(<Welcome name='aaa'>)

{
    type: class Welcome,
    props: {
        name: "aaa"
    },
    key: null,
    ......
}
```
> 注意：这里的 type 虽然显示是一个类，但是其实我们使用 typeof 得到的都是 'function'



定义一个 Component 类，用于集成
```javascript
//Component.js

class Component {

  static isReactComponent = true   // 加这个一个静态属性，可以使用它来区分是 类组件还是函数组件

  constructor(props) {
    this.props = props;
  }
}

export default Component
```
在自己的react文件中导入， 可用于 `import {Component} from 'react'` 导入
```javascript
// react

import Component from './Component'

......

let React = {
    createElement,
    Component
}

export default React
```
重点还是在我们的 `createDOM` 函数中，用于将虚拟dom转为真实dom
```javascript
function createDOM(vdom) {
  
  ......
  
  // 当时一个组件时
  let { type, props } = vdom
    let dom;
    // 如归是一个组件的话，还要区分到底是类组价还是函数组件,,  不过类和函数 的 typeof 都是 function
    if(typeof type === 'function') {    // 如果是一个函数组件的话

        if(type.isReactComponent) {  // 表示为类组件的虚拟DOM 元素
            return updateClassComponent(vdom);
        } else {   // 函数组件
            return updateFunctionComponent(vdom);
        }

    } else {   // 如果是一个原生的元素
        dom = document.createElement(type)
    }
}
```
```javascript
/**
 * 类组件转为真实DOM
 * 1. 创建类组件的实例
 * @param vdom    组件的虚拟DOM React元素
 */
function updateClassComponent(vdom) {
    let { type, props } = vdom
    let classInstance = new type(props)     // new Welcome({name: 'zhufeng'})
    let renderVdom = classInstance.render()    // <h1>hello, {this.props.name}</h1>  -> <h1>hello, aaa</h1>
    const dom = createDOM(renderVdom)
    // classInstance.dom = dom         // 让类组件实例上挂一个dom， 指向类组件的实例的真事DOM，这里暂时还用不到
    return dom
}
```


类组件时如何渲染的？

1. element 定义一个类组件 React 元素
1. render 
   1.  会先创建类组件的实例  new Welcome(props)  this.props = props
   1. 调用实例的 render 方法得到一个 react 元素
   1. 把这个 React 元素转换成真实的 DOM 元素并插入到页面中去
