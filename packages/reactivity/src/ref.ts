import { createDep } from "./dep";
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";

export class RefImpl<T = any> {
  private _value: T;
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

interface Ref<T = any> {
  value: T
}

export function ref<T>(value: T): Ref<T>
export function ref(value: unknown){
  // 如果已经是个ref，不需要在创建
  if (isRef(value)) {
    return value
  }
  return new RefImpl(value)
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref
export function isRef (r: any) {
  return !!(r && r.__v_isRef === true)
}

export function unref<T>(ref: T | Ref<T>): T
export function unref(val) {
  return isRef(val) ? val.value : val
}
