# 2.实现函数组件

当是一个函数组件时，他被React内部转义过后的虚拟dom是怎么样的呢？他的 type 属性的值是怎么样的呢？
```javascript
function Welcome(props) {
    return <h1>hello, { props.name }</h1>
}

let element = <Welcome name='aaa' />

console.log(element)

ReactDOM.render(
    element,
    document.getElementById('root')
);
```
虚拟DOM 大概如下，type 的值是 Welcome 函数
```javascript
{
    type: ƒ Welcome(props)',
    props: {
        name: "aaa"
    },
    key: null
}
```
所以函数组件的渲染过程是：

1. 定义一个React元素，也就是虚拟DOM，他的`type=Welcome函数`
1. render方法会执行这个 Welcome 函数，并传入props对象，得到返回的虚拟DOM，（即 函数组件中的return虚拟dom）
1. 把返回的虚拟DOM转成真实DOM并插入到页面中去



主要修改了 createDOM 方法，增加了对于函数组件的判断
```javascript
function createDOM(vdom) {
    // 如果vdom是一个字符串或者数字的话，创建一个文本的DOM节点返回
//    if(typeof vdom === 'string' || typeof vdom === 'number') {
//        return document.createTextNode(vdom)
//    }
//    if(!vdom) {  // null等
//        return ''
//    }
    // 否则就是一个React 元素
//    let { type, props } = vdom
    let dom;
    if(typeof type === 'function') {    // 如果是一个函数组件的话
        return updateFunctionComponent(vdom);
    } else {   // 如果是一个原生的元素
        dom = document.createElement(type)
    }

//    updateProps(dom, props);    // 更新属性， 把虚拟dom上的属性设置到真是dom上
    // 处理子节点，如果子节点就是一个单节点，并且是字符串或者数字的话，直接赋值
//    if(typeof props.children === 'string' || typeof props.children === 'number') {
//        dom.textContent = props.children
//    } else if(typeof props.children === "object" && props.children.type) {   // 说明是一个单 react 元素节点  即 children: { type: 'xx', props: {xxx} }
//        render(props.children, dom)
//    } else if(Array.isArray(props.children)) {   //props.children 是一个数组的情况
        // 如果儿子是一个数组的话，就说明有多个子节点
//        reconcileChildren(props.children, dom);
//    } else {  // 如果出现了其他的意外情况    null就是空串
//        dom.textContent = props.children ? props.children.toString() : ''
//    }
//    return dom
}

/**
 * 函数组件转为真实DOM
 * @param vdom    组件的虚拟DOM React元素
 * vdom 是这个函数组件本身  {type: Welcome, props: {name: 'aaa'}}     我们需要的是这个函数组件返回的值得 虚拟dom
 * renderVdom  {type: 'h1', props: { children: 'hello, aaa' }}
 */
function updateFunctionComponent(vdom) {
    let { type, props } = vdom   // type 就是该组件函数
    let renderVdom = type(props)    // 可能是一个原生虚拟dom， 也可能还是一个函数组件虚拟dom， 总之 createDOM 中有递归
    return createDOM(renderVdom)
}
```
增加了对于函数的判断，会先执行函数，得到其返回结果，该结果的虚拟dom 传入createDOM方法中转为真实dom。
