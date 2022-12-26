import { hasOwn } from "@my-vue/shared";
import { ITERATE_KEY, TriggerTypes, track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly, Target } from "./reactive"

const get = createGetter()

function createGetter(isReadOnly?: boolean, isShallow?: boolean): any {
  return function get(target: Target, key: string, receiver: object): any {
    if (key === 'raw') {
      return target
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    }
    /**
     * Reflect.get(target, key) 等同于target[key]
     * 
     * Q：但这里为什么要用Reflect呢？
     * A：主要在于第三个参数`receiver`，receiver为调用getter时的this值
     * 当对象出现继承时，target[key]的this依然会停留在原始对象。
     * 
     * 举例：
     * https://juejin.cn/post/6844904090116292616#heading-7
     * 
     */
    const res = Reflect.get(target, key, receiver);
    console.log('get', key)

    /**
     * 如果是只读，不需要搜集依赖
     * 
     * 因为他不会被修改
     */
    if (!isReadOnly) {
      track(target, key)
    }

    /**
     * 浅层的就不需要在进行后面的判断了
     */
    if (isShallow) {
      return res
    }

    /**
     * 当target是个深层对象时
     * 
     * 如果res是个对象，则再套一层reative，保证他的响应式
     * 此时的响应式effect直接与内部链接
     */
    if (typeof res === 'object' && res !== null) {
      return isReadOnly ? readonly(res) : reactive(res)
    }

    return res
  }
}

export const set = createSetter()
/**
 * 创建一个set
 * 
 * 由于修改、添加key都会触发set
 * 
 * 所以要区分一下
 */
function createSetter(shallow = false) {
  return function (target, key, val, receiver) {
    const type:TriggerTypes = hasOwn(target, key) ? TriggerTypes.SET : TriggerTypes.ADD
    const oldVal = target[key]
    const res = Reflect.set(target, key, val, receiver);
    /**
     * target === receiver.raw 说明receiver就是target的代理对象
     */
    // 只有当值真的发生改变时才触发trigger
    if (target === receiver.raw && hasChanged(val, oldVal)) {
      console.log('set', key, target, receiver)

      // 当前有这个key 就是修改、否则是添加
      trigger(target, key, type)
    }
    
    return res
  }
}

/**
 * 返回两个值是否不同
 * @param val 
 * @param oldVal 
 */
function hasChanged(val, oldVal) {
  /**
   * Object.is
   * 严格判断两个值是否相等
   * 
   * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is#%E6%8F%8F%E8%BF%B0
   */
  return !Object.is(val, oldVal)
}

/**
 * 含有
 * 
 * key in obj
 *  
 * @param target 
 * @param key 
 */
function has(target, key) {
  const res = Reflect.has(target, key)
  console.log('has', key)
  track(target, key)

  return res
}

/**
 * 删除
 * 
 * delete obj.key
 * 
 * @param target 
 * @param key 
 */
function deleteProperty(target, key) {
  const hasKey = hasOwn(target, key)
  const res = Reflect.deleteProperty(target, key)
  console.log('del', key)
  hasKey && trigger(target, key, TriggerTypes.DEL)

  return res
}

/**
 * for .. in obj 会触发ownKeys
 * 
 * 这里定义一个Symbol，并对其做出依赖搜集 
 * @param target 
 */
function ownKeys(target) {
  track(target, ITERATE_KEY)
  return Reflect.ownKeys(target)
}

export const mutableHandlers = {
  get,
  set,
  has,
  deleteProperty,
  ownKeys
}

const shallowGet = createGetter(false, true)
// const shallowSet = createSetter(false, true)

export const shallowReactiveHandlers = Object.assign({}, mutableHandlers, {
  get: shallowGet,
  // set: shallowSet
})

const readonlyGet = createGetter(true)

export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key) => {
    console.warn(`Set ${String(key)} failed: target is readonly`, target)

    return true
  },
  deleteProperty: (target, key) => {
    console.warn(`Delete ${String(key)} failed: target is readonly`, target)

    return true
  }
}