
export type VNodeType = string | VNode

export type VNodeNormalizedChildren = string | null

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
  childnre?: string | Array<any>
) {
  return {
    isVNode: true
  }
}