import { createComponentInstance } from './component'
import { createAppAPI } from './createApp'
import { ShapeFlag, VNode } from './vnode'

/**
 * 渲染器中所需要用到的API
 * 
 * 这样的目的是设计一个不依赖与浏览器平台的渲染器
 * 
 * Node: 节点，提供基础方法，子类包含(Element, Text, Attribute, Comment等)
 * 
 * Element：元素，继承于Node，特指Node.Element，例如 <div />等各类标签
 */
export interface RendererOptions<BaseNode = Node, BaseElement = Element> {
  // 用来比较Attr
  patchProp (
    el: BaseElement,
    key: string,
    preValue: any,
    nextValue: any
  ): void,
  // 创建节点
  createElement (type: string): BaseElement,
  // 设置文本
  setElementText (node: BaseElement, text: string): void,
  // 插入
  insert (el: BaseNode, container: BaseElement): void
}

/**
 * 创建一个渲染器
 * 
 * options：渲染器所需的API
 */
export function createRenderer(options: RendererOptions) {
  const {
    patchProp,
    createElement,
    setElementText,
    insert
  } = options

  /**
   * 初始化创建
   * @param vnode 
   * @param container 
   */
  function render(vnode: VNode | null, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        /**
         * 卸载时不能直接清空
         * 需要触发组件、指令等unmounted生命周期
         * 还要移除dom的绑定事件
         */
        // container.innerHTML = ''
        unmount(container._vnode)
        
      }
    }

    container._vnode = vnode
  }

  /**
   * 卸载处理
   * @param vnode 
   */
  function unmount(vnode: VNode) {
    const el = vnode.el as Element

    const parent = el.parentNode

    if (parent) parent.removeChild(el)
  }

  /**
   * 开始比较
   */
  function patch(n1: null | VNode, n2: VNode, container: Element | null = null) {
    if (n2.shapeFlag == ShapeFlag.Component) {
      initComponent(n1, n2, container)
    } else {
      initElement(n1, n2, container)
    }
  }

  function initComponent(n1: null | VNode, n2: VNode, container: Element | null) {
    if (!n1) {
      mountComponent(n2, container)
    }
  }

  function mountComponent(initialVNode:VNode, container: Element | null) {
    const instance = (initialVNode.component = createComponentInstance(initialVNode))

    setupRender(instance, initialVNode, container)
  }

  function setupRender(instance, initialVNode, container) {
    if (instance.type.render) {
      const subTree = instance.type.render()
      console.log('setupRender', subTree)
      patch(null, subTree, container)
    }
  }

  function initElement(n1:VNode | null, n2: VNode, container) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    
    if (!n1) {
      mountElement(n2, container)
    } else {
      
    }
  }
  
  function mountElement(vnode, container) {
    console.log(vnode)
    const { props } = vnode

    const el = (vnode.el = createElement(vnode.type))

    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el)
      })
    }

    /**
     * 处理props
     */
    if (props) {
      console.log('处理props', props)
      for (const key in props) {
        patchProp(el, key, null, props[key])
      }
    }

    insert(el, container)
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}