/**
 * 封装一些dom操作
 */
export const nodeOps = {
  createElement(type: string):HTMLElement  {
    return document.createElement(type)
  },
  
  setElementText(el:HTMLElement, content) {
    el.innerText = content
  },
  
  insert(container:HTMLElement, root:HTMLElement) {
    root.appendChild(container)
  }
}