import { track, trigger } from "./effect";
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

    track(target, key)

    return res
  }
}

export const set = createSetter()

function createSetter() {
  return function (target, key, val, receiver) {
    const res = Reflect.set(target, key, val, receiver);

    trigger(target, key)

    return res
  }
}

export const mutableHandlers = {
  get,
  set
}