# 4.setState状态更新和事件绑定(冒泡)

## setState和事件绑定


### setState


当你在事件处理函数中执行 setState，组件并不会立刻渲染，而是先把更新存起来，等事件处理函数执行完了再会批量更新。

1. state是在事件处理函数中或生命周期函数中批量更新的
1. 其他地方都是直接同步更新的，比如 `setTimeout`



####  1. 几个例子


首先看几个特殊例子。


例子1：
```jsx
state = {
  number: 0
}

handleClick = () => {
  
  this.setState({
  	number: 1
  })
  
  console.log(this.state.number)    //0
  
  this.setState({
  	number: 1
  })
  
  console.log(this.state.number)   	//0
}

// 最终结果是 1
```


例子2：
```jsx
state = {
  number: 0
}

handleClick = () => {
  
  this.setState(preState => ({
    number: preState.number+1
  }))
  
  console.log(this.state.number)    //0
  
  this.setState(preState => ({
    number: preState.number+1
  }))
  
  console.log(this.state.number)   	//0
}

// 最终结果是 2， 因为上面每次 preState.number+1 其实内部 state.number 加了 1
```


注意，特殊情况来了，那么我们能不能在 setState 改变后，直接获取到 改变后的state状态呢？


1. 使用 setState 方法的第二个参数，一个回调函数。该回调函数中就是在改变状态后才会执行的
```jsx
this.setState({number: 1}, () => { /* 该回调函数会在状态改变后才执行 */ })
```


2. 在定时器中调用 setState 方法，后面去取 this.state 的值，已经是改变过后的值了。
```jsx
state = {
  number: 0
}

handleClick = () => {
  setTimeout(() => {    // 直接就更新了，react 管的着的地方都是异步的，， 其他都是同步的，如定时器
    this.setState(state => ({
      number: state.number + 1
    }))

    console.log(this.state.number)   // 1  注意这里是 1

    this.setState(state => ({
      number: state.number + 1
    }))

    console.log(this.state.number)   // 2  注意这里是 2
  })
}

// 最终结果是 2
```


#### 2. State 的更新可能是异步的


所以


1. 出于性能考虑，**React 可能会把多个 setState() 调用合并成一个调用**
1. 因为 this.props 和 this.state 可能会异步更新，所以你不要依赖他们的值来更新下一个状态
1. 可以让 setState() 接收一个函数而不是一个对象。这个函数用上一个 state 作为第一个参数



如下代码，我们将每次 setState方法的参数放入到一个 queue 队列中，在同一个执行栈过程中，最后 number 为最后一次被推入队列中的值
```javascript
class Updater {
  constructor() {
    this.state = {
      number: 0
    }
    this.queue = []
  }

  setState(newState) {
    this.queue.push(newState)
  }

  flush() {
    // 重点在这里
    for(let i=0; i<this.queue.length; i++) {
      let update = this.queue[i]
      if(typeof update === 'function') {
        /** 如果是函数，则将上一次的值赋给他 **/
        this.state = update(this.state)
      } else { 
        this.state = update
      }
    }
  }
}

let updater = new Updater()

updater.setState({number: 1})
updater.setState({number: 2})
updater.setState({number: 3})
updater.setState(prevState => ({
  number: prevState.number + 1
}))

updater.flush()

console.log(updater.state)
```


#### 3. State的更新会被合并


即原始 `state = {a: 1, b: 2}` ，我现在只改 `this.setState({b: 3})`，会对原始的 a 合并。并不会把整个对象覆盖掉。


如下，可以使用扩展运算符或者 `Object.assign` 进行合并，将老的和新的值合并
```javascript
flush() {
  for(let i=0; i<this.queue.length; i++) {
    let update = this.queue[i]
    if(typeof update === 'function') {
      /** 如果是函数，则将上一次的值赋给他 **/
      this.state = {...this.state, ...update(this.state)}
    } else {
      this.state = {...this.state, ...update}
    }
  }
}
```


## 事件


主要就是要谨慎处理 this 指向问题。

1. 用箭头函数，首选方案
1. 如果不使用箭头函数，普通函数中的 `this=undefined`， 可在 render 使用匿名函数
1. 可以在构造函数中重写 `this.handleClick`， 绑定 this 指针
1. 传参



## 同步更新和事件绑定


```javascript
import { createDOM } from './react-dom'

class Component {

  static isReactComponent = true   // 加这个一个静态属性，可以使用它来区分是 类组件还是函数组件

  constructor(props) {
    this.props = props;
    this.state = {};
  }

  /**
   * 更新状态--- 同步更新的逻辑
   * @param partialState  新的部分状态
   */
  setState(partialState) {
    this.state = {...this.state, ...partialState};   // 将老的状态和新的状态进行合并，得到一个新的状态
    let renderVdom = this.render();      // 重新调用render方法 得到新的虚拟DOM
    updateClassInstance(this, renderVdom);
  }
}

// 将新的虚拟DOM 转为 真实 DOM，并且替换掉老的虚拟 DOM
function updateClassInstance(classInstance, renderVdom) {
  let oldDOM = classInstance.dom;       // 获取老的 真实dom
  let newDOM = createDOM(renderVdom);   // 将虚拟dom 转为真实 dom
  oldDOM.parentNode.replaceChild(newDOM, oldDOM)    // 将新的DOM 替换掉 老的DOM
  classInstance.dom = newDOM          // 然后将现在的 DOM 挂载到 实例的dom属性上 做保存
}

export default Component
```
这里的`setState` 只暂时讲同步更新，主要做了以下几件事：

1. 将老的状态和新的状态进行合并，得到新的state
1. 重新调用render方法，得到新的虚拟DOM
1. 重新渲染，将新的虚拟DOM转为真实DOM。替换掉老的DOM，然后保存新的DOM



接下来是对事件做处理，将事件绑定到原生 dom 上


在 React 上的事件绑定如下：
```jsx
<div onClick={this.handleClick}>click</div>
```
在原生dom中绑定事件如下：
```html
<div onclick="handleClick()">click</div>
```
所以我们要做如下装换，将React的事件绑定转为原生dom的事件绑定
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
      ...
    } else if(key.startsWith('on')) {   // 事件
      dom[key.toLocaleLowerCase()] = props[key]    // 对 真实dom 绑定事件函数    dom.onclick=onClick函数
    } else {
      ...
    }
  }
}
```


## 实现同步更新


每次使用 setState 方法，就会调用 实例上 绑定的 update 属性，而该属性的值，是一个 Update 实例对象，并且将当前实例传入。
```javascript
class Component {
  ...
  constructor(props) {
    this.props = props;
    this.state = {};
    // 会为每一个组件实例配一个 Updater 类的实例
    this.updater = new Updater(this)
  }
	
	/**
   * 更新状态--- 同步更新的逻辑
   * @param partialState  新的部分状态
   */
  setState(partialState) {
    // this.state = {...this.state, ...partialState};   // 将老的状态和新的状态进行合并，得到一个新的状态
    // let renderVdom = this.render();      // 重新调用render方法 得到新的虚拟DOM
    // updateClassInstance(this, renderVdom);

    // 改造，上面是初步实现的时候的代码， 下面继续
		
    this.updater.addState(partialState)
  }

	// 强制更新
  forceUpdate() {
    let renderVdom = this.render()
    updateClassComponent(this, renderVdom)
  }
	
}

function updateClassComponent(classInstance, renderVdom) {
  let oldDOM = classInstance.dom
  let newDOM = createDOM(renderVdom)
  oldDOM.parentNode.replaceChild(newDOM, oldDOM)
  classInstance.dom = newDOM
}
```


接下来来声明一个 Update 类
```javascript
class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;     //类组件的实例
    this.pendingStates = []     // 等待更新的状态
  }

  addState(partialState) {
    // 先把这个分状态添加到 pendingStates 数组中去
    this.pendingStates.push(partialState)
    // 如果当前处于批量更新模式，也就是异步更新模式，把当前的 uodate 实例放到 updateQueue 里
    // 如果是非批量更新，也就是同步更新的话，则调用updateComponent直接更新
    this.updateComponent()
  }

  // 更新组件
  updateComponent() {  // 开始真正用 pendingStates 更新状态 this.state
    let { classInstance, pendingStates } = this
    if(pendingStates.length) {   // 说明有等待更新的状态
      // 组件的老状态和数组中的新状态合并后得到最后的新状态
      classInstance.state = this.getState()
      classInstance.forceUpdate()   // 让组件强行更新
    }
  }

  getState() {    // 根据老状态和等待生效的新状态，得到最后新状态
    let { classInstance, pendingStates } = this
    let { state } = classInstance       // counter.state
    if(pendingStates.length) {   // 说明有等待更新的状态
      pendingStates.forEach(nextState => {
        if(isFunction(nextState)) {    // 如果是函数的话
          nextState = nextState(state)
        }
        state = {...state, ...nextState}    // 用新状态覆盖老状态
      })
      pendingStates.length = 0
    }
    return state
  }
}
```
此时就实现了同步更新
```jsx
handleClick = () => {
  this.setState({
    number: this.state.number+1    
  })
  console.log(this.state.number)   // 1

  this.setState({
    number: this.state.number+1
  })
  console.log(this.state.number)   // 2
}
```


## 实现异步更新


接下来我们要实现异步更新，我们先增加一个单列对象
```javascript
/**
 * 对象 类
 * 单例  对象就够了
 * 需要很多对象或者说实例的话  需要类
 */
export let updateQueue = {
  updaters: new Set(),         //更新器集合，，  去重， 避免重复 update
  isBatchingUpdate: false,  // 标志，是否处于批量更新模式， 默认是非批量更新
  add(updater) {  // 增加一个更新器
    this.updaters.add(updater)
  },
  batchUpdate() {   // 强制批量实现 组件更新
    this.updaters.forEach(updater => updater.updateComponent())
    this.isBatchingUpdate = false
    this.updaters.clear()
  }
}
```
然后修改 Update 类中的 addState 方法
```javascript
addState(partialState) {
  // 先把这个分状态添加到 pendingStates 数组中去
  this.pendingStates.push(partialState)
  // 如果当前处于批量更新模式，也就是异步更新模式，把当前的 uodate 实例放到 updateQueue 里
  // 如果是非批量更新，也就是同步更新的话，则调用updateComponent直接更新
  // 这里 updateQueue.add(this) 应该可以优化 去重， 去重 同一个 update 实例
  updateQueue.isBatchingUpdate ? updateQueue.add(this) : this.updateComponent()
}
```
为了先测试，我们暂时在 React 中如下写：
```jsx
handleClick = () => {

  updateQueue.isBatchingUpdate = true

  this.setState({
    number: this.state.number+1
  })
  console.log(this.state.number)    // 0

  this.setState({
    number: this.state.number+1
  })
  console.log(this.state.number)   // 0

  // 这个异步指的是执行顺序，并非语法意义上的异步，只是延迟更新的意思
  updateQueue.batchUpdate()    //此时才调用
}
```
当然这里我们自己手动写了`batchUpdate` 方法执行，React 内部源码已经给我们做了处理，不需要我们这么写，这里只是为了方便演示。


所以总体流程就是：

1. 调用 setState 方法时，会调用绑定在该实例对象上的 `this.update` 属性的 `addState` 方法
1. 将setState 中的参数 保存在 `pendingStates` 中，如果是异步的就将当前 update 也做保存，如果是同步的则直接获取更新后的 state， 并且更新组件
1. 如果是异步的情况，会现将 setState 的参数值做保存、update实例做保存，等到执行栈都执行完毕后，则调用 `batchUpdate` 来进行更新，
   1. 获取新的 state
   1. 重新更新 DOM， 将新的DOM 替换掉老的 DOM



**所以React中的 setState 更新其实说不上是异步的，只是先将要更新的状态都保存起来，等到最后在执行批量更新，只是改变了执行顺序而已。**


## 合成事件实现异步更新


![image.png](https://cdn.nlark.com/yuque/0/2020/png/312064/1605420072886-2d7d5151-22b3-4305-a19b-fe1c227e298b.png#align=left&display=inline&height=971&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1941&originWidth=1954&size=194286&status=done&style=none&width=977)
上面对于异步的形式执行，我们还需要手动调用
```javascript
handleClick = () => {

  updateQueue.isBatchingUpdate = true

  this.setState({
    number: this.state.number+1
  })
  console.log(this.state.number)    // 0

  this.setState({
    number: this.state.number+1
  })
  console.log(this.state.number)   // 0

  // 这个异步指的是执行顺序，并非语法意义上的异步，只是延迟更新的意思
  updateQueue.batchUpdate()    //此时才调用
}
```
那么，我们可以使用什么方法来使React 内部自己执行呢？因为关于异步更新的情况，一般是在生命周期或者事件中存在，所以为了能react 内部自己计算，我们需要对事件对象做处理，也只能放在他上面了。所以先对虚拟dom做解析转化为真实dom的过程中，对 event 原生事件对象做处理，如下：
```javascript
import { addEvent } from './event'
// 对事件对象做处理就是 原生的 event
function updateProps(dom, props) {
  for(let key in props) {
    if(key === 'children') continue;   // children 要特殊处理
    if(key === 'style') {
      ...
    } else if(key.startsWith('on')) {   // 事件
      // dom[key.toLocaleLowerCase()] = props[key]    // 对 真实dom 绑定事件函数    dom.onclick=onClick函数
      // 第一个参数是 dom， 第二个参数是原生事件名，第三个参数是是事件函数
      addEvent(dom, key.toLocaleLowerCase(), props[key])
    } else {
      ...
    }
  }
}
```
```javascript
// event.js

import { updateQueue } from './Component'

/**
 * 给哪个DOM元素绑定哪种类型的事件
 * @param dom          给哪个DOM元素绑事件   button 真实DOM元素
 * @param eventType    事件类型  onclick
 * @param listener     事件处理函数  handleClick
 */
/**
 *  为什么需要合成事件，作用是什么？
 *  1. 可以实现批量更新
 *  2. 可以实现事件对象的缓存和回收
 */
export function addEvent(dom, eventType, listener) {
  // 给 dom 增加一个 store 属性，值是一个空对象
  let store = dom.store || (dom.store={});
  store[eventType] = listener;    // store.onclick = handleClick
  //document.addEventListener('click')
  // document.addEventListener(eventType.slice(2), dispatchEvent, false);
  if(!document[eventType]) {   // 有可能会覆盖用户的赋值，也可能会被用户赋值覆盖点， 其实最好是上面那样写， 这里为了更好的阅读，暂时这么写
    document[eventType] = dispatchEvent   // document.onclick = dispatchEvent
  }
}

let syntheticEvent = {};
function dispatchEvent(event) {   // 这个event是原生的 DOM 事件对象
  let { target, type } = event  // type=click  target事件源 button dom
  let eventType = `on${type}`   // onclick
  updateQueue.isBatchingUpdate = true

  let syntheticEvent = createSyntheticEvent(event)
  while (target) {   // 注意：此处就是自己手动实现 事件冒泡功能
    let { store } = target
    let listener = store && store[eventType];
    listener && listener.call(target, syntheticEvent)
    target = target.parentNode
  }
  for(let key in syntheticEvent) {   // 用完就清空掉
    syntheticEvent[key] = null
  }
  updateQueue.batchUpdate()
}
```
首先在该元素的真实dom上增加一个 store 属性，默认初始化为 `{}` 一个空对象，然后将React元素上绑定的事件存储在该 store 上，注意，此时进行事件委托，将这些事件 存储在document ，而不是该react元素的真实dom上。


当我点击元素时，将事件绑定到 document 上，先将批量更新开关打开（此时使用 setState 方法会先存储起来，等到最后才会执行（即所谓的异步），合并state、得到state），之后就是调用之前绑定该事件的方法了，这里有个小插曲，就是会将原生的 event 对象做处理，生成一个 React 处理过的新 event，等到执行完事件后，会将 模拟的 event 对象中的值清除，即用完就清。


接着就是使用js我们要内部实现一个事件冒泡的功能，因为当前点击的元素上并没有绑定事件，而是直接帮到到 document上了。我们点击当前元素其实是调用 document上的`dispatchEvent`方法，这是原生js默认的冒泡，在React 中我们还要自己实现一个类似于原生js这样的冒泡，让人以为就是原生冒泡。所以我们使用 while 循环，每次执行后重新赋值 target，来做到模拟冒泡。最后就是调用 `batchUpdate` 方法，重新渲染。


所以进过上面分析，我们可以知道：在事件方法执行前，react 内部将 `updateQueue.isBatchingUpdate = true` 批量更新的开关打开了，所以形成了类似于 异步的 感觉，当执行玩方法，`updateQueue.isBatchingUpdate = false` 又关闭了，形成了同步更新，所以方法内部的 `setTimeout` 定时器中改变状态，又变成了同步。可以猜想，估计在生命周期中也做了这么一层处理。


```jsx
class Counter extends React.Component {

    state = {
        number: 0
    }

    // event 是事件对象，但是它并不是DOM原生的，而是进过 React 封装的
    handleClick = (event) => {

        this.setState({
            number: this.state.number+1
        })
        console.log(this.state.number)   //0

        this.setState({
            number: this.state.number+1
        })
        console.log(this.state.number)  //0

        setTimeout(() => {
            console.log(this.state.number)  // 1

            this.setState({
                number: this.state.number+1
            })
            console.log(this.state.number) // 2

            this.setState({
                number: this.state.number+1
            })
            console.log(this.state.number)  // 3
        })

    }

    handleClick2 = () => {
        console.log('冒泡触发了嘛')
    }

    render() {
        return <div onClick={this.handleClick2}>  
            <button onClick={this.handleClick}>+</button>
            <div>number: {this.state.number}</div>
        </div>
    }
}
```
```
0
0
冒泡触发了嘛
1
2
3
```




