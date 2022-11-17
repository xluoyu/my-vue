export * from '@my-vue/runtime-core'
import { createRenderer } from '@my-vue/runtime-core'

let renderer;

function ensureRenderer() {
  return renderer || (renderer = createRenderer())
}

export const createApp = (args) => {
  return ensureRenderer().createApp(args)
}