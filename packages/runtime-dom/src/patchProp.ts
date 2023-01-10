import { RendererOptions } from "@my-vue/runtime-core";

/**
 * 处理事件绑定
 * @param el 
 * @param key 
 * @param preValue 
 * @param nextValue 
 */
function patchEvent(
  el,
  key,
  preValue,
  nextValue
) {
  const name = key.slice(2).toLocaleLowerCase()
    /**
     * 这里为了实现绑定事件的更新，在el内部创建了一个_eventFn，_eventFn.value 只想所要执行的事件
     * 
     * 当要更新事件时，只需要替换fn.value即可
     * 
     * 节省了再次事件绑定的消耗
     */
    let eventObj = (el as any)._eventObj || ((el as any)._eventObj = {})
    let eventFn = eventObj[name]
    if (nextValue) {
      if (eventFn) {
        eventFn.value = nextValue
      } else {
        // 当前没有_eventFn
        eventFn = (el as any)._eventObj[name] = (e) => {
          eventFn.value(e)
        }

        eventFn.value = nextValue

        el.addEventListener(name, eventFn)
      }
    } else {
      el.removeEventListener(name, eventFn)
    }
}

// 用来处理vnode中的props
export const patchProp:RendererOptions['patchProp'] = (
  el,
  key,
  preValue,
  nextValue
) => {
  console.log(`PatchProp 设置属性:${key} 值:${nextValue}`, el);

  if (/^on/.test(key)) {
    patchEvent(el, key, preValue, nextValue)
  } else if (key === 'class') {
    /**
     * 在设置class时有三种方式
     * 
     * setAttribute、el.className = 'xx'、el.classList
     * 
     * 通过性能比较，className更优
     */
    el.className = nextValue || '';
  } else if (shouldSetAsProp(el, key, nextValue)) {
    console.log('shouldSetAsProp', key)
    const type = typeof el[key]
    if (type === 'boolean' && nextValue === '') {
      el[key] = true
    } else {
      el[key] = nextValue
    }
  } else {
    el.setAttribute(key, nextValue)
  }
}

/**
 * 判断key是不是 DOM Properties
 */
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
