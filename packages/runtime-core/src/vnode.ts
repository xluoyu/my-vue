import { ComponentInternalInstance } from "./component"

export type VNodeType = string | VNode

export type VNodeNormalizedChildren = string | Array<any> | undefined

export enum ShapeFlag {
  Tag = 'tag',
  Component = 'component',
}

export interface VNode {
  type: VNodeType,
  props,
  children: VNodeNormalizedChildren,
  component?: ComponentInternalInstance | null
  shapeFlag: ShapeFlag
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

function getShapeFlag(type):ShapeFlag {
  if (typeof type === 'string') {
    return ShapeFlag.Tag
  }

  return ShapeFlag.Component
}