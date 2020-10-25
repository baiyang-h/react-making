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
    let dom;
    if(typeof type === 'function') {    // 如果是一个函数组件的话
        return updateFunctionComponent(vdom);
    } else {   // 如果是一个原生的元素
        dom = document.createElement(type)
    }

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