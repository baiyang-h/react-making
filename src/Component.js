import { createDOM } from './react-dom'
import { isFunction } from './utils'
import { compareTwoVdom } from './react-dom'

/**
 * 对象 类
 * 单例  对象就够了
 * 需要很多对象或者说实例的话  需要类
 */
export let updateQueue = {
  updaters: new Set(),         //更新器的数组
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
    // 这里 updateQueue.add(this) 应该可以优化 去重， 去重 同一个 update 实例

    // 为什么要封装呢？因为以后的更新分为状态更新和属性更新，所以封装成一个函数
    this.emitUpdate();   // 发射更新
  }

  // TODO 现在还没有实现组件的属性改变后的更新，暂时还不写这个逻辑，等会写。。 现在暂时只考虑状态更新 ， 即 false时 updateComponent
  emitUpdate() {
    // 判断是否是批量更新? 是的话往里面放，不是的话就直接更新
    updateQueue.isBatchingUpdate ? updateQueue.add(this) : this.updateComponent()
  }

  // 更新组件
  updateComponent() {  // 开始真正用 pendingStates 更新状态 this.state
    let { classInstance, pendingStates } = this
    if(pendingStates.length) {   // 说明有等待更新的状态
      // 组件的老状态和数组中的新状态合并后得到最后的新状态

      // 注释掉这两句了换成下面 classInstance.state = this.getState()
      // classInstance.forceUpdate()   // 让组件强行更新

      // shouldUpdate 生命周期了
      // 无论是否真正更新页面，组件的state其实已经在this.getState()的时候更新了
      shouldUpdate(classInstance, this.getState())  // 参数是：类的实例和新的状态
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

function shouldUpdate(classInstance, nextState) {
  classInstance.state = nextState   // 不管是否要刷新页面，状态一定会改
  if(classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(classInstance.props, nextState)) {
    return false;   // 如果提供了 shouldComponentUpdate 函数，并且它的返回值为 false，就不继续走了，更新结束了
  }
  // 更新
  classInstance.forceUpdate()
}

class Component {

  static isReactComponent = true   // 加这个一个静态属性，可以使用它来区分是 类组件还是函数组件

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
    if(this.componentWillUpdate) {  // 将更新
      this.componentWillUpdate();
    }
    // 现在我要开始更新其他子类组件了
    let newVdom = this.render()   //拿到新的 虚拟 dom
    // oldVdom 就是类的实例的render方法渲染得到的那个虚拟DOM，或者说React元素div
    // 此例子中的 this.oldVdom.dom.parentNode 是谁？ #root
    let currentVdom = compareTwoVdom(this.oldVdom.dom.parentNode, this.oldVdom, newVdom);   //比较新的和旧的两个 dom 树
    // 每次更新后，最新的vdom 会成为最新的上一次的vdom，等待下一次的重新比较
    this.oldVdom = currentVdom;
    if(this.componentDidUpdate) {  // 将更新完成
      this.componentDidUpdate()
    }
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
