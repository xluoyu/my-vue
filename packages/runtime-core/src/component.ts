import { VNode, VNodeType } from "./vnode"

export type ComponentInternalInstance = {
  type: VNodeType,
  vnode: VNode
}

/**
 * 创建一个组件
 * @param vnode 初始换的vnode
 */
export function createComponentInstance(vnode):ComponentInternalInstance {
  const instance:ComponentInternalInstance = {
    type: vnode.type,
    vnode
  }

  return instance
}