import { createAppAPI } from './createApp'



export function createRenderer() {
  function render(vnode, container) {

    return {
      __is_app: true
    }
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}