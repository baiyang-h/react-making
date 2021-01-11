import { addEvent } from './event'

/**
 * 虚拟DOM转换成真是DOM，并插入到容器里
 * @param vdom          虚拟dom
 * @param container     插入到哪个容器里
 */
function render(vdom, container) {
    const dom = createDOM(vdom)   // 将虚拟dom转换成真实dom
    container.appendChild(dom)
}

/**
 * 把虚拟dom变成真是dom
 * @param vdom    null、数字、字符串、react元素、不能是数组 都有可能
 */
export function createDOM(vdom) {
    // 如果vdom是一个字符串或者数字的话，创建一个文本的DOM节点返回
    if(typeof vdom === 'string' || typeof vdom === 'number') {
        return document.createTextNode(vdom)
    }
    if(!vdom) {  // null等
        return ''
    }
    // 否则就是一个React 元素
    let { type, props, ref } = vdom
    let dom;
    // 如归是一个组件的话，还要区分到底是类组价还是函数组件,,  不过类和函数 的 typeof 都是 function
    if(typeof type === 'function') {    // 如果是一个函数组件的话

        if(type.isReactComponent) {  // 表示为类组件的虚拟DOM 元素
            return updateClassComponent(vdom);
        } else {            // 函数组件
            return updateFunctionComponent(vdom);
        }

    } else {   // 如果是一个原生的元素
        dom = document.createElement(type)
    }

    updateProps(dom, props);    // 更新属性， 把虚拟dom上的属性设置到真实dom上
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
    if(ref) {
        ref.current = dom
    }

    return dom
}

/**
 * 类组件转为真实DOM
 * 1. 创建类组件的实例
 * 2. 调用实例的render方法得到将要渲染的React元素
 * 3. 把 React 元素转成真实 DOM， 挂载到父节点上就可以了
 * @param vdom    组件的虚拟DOM React元素
 */
function updateClassComponent(vdom) {
    let { type, props } = vdom
    let classInstance = new type(props)     // new Welcome({name: 'zhufeng'})
    vdom.classInstance = classInstance     //  让虚拟DOM的classInstance = 类组件实例 TODO

    if(classInstance.componentWillMount) {
        classInstance.componentWillMount();
    }

    let renderVdom = classInstance.render()    // <h1>hello, {this.props.name}</h1>  -> <h1>hello, aaa</h1>   的虚拟dom
    const dom = createDOM(renderVdom)   // 这里拿到真实dom
    //vdom 和 renderVdom 有什么区别？ <Counter /> vdom： 即 React.createElement(Counter) {type: Counter, ...} Counter实例。。。  renderVdom：是Counter实例的render方法返回值
    // vdom：{type: Counter, ...}     renderVdom：{type: 'div', ...}
    vdom.dom = renderVdom.dom = dom;   // 让这个类虚拟DOM的dom属性和rander方法返回的虚拟DOM的dom属性都指向真实DOM
    classInstance.oldVdom = renderVdom  // 让组价实例的老的vDom属性指向本次render出来的渲染
    classInstance.dom = dom         // 让类组件实例上挂一个dom， 指向类组件的实例的真事DOM，setState 会用到。即将老的 dom 先做保存

    if(classInstance.componentDidMount) {
        classInstance.componentDidMount();
    }

    return dom
}

/**
 * 函数组件转为真实DOM
 * @param vdom    组件的虚拟DOM React元素
 * vdom 是这个函数组件本身  {type: Welcome, props: {name: 'aaa'}}     我们需要的是这个函数组件返回的值得 虚拟dom
 * renderVdom  {type: 'h1', props: { children: 'hello, aaa' }}
 */
function updateFunctionComponent(vdom) {
    let { type, props } = vdom
    let renderVdom = type(props)    // 可能是一个原生虚拟dom， 也可能还是一个函数组件虚拟dom
    return createDOM(renderVdom)
}

/**
 * 把子节点从虚拟DOM全部转成真实DOM并且插入到父节点中去
 * @param childrenVdom      子节点的虚拟DOM数组
 * @param parentDOM         父节点的真实DOM
 */
function reconcileChildren(childrenVdom, parentDOM) {
    childrenVdom.forEach(childVdom => render(childVdom, parentDOM))
}

/**
 * 把属性对象中的属性设置到dom元素上
 * @param dom       DOM元素
 * @param oldProps  老属性对象
 * @param newProps     新属性对象
 */
function updateProps(dom, oldProps, newProps) {
    for(let key in newProps) {
        if(key === 'children') continue;   // children 要特殊处理
        if(key === 'style') {
            let styleObject = newProps[key]
            for(let key in styleObject) {
                dom.style[key] = styleObject[key]    // dom.style.color = 'red'
            }
        } else if(key.startsWith('on')) {   // 事件
            // dom[key.toLocaleLowerCase()] = newProps[key]    // 对 真实dom 绑定事件函数    dom.onclick=onClick函数
            // 第一个参数是 dom， 第二个参数是原生事件名，第三个参数是是事件函数
            addEvent(dom, key.toLocaleLowerCase(), newProps[key])
        } else {
            dom[key] = newProps[key]    // dom.className = 'title'
        }
    }
}

/**
 * DOM-DIFF 的比较更新了  找到老的虚拟dom 和 新的虚拟dom 的差异，把相应的差异更新到真实 dom 上
 * @param parentDOM  父的DOM节点  div#
 * @param oldVdom    老的 虚拟 dom
 * @param newVdom    新的 虚拟 dom
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom) {
    // 深度优先的对比规则
    if(oldVdom === null && newVdom === null) {
        return null
    } else if(oldVdom && newVdom === null) {
        let currentDOM = oldVdom.dom
        currentDOM.parentDOM.removeChild(currentDOM)
        if(oldVdom.classInstance && oldVdom.classInstance.componentWillUnmount) {
            oldVdom.classInstance.componentWillUnmount()
        }
        return null
    } else if(oldVdom === null && newVdom) {
        let newDOM = createDOM(newVdom)   // 创建一个新的 真实 DOM 并且挂载到父节点 DOM 上
        newVdom.dom = newDOM;
        // TODO 这个地方后期处理，不能用 appendChild ？ 一会再来解决这个问题
        parentDOM.appendChild(newDOM);
        return newVdom
    } else { // 新节点和老节点有值
        // 新老节点做比较
        updateElement(oldVdom, newVdom)
        return newVdom
    }
}

/**
 * 进入深度比较  是深度优先
 * DOM-DIFF的时候，React 为了优化性能有一些假设条件
 * 1. 不考虑跨层移动的情况（即，就只考虑同一层的比较）
 * @param oldVdom   老的虚拟DOM
 * @param newVdom   新的虚拟DOM
 */
function updateElement(oldVdom, newVdom) {
    let currentDOM =  newVdom.dom = oldVdom.dom;   // 获取 老的真实DOM
    newVdom.classInstance = oldVdom.classInstance
    if(typeof oldVdom.type === 'string') {   // 说明是 原生的DOM类型  div
        updateProps(currentDOM, oldVdom.props, newVdom.props)  // 先更新自己的属性，
        updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children)  // 然后更新儿子们的属性
    } else if(typeof oldVdom.type === 'function') {  // 就是类组件了
        updateClassInstance(oldVdom, newVdom);
    }
}

function updateChildren(parentDOM, oldVChildren, newVChildren) {

}

function updateClassInstance(oldVdom, newVdom) {

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
