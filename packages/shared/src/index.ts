export const hasOwn = (target: object, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(target, key)
}

export const isArray = Array.isArray