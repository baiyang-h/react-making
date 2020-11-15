// import React from 'react';
// import ReactDOM from 'react-dom';

import React from './react';
import ReactDOM from './react-dom';

import { updateQueue } from './Component'

class Counter extends React.Component {

    state = {
        number: 0
    }

    // event 是事件对象，但是它并不是DOM原生的，而是进过 React 封装的
    handleClick = (event) => {

        this.setState({
            number: this.state.number+1
        })
        console.log(this.state.number)

        this.setState({
            number: this.state.number+1
        })
        console.log(this.state.number)

    }

    render() {
        return <div>
            <button onClick={this.handleClick}>+</button>
            <div>number: {this.state.number}</div>
        </div>
    }
}

let element = <Counter />

// console.log(<button onClick={() => {}}>123</button>)

ReactDOM.render(
    element,
    document.getElementById('root')
);
