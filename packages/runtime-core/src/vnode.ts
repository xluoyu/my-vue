import { isString, normalizeClass } from "@my-vue/shared"
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
  el: Element | null,
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
  console.log('vnode', type)

  if (props) {
    const { class: klass, style } = props

    /**
     * props.class 需要单独编译
     * 
     * class 有三种形式
     * class = 'boo, far'
     * class = {boo: true, fat: false}
     * class = ['boo', {far: true}]
     * 
     * 在createVnode阶段，将所有形式的class都编译为string
     */
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  return {
    type,
    props,
    el: null,
    children,
    shapeFlag: getShapeFlag(type)
  } as VNode
}

function getShapeFlag(type):ShapeFlag {
  if (typeof type === 'string') {
    return ShapeFlag.Tag
  }

  return ShapeFlag.Component
}