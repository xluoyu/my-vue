import { isArray } from "@my-vue/shared";
import { Dep, createDep } from "./dep";
import { Target } from './reactive';

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
    console.log('初始化一个effect')
  }

  run() {
    activeEffect = this
    this.deps.forEach(item => {
      item.delete(this)
    })
    effectStack.push(this)
    console.log('即将执行run', this.fn)

    const result = this.fn()
    console.log('执行run结束', result)

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

export enum TriggerTypes {
  ADD = 'ADD',
  SET = 'SET',
  DEL = 'DEL',
}

export const ITERATE_KEY = Symbol()

/**
 * 对object触发依赖
 * 
 * @param target 
 * @param key 
 */
export function trigger(
  target:Target,
  key: unknown,
  type: TriggerTypes, // 修改类型
  newVal: unknown // 新的值
  ) {
  const depsMap = targetMap.get(target)
  // 根本没找到依赖...
  if (!depsMap) return

  const deps:(Dep | undefined)[] = [depsMap.get(key)] // 初始为当前key 的依赖项 Dep

  /**
   * 当用户直接操作length时，需要执行target上所有的副作用
   * 
   * arr.length = 0
   */
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((effects, key) => {
      /**
       * 所有key(index) 大于新的index的值，都要执行副作用
       */
      if (key >= (newVal as Number)) {
        deps.push(effects)
      }
    })
  }

  switch (type) {
    case TriggerTypes.ADD:
    case TriggerTypes.DEL:
      /**
       * 当触发for..in 操作时，会在当前的target中添加ITERATE_KEY属性，并作出依赖搜集
       * 
       * 所搜集的effect就是 触发for..in 操作的副作用函数
       * 
       * 当target的key发生变动时，需要执行ITERATE_KEY中所存储的副作用函数
       * 
       * 
       * 如果target是数组的话，ADD或DEL会改变length，所以要执行一下length的依赖
       */
      if (Array.isArray(target)) {
        deps.push(depsMap.get('length'))
      } else {
        deps.push(depsMap.get(ITERATE_KEY))
      }

      break
    case TriggerTypes.SET:
      break
  }

  const effects: ReactiveEffect[] = []

  /**
   * deps 中可能包含有多个Dep [Dep, Dep, ...]
   * 
   * Dep => Set<ReactiveEffect>
   */
  deps.forEach(dep => {
    dep && effects.push(...dep)
  })
  triggerEffects(effects)
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