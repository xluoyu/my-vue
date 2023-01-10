import { normalizeContainer } from "@my-vue/shared";
import { createVNode } from "./vnode";

/**
 * 
 * @param render 
 */
export function createAppAPI (render) {
  return function(rootComponent) {

    const app = {
      use(pulgin) {

      },
      mount(rootContainer: Element | string) {
        const container = normalizeContainer(rootContainer)
        const vnode = createVNode(rootComponent)

        render(vnode, container)
      }
    }

    return app
  }
}