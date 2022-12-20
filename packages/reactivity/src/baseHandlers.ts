import { hasOwn } from "@my-vue/shared";
import { ITERATE_KEY, TriggerTypes, track, trigger } from "./effect";
import { Target } from "./reactive"

const get = createGetter()

function createGetter(isReacOnly?: boolean, isShallow?: boolean): any {
  return function get(target: Target, key: string, receiver: object): any {
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
    track(target, key)

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
function createSetter() {
  return function (target, key, val, receiver) {
    const type:TriggerTypes = hasOwn(target, key) ? TriggerTypes.SET : TriggerTypes.ADD
    const oldVal = target[key]
    const res = Reflect.set(target, key, val, receiver);
    // 只有当值真的发生改变时才触发trigger
    if (oldVal !== val) {
      console.log('set', key)

      // 当前有这个key 就是修改、否则是添加
      trigger(target, key, type)
    }
    

    return res
  }
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