
let activeEffect:Function | null = null

class ReactiveEffect<T = any> {
  deps = []; // 改函数包含的依赖

  constructor(public fn: () => T) {

  }

  run() {
    
  }
}

/**
 * 用来收集依赖
 * @param fn 用户传递的事件
 * @param options 
 */
export function effect(fn, options = {}) {
  // const _effect = new ReactiveEffect(fn)

  activeEffect = fn

  fn()
}

export function trackEffects(a: Set<Function>) {
  if (activeEffect) {
    a.add(activeEffect)
  }
}

export function triggerEffects(a) {
  
}