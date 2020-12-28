// import React from 'react';
// import ReactDOM from 'react-dom';

import React from './react';
import ReactDOM from './react-dom';

class Counter extends React.Component{  // 他会比较两个状态相等就不会刷新视图 PureComponent是浅比较

    constructor(props){
        super();
        this.state = {number:0}
        console.log('1.constructor构造函数')
    }
    componentWillMount(){ // 取本地的数据 同步的方式：采用渲染之前获取数据，只渲染一次
        console.log('2.组件将要加载 componentWillMount');
    }
    componentDidMount(){
        console.log('4.组件挂载完成 componentDidMount');
    }
    handleClick=()=>{
        this.setState({number:this.state.number+1});
    };
    // react可以shouldComponentUpdate方法中优化 PureComponent 可以帮我们做这件事
    shouldComponentUpdate(nextProps,nextState){  // 代表的是下一次的属性 和 下一次的状态
        console.log('5.组件是否更新 shouldComponentUpdate');
        return nextState.number%2;
        // return nextState.number!==this.state.number; //如果此函数种返回了false 就不会调用render方法了
    } //不要随便用setState 可能会死循环
    componentWillUpdate(){
        console.log('6.组件将要更新 componentWillUpdate');
    }
    componentDidUpdate(){
        console.log('7.组件完成更新 componentDidUpdate');
    }
    render(){
        console.log('3.render');
        return (
          <div>
              <p>{this.state.number}</p>
              <button onClick={this.handleClick}>+</button>
          </div>
        )
    }
}

let element = <Counter />

ReactDOM.render(
    element,
    document.getElementById('root')
);
