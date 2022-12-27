import { hasOwn, isArray } from "@my-vue/shared";
import { ITERATE_KEY, TriggerTypes, track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly, Target, toRaw } from "./reactive"

/**
 * 重写一些数组方法
 * 
 * 查找类的方法：includes、indexOf、lastIndexof
 * 
 * const obj = {};
 * const arr = reactive([obj])
 * 
 * arr.includes(obj)
 * 
 * 由于obj是一个原始对象，arr中的obj是一个已经经过处理后的响应式对象
 * 所以includes找不到
 * 
 * 
 */
const arrayInstrumentations = createArrayInstrumentations()

function createArrayInstrumentations() {
  const instrumentations:Record<string, Function> = {}
  const findFnArr = ['includes', 'indexOf', 'lastIndexOf']

  findFnArr.forEach(key => {
    instrumentations[key] = function(...args: unknown[]) {
      const arr = toRaw(this)
      const res = arr[key](...args)

      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw))
      }

      return res
    }
  })

  return instrumentations
}


const get = createGetter()

function createGetter(isReadOnly?: boolean, isShallow?: boolean): any {
  return function get(target: Target, key: string, receiver: object): any {
    if (key === ReactiveFlags.RAW) {
      return target
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    }
    if (!isReadOnly && isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
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
    if (!isReadOnly && typeof key !== 'symbol') {
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
    const type:TriggerTypes = Array.isArray(target) ? 
      Number(key) < target.length ? TriggerTypes.SET : TriggerTypes.ADD
    :
      hasOwn(target, key) ? TriggerTypes.SET : TriggerTypes.ADD
    const oldVal = target[key]
    const res = Reflect.set(target, key, val, receiver);
    /**
     * target === receiver.raw 说明receiver就是target的代理对象
     */
    // 只有当值真的发生改变时才触发trigger
    if (target === receiver.raw && hasChanged(val, oldVal)) {
      console.log('set', key, target, receiver, type, val)

      // 当前有这个key 就是修改、否则是添加
      trigger(target, key, type, val)
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
  hasKey && trigger(target, key, TriggerTypes.DEL, undefined)

  return res
}

/**
 * for .. in obj 会触发ownKeys
 * 
 * 这里定义一个Symbol，并对其做出依赖搜集 
 * @param target 
 * 
 * 如果target是个数组，则ADD或Del等会影响for...in 的操作都会先修改length，
 * 
 * 所以，数组的话就不需要对ITERATE_KEY搜集依赖，直接对length搜集即可
 */
function ownKeys(target) {
  track(target, isArray(target) ? 'length' : ITERATE_KEY)
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