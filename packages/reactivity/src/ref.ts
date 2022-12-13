import { createDep } from "./dep";
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";

export class RefImpl {
  private _value: any;
  public dep: Set<ReactiveEffect<any>>;
  public __v_isRef = true;

  constructor(value) {
    this._value = value
    this.dep = createDep()
  }

  get value() {
    // 收集依赖
    trackEffects(this.dep)

    return this._value
  }

  set value(newValue) {
    // 触发依赖
    this._value = newValue
    triggerRefValue(this);
  }
}

function triggerRefValue(ref) {
  triggerEffects(ref.dep)
}


export function ref(value) {
  return new RefImpl(value)
}