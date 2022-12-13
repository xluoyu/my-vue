import { ReactiveEffect } from "./effect"

export type Dep = Set<ReactiveEffect>

export function createDep():Dep {
  return new Set<ReactiveEffect>()
}

