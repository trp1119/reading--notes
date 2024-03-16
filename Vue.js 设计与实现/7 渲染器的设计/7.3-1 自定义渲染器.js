/**
 * 7.3 自定义渲染器
 */
const vnode = {
  type: 'h1',
  children: 'hello'
}

function createRenderer() {
  function mountElement(vnode, container) {
    // 创建 DOM 元素
    const el = document.createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    }
    container.appendChild(el)
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
const renderer = createRenderer()
// 调用渲染器  render 方法渲染该 vnode
renderer.render(vnode, document.querySelector('#app'))