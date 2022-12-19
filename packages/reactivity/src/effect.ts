import { create } from "domain";
import { Dep, createDep } from "./dep";

type EffectScheduler = (...args: any[]) => any

let activeEffect:ReactiveEffect | null = null
/**
 * 用来记录effect的执行数组
 * 
 * 主要应对effect的嵌套执行
 */  
const effectStack:ReactiveEffect[] = []
/**
 * proxy的记录Map
 */
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>();

/**
 * 创建一个effect，
 * 在effect函数执行时，需要记录所触发的响应式对象
 */
export class ReactiveEffect<T = any> {
  public deps:Dep[] = []; // 改函数包含的依赖

  constructor(public fn: () => T, public scheduler: EffectScheduler | null) {
  }

  run() {
    activeEffect = this
    this.deps.forEach(item => {
      item.delete(this)
    })
    effectStack.push(this)
    
    const result = this.fn()

    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]

    return result
  }
}

/**
 * 用来收集依赖
 * @param fn 用户传递的事件
 * @param options 
 */
type ReactiveEffectRunner = {
  (): void
  effect: ReactiveEffect
}
type effectOptions = {
  lazy?: boolean, // 不再立即执行
  scheduler?: EffectScheduler // 手动控制执行时机
}
export function effect(fn, options:effectOptions = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler || null)

  if (!options.lazy) {
    _effect.run()
  }

  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner

  runner.effect = _effect

  return runner
}

/**
 * 对object搜集依赖
 * 
 * @param target object
 * @param key 
 */
export function track(target, key) {
  if (!activeEffect) return

  // 如果没有就建个新的
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map<any, Dep>()))
  }

  // 如果没有就建个新的
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  trackEffects(dep)
}

/**
 * 搜集依赖
 * 
 * dep => 当前除非getter的这个值的deps
 */
export function trackEffects(dep: Dep) {
  if (activeEffect) {
    dep.add(activeEffect) // 将effect添加到值的deps中
    activeEffect.deps.push(dep) // 将值添加到effect的deps中
  }
}

/**
 * 对object触发依赖
 * 
 * @param target 
 * @param key 
 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  // 根本没找到依赖...
  if (!depsMap) return

  const dep = depsMap.get(key) || []

  triggerEffects(dep)
}

/**
 * 当响应式对象发生变动时，传入其dep
 * 
 * 使他的副作用函数全部重新执行
 * 
 * @param a 
 */
export function triggerEffects(a: Dep | ReactiveEffect[]) {
  const _effects = new Set(a)
  _effects.forEach(item => {
    /**
     * 当在effect内部修改响应式变量时，需要判断当前所处的effect是否是activeEffect
     * 
     * 避免无限循环
     */
    if (item !== activeEffect) {
      if (item.scheduler) {
        item.scheduler(item.run.bind(item))
      } else {
        item.run()
      }
    }
  })
}