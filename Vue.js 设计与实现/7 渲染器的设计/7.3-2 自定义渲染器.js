/**
 * 7.3 自定义渲染器
 * 抽离，使其通用
 */
const vnode = {
  type: 'h1',
  children: 'hello'
}

function createRenderer(options) {
  const {
    createElement,
    insert,
    setElementText
  } = options

  function mountElement(vnode, container) {
    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    }
    insert(el, container)
  }

  function patch (n1, n2, container) { // n1 旧 vnode，n2 新 vnode
    if (!n1) { // 旧 vnode 不存在 -> 挂载
      mountElement(n2, container)
    } else { // 旧 vnode 存在 -> 打补丁

    }
  }

  function render (vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        container.innerHTML = ''
      }
    }
    container._vnode = vnode
  }

  return {
    render
  }
}

// 创建渲染器
const renderer = createRenderer({
  createElement (tag) {
    return document.createElement(tag)
  },
  setElementText (el, text) {
    el.textContent = text
  },
  insert (el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  }
})
// 调用渲染器  render 方法渲染该 vnode
renderer.render(vnode, document.querySelector('#app'))