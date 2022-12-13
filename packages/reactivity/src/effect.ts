import { createDep, Dep } from "./dep";
import { RefImpl } from "./ref";

let activeEffect:ReactiveEffect | null = null
const effectStack:ReactiveEffect[] = [] // 用来记录effect的执行数组

/**
 * 创建一个effect，
 * 在effect函数执行时，需要记录所触发的响应式对象
 */
export class ReactiveEffect<T = any> {
  public deps:Dep[] = []; // 改函数包含的依赖

  constructor(public fn: () => T, public options: any) {
    console.log('实例化一个effect')
  }

  run() {
    activeEffect = this
    this.deps.forEach(item => {
      item.delete(this)
    })
    effectStack.push(this)
    this.fn()

    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
}

/**
 * 用来收集依赖
 * @param fn 用户传递的事件
 * @param options 
 */
export function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options)

  _effect.run()
}

export function trackEffects(dep: Dep) {
  if (activeEffect) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}


export function triggerEffects(a: Dep) {
  const _effects = new Set(a)
  _effects.forEach(item => {
    /**
     * 当在effect内部修改响应式变量时，需要判断当前所处的effect是否是activeEffect
     * 
     * 避免无限循环
     */
    if (item !== activeEffect) {
      item.run()
    }
  })
}