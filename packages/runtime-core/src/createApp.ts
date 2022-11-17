import { createVNode } from "./vnode";

export function createAppAPI (render) {
  return function(rootComponent) {

    const app = {
      use(pulgin) {
        
      },
      mount(rootContainer) {
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      }
    }

    return app
  }
}