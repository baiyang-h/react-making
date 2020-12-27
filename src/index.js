// import React from 'react';
// import ReactDOM from 'react-dom';

import React from './react';
import ReactDOM from './react-dom';

class Sum extends React.Component {
    constructor(props){
        super(props);
        this.a = React.createRef();
        this.b = React.createRef();
        this.result = React.createRef();
    }
    handleAdd = () => {
        let a = this.a.current.value;
        let b = this.b.current.value;
        this.result.current.value = a+b;
    }
    render() {
        return (
          <>
              <input ref={this.a} />+<input ref={this.b} /><button onClick={this.handleAdd}>=</button><input ref={this.result} />
          </>
        );
    }
}

let element = <Sum />

ReactDOM.render(
    element,
    document.getElementById('root')
);
