import { RendererOptions } from "@my-vue/runtime-core";

// 用来处理vnode中的props
export const patchProp:RendererOptions['patchProp'] = (
  el,
  key,
  preValue,
  nextValue
) => {
  
}