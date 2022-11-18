
/**
 * 创建一个组件
 * @param vnode 初始换的vnode
 */
export function createComponentInstance(vnode) {
  const instance = {
    type: vnode.type,
    vnode
  }


  return instance
}