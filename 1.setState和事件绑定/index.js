import React from 'react';
import ReactDOM from 'react-dom';

class Counter extends React.Component {

    state = {
        number: 0
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState(state => ({
                number: state.number + 1
            }))

            console.log(this.state.number)   // 1

            this.setState(state => ({
                number: state.number + 1
            }))

            console.log(this.state.number)   // 2
        })
    }

    handleClick = () => {

    }

    render() {
        return <div>
            <button onClick={this.handleClick}>click</button>
            <div>{this.state.number}</div>
        </div>
    }
}

let element = <Counter />


ReactDOM.render(
    element,
    document.getElementById('root')
);
