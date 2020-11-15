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
  while (target) {
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

function createSyntheticEvent(nativeEvent) {
  for(let key in nativeEvent) {  // 用的时候 附上值
    syntheticEvent[key] = nativeEvent[key]
  }
  return syntheticEvent
}




