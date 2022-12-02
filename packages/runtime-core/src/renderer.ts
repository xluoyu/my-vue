import { createComponentInstance } from './component'
import { createAppAPI } from './createApp'

function createElement(type: string):HTMLElement  {
  return document.createElement(type)
}

function setText(el:HTMLElement, content) {
  el.innerText = content
}

function insert(container:HTMLElement, root:HTMLElement) {
  root.appendChild(container)
}

/**
 * 创建一个渲染器
 */
export function createRenderer(options) {
  /**
   * 初始化创建
   * @param vnode 
   * @param container 
   */
  function render(vnode, container) {
    patch(null, vnode, container)
  }

  function patch(n1, n2, container: HTMLElement | null = null) {
    if (n2.shapeFlag == 2) {
      initComponent(n1, n2, container)
    } else {
      initElement(n1, n2, container)
    }
  }

  function initComponent(n1, n2, container) {
    if (!n1) {
      mountComponent(n2, container)
    }
  }

  function mountComponent(initialVNode, container) {
    const instance = (initialVNode.component = createComponentInstance(initialVNode))


    setupRender(instance, initialVNode, container)
  }

  function setupRender(instance, initialVNode, container) {
    if (instance.type.render) {
      const subTree = instance.type.render()

      patch(null, subTree, container)
    }
  }

  function initElement(n1, n2, container) {
    if (!n1) {
      mountElement(n2, container)
    }
  }
  
  function mountElement(vnode, container) {
    const { props } = vnode

    const el = (vnode.el = createElement(vnode.type))

    if (typeof vnode.children === 'string') {
      setText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el)
      })
    }

    if (props) {
      console.log('处理props', props)
    }

    insert(el, container)
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}