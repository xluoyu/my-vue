

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
  
}

export function trackEffects(a) {

}

export function triggerEffects(a) {
  
}

export function isTracking():boolean {
  return true
}