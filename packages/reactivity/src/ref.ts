import { trackEffects, triggerEffects, isTracking } from "./effect";

class RefImpl {
  private _value: any;
  public dep;
  public __v_isRef = true;

  constructor(value) {
    this._value = value
    this.dep = new Set()
  }

  get value() {
    // 收集依赖
    trackRefValue(this);

    return this._value
  }

  set value(newValue) {
    // 触发依赖
    triggerRefValue(this);

  }
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

function triggerRefValue(ref) {
  triggerEffects(ref.dep)
}


export function ref(value) {
  return new RefImpl(value)
}