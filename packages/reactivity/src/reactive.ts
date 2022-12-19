import { mutableHandlers } from "./baseHandlers";
import { track, trigger } from "./effect";

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow'
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
  [ReactiveFlags.IS_SHALLOW]?: boolean;
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

function createReactiveObject(
  target: Target,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
  ) {

  const _proxy = new Proxy(target, baseHandlers)

  return _proxy
}
