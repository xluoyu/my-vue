import { isArray } from "@my-vue/shared";
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

type ToRef<T> = T extends Ref<T> ? T : Ref<T>

export function toRef<T extends object, K extends keyof T>(object: T, key: K):ToRef<T>
export function toRef(object, key) {
  const _val = object[key]

  return isRef(_val) ? _val : {
    __v_isRef: true,

    get value() {
      return object[key] // get 时 从原始的响应式对象中取值，以便记录依赖
    },
    set value(val) {
      object[key] = val
    }
  }
}

export function toRefs<T extends object>(object: T): {
  [K in keyof T]: ToRef<T[K]>
}
export function toRefs(object) {
  const res = isArray(object) ? new Array(object.length) : {}

  for (const key in object) {
    res[key] = toRef(object, key)
  }

  return res
}

/**
 * 用来自动脱ref
 * 
 * 在模板中直接使用Ref不需要写.value
 * 
 * <p>{{foo}}</p>
 * 
 * setup() {
 *    const foo = ref(1)
 *    return {
 *      foo
 *    }
 * } 
 * 
 * 
 * @param target 
 */
export function proxyRefs(target) {
  return new Proxy(target, {
    get (target, key, receiver) {
      const val = Reflect.get(target, key, receiver);

      return isRef(val) ? val.value : val
    }
  })
}