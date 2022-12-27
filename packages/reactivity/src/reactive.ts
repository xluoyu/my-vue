import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw' // 用来记录原始对象，getter中有key的判断
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
  [ReactiveFlags.IS_SHALLOW]?: boolean;
  [ReactiveFlags.RAW]?: any
}

/**
 * WeakMap 与 Map 类似
 * 
 * 但是 WeakMap 中的对象都是弱引用，可以被回收，防止内存泄漏
 * 不能遍历
 * 
 * 同理还有WeakSet 与 Set
 */
const reactiveMap = new WeakMap<Target, any>()

export function reactive<T extends object>(target: T):T
export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

const shallowMap = new WeakMap<Target, any>()

type ShallowReactive<T> = T & { ShallowReactiveMarker: true }

/**
 * 仅做浅层的响应式处理
 * @param target 
 */
export function shallowReactive<T extends object>(target: T): ShallowReactive<T> {
  return createReactiveObject(target, shallowReactiveHandlers, shallowMap)
}

const readonlyMap = new WeakMap<Target, any>()

export function readonly(target: object) {
  return createReactiveObject(target, readonlyHandlers, readonlyMap)
}

function createReactiveObject(
  target: Target,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
  ) {
  
  let _proxy = proxyMap.get(target) 

  if (_proxy) return _proxy

  _proxy = new Proxy(target, baseHandlers)
  
  proxyMap.set(target, _proxy)

  return _proxy
}

/**
 * 返回原始对象
 * 
 * 在reactive创建的响应式对象中，Getter内判断
 * 
 * if (key === ReactiveFlags.RAW) {
 *    return target // 这个就是原始值
 * }
 * 
 * @param target 
 */
export function toRaw(target) {
  const raw = target && target[ReactiveFlags.RAW]

  return raw ? toRaw(raw) : target
}