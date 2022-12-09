import { trackEffects, triggerEffects } from "./effect";

class RefImpl {
  private _value: any;
  public dep: Set<Function>;
  public __v_isRef = true;

  constructor(value) {
    this._value = value
    this.dep = new Set()
  }

  get value() {
    // 收集依赖
    trackEffects(this.dep)

    return this._value
  }

  set value(newValue) {
    // 触发依赖
    triggerRefValue(this);
  }
}


// function trackRefValue(ref: RefImpl) {
// }

function triggerRefValue(ref) {
  triggerEffects(ref.dep)
}


export function ref(value) {
  return new RefImpl(value)
}