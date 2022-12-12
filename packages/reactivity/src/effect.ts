
let activeEffect:ReactiveEffect | null = null

/**
 * 创建一个effect，
 * 在effect函数执行时，需要记录所触发的响应式对象
 */
class ReactiveEffect<T = any> {
  deps = []; // 改函数包含的依赖

  constructor(public fn: () => T, public options: any) {

  }

  run() {
    activeEffect = this

    this.fn()
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

export function trackEffects(a: Set<Function>) {
  if (activeEffect) {
    a.add(activeEffect)
  }
}

export function triggerEffects(a) {
  
}