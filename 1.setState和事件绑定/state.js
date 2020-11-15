class Updater {
  constructor() {
    this.state = {
      a: 11,
      number: 0
    }
    this.queue = []
  }

  setState(newState) {
    this.queue.push(newState)
  }

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
