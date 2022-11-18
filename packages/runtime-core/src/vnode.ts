
export type VNodeType = string | VNode

export type VNodeNormalizedChildren = string | Array<any> | undefined

export interface VNode {
  type: VNodeType,
  props,
  children: VNodeNormalizedChildren,
  shapeFlag: number
}

/**
 * 
 * @param component 
 */
export function createVNode(
  type: any,
  props?: any,
  children?: string | Array<any>
) {
  const vnode:VNode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type)
  }

  return vnode
}

function getShapeFlag(type):number {
  if (typeof type === 'string') {
    return 1
  }

  return 2
}