export * from '@my-vue/runtime-core'
import { createRenderer } from '@my-vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

let renderer;

const rendererOptions = Object.assign({ patchProp }, nodeOps)

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

export const createApp = (args) => {
  return ensureRenderer().createApp(args)
}