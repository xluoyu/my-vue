import { createDep, Dep } from "./dep";
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";

export class ComputedRefImpl {
  public dep: Dep
  public effect: ReactiveEffect
  private _dirty: boolean = true;
  private _value

  constructor(getter) {
    this.dep = createDep()
    this.effect = new ReactiveEffect(getter, () => {
      // 发生了依赖变动
      // 如果已经锁已经打开，就不需要再次运行
      if (this._dirty) return
      // 开锁
      this._dirty = true
      // 触发存储当副作用函数集
      triggerEffects(this.dep)
    })
  }

  get value() {
    // 手动触发搜集依赖
    trackEffects(this.dep)
    /**
     * 这里做一个锁
     * 只获取一次value即可
     */
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run()
    }
    
    return this._value
  }
}


/**
 * 计算函数
 */
export function computed(fn: () => void):ComputedRefImpl {
  return new ComputedRefImpl(fn)
}