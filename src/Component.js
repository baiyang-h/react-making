class Component {

  static isReactComponent = true   // 加这个一个静态属性，可以使用它来区分是 类组件还是函数组件

  constructor(props) {
    this.props = props;
  }
}

export default Component