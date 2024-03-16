/**
 * 8.1 挂载子节点和元素的属性
 * 挂载属性
 */

const vnode = {
  type: 'div',
  props: {
    id: 'foo'
  },
  children: [
    {
      type: 'p',
      children: 'hello'
    }
  ]
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
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => { // 遍历挂载
        patch(null, child, el)
      })
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        // el.setAttribute(key, vnode.props[key])
        el[key] = vnode.props[key]
      }
    }

    insert(el, container)
  }

  function patch (n1, n2, container) {
    if (!n1) {
      mountElement(n2, container)
    } else {

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

renderer.render(vnode, document.querySelector('#app'))