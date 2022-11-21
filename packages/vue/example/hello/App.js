import { h } from '../../dist/my-vue.esm-bundler.js'

export default{
  render() {
    return h("div", {class: 'my-vue'}, [
      h("p", {}, "hello"),
      h("p", {}, "word"),

    ])
  }
}