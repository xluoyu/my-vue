export const hasOwn = (target: object, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(target, key)
}

export const isArray = Array.isArray

export const isString = (a: unknown): a is string => typeof a === 'string'

export const isObject = (a: unknown): a is object => typeof a === 'object'

/**
 * 将三种形式的class都编译为string
 * @param val 
 */
export const normalizeClass = (val: unknown): string => {
  let res = ''

  if (isString(val)) {
    res = val
  } else if (isArray(val)) {
    res = val.map(item => normalizeClass(item)).join(' ')
  } else if (isObject(val)) {
    for (const name in val) {
      if (val[name]) {
        res += name + ' '
      }
    }
  }

  return res.trim()
}

export const normalizeContainer = (container: Element | string): Element => {
  if (isString(container)) {
    const res = document.querySelector(container)
    if (!res) {
      throw new Error(`Failed to mount app: mount target selector "${container}" returned null.`);
    }

    return res
  }
  return container
}