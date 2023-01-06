import { RendererOptions } from "@my-vue/runtime-core";

// 用来处理vnode中的props
export const patchProp:RendererOptions['patchProp'] = (
  el,
  key,
  preValue,
  nextValue
) => {
  console.log(`PatchProp 设置属性:${key} 值:${nextValue}`);

  if (shouldSetAsProp(el, key, nextValue)) {
    console.log('shouldSetAsProp', key)
  }

  el.setAttribute(key, nextValue)
}

function shouldSetAsProp(
  el: Element,
  key: string,
  value: unknown
) {
  // these are enumerated attrs, however their corresponding DOM properties
  // are actually booleans - this leads to setting it with a string "false"
  // value leading it to be coerced to `true`, so we need to always treat
  // them as attributes.
  // Note that `contentEditable` doesn't have this problem: its DOM
  // property is also enumerated string values.
  if (key === 'spellcheck' || key === 'draggable' || key === 'translate') {
    return false
  }

  // #1787, #2840 form property on form elements is readonly and must be set as
  // attribute.
  if (key === 'form') {
    return false
  }

  // #1526 <input list> must be set as attribute
  if (key === 'list' && el.tagName === 'INPUT') {
    return false
  }

  // #2766 <textarea type> must be set as attribute
  if (key === 'type' && el.tagName === 'TEXTAREA') {
    return false
  }

  return key in el
}
