# JSX和虚拟DOM

## JSX的执行过程


如下代码就是 JSX 代码
```javascript
let element = <h1 className='title' style={{ color: 'red' }}>
  <span>hello</span>
  world
</h1>
```
我们通过 babel 转义后就变成如下代码，即 React 内部就是定义了 React.createElement 方法来转为 虚拟dom的
```javascript
let element1 = React.createElement('h1', {
  className: 'title',
  style: {
    color: 'red'
  }
}, React.createElement('span', null, 'hello'), 'world')
```
执行该方法后，就类似于如下结构
```javascript
{
  type: 'h1',
  props: {
    children: 'hello'
  }
}
```
所以整体转化结构如下：
```
element =》 element1 =》 虚拟dom

1. element 进过 babel 转义成 React.createElement 的形式
2. React 内部 React.createElement 方法执行后的结果，就是一个虚拟 dom，打印后类似下面结构
3.
{
  type: 'h1',
  props: {
    children: 'hello'
  }
}
```
执行顺序：

1. 我们写代码的时候写的JSX
1. 打包的时候，会调用 webpack 中的 babel-loader 把 JSX 写法转换成 JS 写法 createElement
1. 我们在浏览器里执行 createElement，得到虚拟DOM，也就是 React 元素，他是一个普通的 JS 对象，描述了你在界面上想看到的 DOM 元素的样式。
1. 把 React 元素（虚拟DOM）给了 `ReactDOM.render`，`render` 会把虚拟 DOM 转为真是 DOM，并且插入页面。





## 虚拟DOM和render实现


接着上面的例子，将上面的JSX代码转为了 `React.createElement` 后，执行该方法得到的以下结果（去掉了暂时用不到的属性）：
```javascript
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
```
自己创建一个 react.js 文件，我们来编写 `createElement` 方法
```javascript
// react.js

/**
 *
 * @param type          元素类型
 * @param config        配置对象，一般来说就是属性对象
 * @param children      第一个儿子
 */

function createElement(type, config, children) {
    if(config) {    // 暂时我们只写一个简略版的，所以把不用到的属性给删除掉
        delete config._owner
        delete config._store
    }
    let props = {...config}
    // 因为 children 的参数可能会有很多个 createElement(type, config, children1, children2, children3, ...)
    if(arguments.length > 3) {   // children 表示 所有子元素
        children = Array.prototype.slice.call(arguments, 2)
    }
    // children 可能是数组（多于1个儿子），也可能是一个字符串或者数字，也可能是一个null，也可能是一个 react 元素
    props.children = children
    return {
        type,
        props
    }
}

let React = {
    createElement
}

export default React
```
通过这个方法可以生成虚拟dom，接着我们继续来创建一个 react-dom.js，用于将虚拟dom转为真是dom，并且插入到选定的节点中。
```javascript
/**
 * 虚拟DOM转换成真是DOM，并插入到容器里
 * @param vdom          虚拟dom
 * @param container     插入到哪个容器里
 */
function render(vdom, container) {
    const dom = createDOM(vdom)   // 将虚拟dom转换成真是dom
    container.appendChild(dom)
}

......

let ReactDOM = {
    render
}

export default ReactDOM
```
render 接受两个参数，一个是外部经过 React.createElement 转义后的虚拟dom，第二个参数是一个真是节点。该函数整体用途就是：

1. 将虚拟dom转为真实dom
1. 将真实dom插入到设定的容器中



接下来我们来说 `createDOM` 这个函数，该函数的作用就是讲虚拟dom转为真实dom，代码如下：
```javascript
**
 * 把虚拟dom变成真是dom
 * @param vdom    null、数字、字符串、react元素、不能是数组 都有可能
 */
function createDOM(vdom) {
    // 如果vdom是一个字符串或者数字的话，创建一个文本的DOM节点返回
    if(typeof vdom === 'string' || typeof vdom === 'number') {
        return document.createTextNode(vdom)
    }
    if(!vdom) {  // null等
        return ''
    }
    // 否则就是一个React 元素
    let { type, props } = vdom
    let dom = document.createElement(type)

    updateProps(dom, props);    // 更新属性， 把虚拟dom上的属性设置到真是dom上
    // 处理子节点，如果子节点就是一个单节点，并且是字符串或者数字的话，直接赋值
    if(typeof props.children === 'string' || typeof props.children === 'number') {
        dom.textContent = props.children
    } else if(typeof props.children === "object" && props.children.type) {   // 说明是一个单 react 元素节点  即 children: { type: 'xx', props: {xxx} }
        render(props.children, dom)
    } else if(Array.isArray(props.children)) {   //props.children 是一个数组的情况
        // 如果儿子是一个数组的话，就说明有多个子节点，循环插入
        reconcileChildren(props.children, dom);
    } else {  // 如果出现了其他的意外情况    null就是空串
        dom.textContent = props.children ? props.children.toString() : ''
    }
    return dom
}
```
```javascript
/**
 * 把子节点从虚拟DOM全部转成真实DOM并且插入到父节点中去
 * @param childrenVdom      子节点的虚拟DOM数组
 * @param parentDOM         父节点的真是DOM
 */
function reconcileChildren(childrenVdom, parentDOM) {
    childrenVdom.forEach(childVdom => render(childVdom, parentDOM))
}
```
这里我们会对vdom的类型先做判断，如果是字符串或者数字，如`（ReactDOM.render('123', xx)）` ，那么直接创建文本节点。


如果是null等类型直接返回空串。


如果是一个 React 元素虚拟dom节点，那么我们就要对这个vdom进行处理，如虚拟dom上的属性名，我们要将其定义到根据 type 属性创建一个真实节点上。这里将会执行一个 `updateProps(dom, props)` 方法，将创建的 type 真实节点和props属性传入，对dom增加属性。


其次，取 `props.children`  ，即该虚拟dom的子虚拟dom，然后进行操作，执行递归，完善了真个真实dom。


```javascript
/**
 * 把属性对象中的属性设置到dom元素上
 * @param dom       DOM元素
 * @param props     属性对象
 */
function updateProps(dom, props) {
    for(let key in props) {
        if(key === 'children') continue;   // children 要特殊处理
        if(key === 'style') {
            let styleObject = props[key]
            for(let key in styleObject) {
                dom.style[key] = styleObject[key]    // dom.style.color = 'red'
            }
        } else {
            dom[key] = props[key]    // dom.className = 'title'
        }
    }
}
```
`updateProps` 方法用于对属性进行定义和操作，将属性定义到创建的真实dom上。


完整代码
```javascript
/**
 * 虚拟DOM转换成真是DOM，并插入到容器里
 * @param vdom          虚拟dom
 * @param container     插入到哪个容器里
 */
function render(vdom, container) {
    const dom = createDOM(vdom)   // 将虚拟dom转换成真是dom
    container.appendChild(dom)
}

/**
 * 把虚拟dom变成真是dom
 * @param vdom    null、数字、字符串、react元素、不能是数组 都有可能
 */
function createDOM(vdom) {
    // 如果vdom是一个字符串或者数字的话，创建一个文本的DOM节点返回
    if(typeof vdom === 'string' || typeof vdom === 'number') {
        return document.createTextNode(vdom)
    }
    if(!vdom) {  // null等
        return ''
    }
    // 否则就是一个React 元素
    let { type, props } = vdom
    let dom = document.createElement(type)

    updateProps(dom, props);    // 更新属性， 把虚拟dom上的属性设置到真是dom上
    // 处理子节点，如果子节点就是一个单节点，并且是字符串或者数字的话，直接赋值
    if(typeof props.children === 'string' || typeof props.children === 'number') {
        dom.textContent = props.children
    } else if(typeof props.children === "object" && props.children.type) {   // 说明是一个单 react 元素节点  即 children: { type: 'xx', props: {xxx} }
        render(props.children, dom)
    } else if(Array.isArray(props.children)) {   //props.children 是一个数组的情况
        // 如果儿子是一个数组的话，就说明有多个子节点
        reconcileChildren(props.children, dom);
    } else {  // 如果出现了其他的意外情况    null就是空串
        dom.textContent = props.children ? props.children.toString() : ''
    }
    return dom
}

/**
 * 把子节点从虚拟DOM全部转成真实DOM并且插入到父节点中去
 * @param childrenVdom      子节点的虚拟DOM数组
 * @param parentDOM         父节点的真是DOM
 */
function reconcileChildren(childrenVdom, parentDOM) {
    childrenVdom.forEach(childVdom => render(childVdom, parentDOM))
}

/**
 * 把属性对象中的属性设置到dom元素上
 * @param dom       DOM元素
 * @param props     属性对象
 */
function updateProps(dom, props) {
    for(let key in props) {
        if(key === 'children') continue;   // children 要特殊处理
        if(key === 'style') {
            let styleObject = props[key]
            for(let key in styleObject) {
                dom.style[key] = styleObject[key]    // dom.style.color = 'red'
            }
        } else {
            dom[key] = props[key]    // dom.className = 'title'
        }
    }
}



let ReactDOM = {
    render
}

export default ReactDOM



/*
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
 */
```
