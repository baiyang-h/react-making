import { createDOM } from './react-dom'
import { isFunction } from './utils'

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
    updateQueue.isBatchingUpdate ? updateQueue.add(this) : this.updateComponent()
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

// 将新的虚拟DOM 转为 真实 DOM，并且替换掉老的虚拟 DOM
function updateClassInstance(classInstance, renderVdom) {
  let oldDOM = classInstance.dom;       // 获取老的 真实dom
  let newDOM = createDOM(renderVdom);   // 将虚拟dom 转为真实 dom
  oldDOM.parentNode.replaceChild(newDOM, oldDOM)    // 将新的DOM 替换掉 老的DOM
  classInstance.dom = newDOM          // 然后将现在的 DOM 挂载到 实例的dom属性上 做保存
}

export default Component
