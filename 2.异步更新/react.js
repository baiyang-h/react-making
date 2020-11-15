import Component from './Component'

/**
 *
 * @param type          元素类型  可能是一个字符串（原生标签），也可能是一个组件（函数）
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
    return {   // React 元素，也就是 虚拟 dom、type 是元素类型 props元素的属性 vdom
        type,
        props
    }
}

let React = {
    createElement,
    Component
}

export default React


/*
React.createElement('h1', {
    className: 'title',
    style: {
        color: 'red'
    }
}, React.createElement('span', null, 'hello'), 'world')

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
