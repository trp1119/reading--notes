/**
 * 8.7 事件的处理
 * 更新事件
 */

const vnode = {
  type: 'div',
  props: {
    id: 'foo',
    class: 'foo bar',
    onClick: () => {
      console.log('click')
    }
  },
  children: [
    {
      type: 'p',
      children: 'hello'
    }
  ],
}

function normalizeClass (c) {
  // TODO
  return c
}

function shouldSetAsProps  (el, key) {
  if (key === 'form' && el.tagName === 'INPUT') return false
  return key in el
}

function createRenderer(options) {
  const {
    createElement,
    insert,
    setElementText,
    patchProps,
    unmount
  } = options

  function mountElement(vnode, container) {
    const el = vnode.el = createElement(vnode.type)

    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null, child, el)
      })
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key])
      }
    }

    insert(el, container)
  }

  function patch (n1, n2, container) { // n1 旧vnode n2 新vnode
    // 旧 vnode 存在，对比 n1 n2
    if (n1 && n1.type !== n2.type) { // 类型不同，直接卸载旧 vnode
      unmount(n1)
      n1 = null // 置为 null，保证下方重新挂载
    }
    const { type } = n2
    // 区分不同类型的 vnode 普通标签、组件、Fragment 等
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container) // 重新挂载
      } else {
  
      }
    } else if (typeof type === 'object') {
      // 组件
    } else if (type === 'xxx') {
      // 其他
    }
  }

  function render (vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        unmount(container._vnode)
      }
    }
    container._vnode = vnode
  }

  return {
    render
  }
}

const renderer = createRenderer({
  createElement (tag) {
    return document.createElement(tag)
  },
  setElementText (el, text) {
    el.textContent = text
  },
  insert (el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  patchProps (el, key, preValue, nextValue) {
    if (/^on/.test(key)) {
      // onClick => click
      const name = key.slice(2).toLowerCase()

      // // 移除上次绑定事件处理函数
      // preValue && el.removeEventListener(preValue)
      // // 绑定新的事件处理函数
      // el.addEventListener(name, nextValue)

      let invoker = el._vei
      if (nextValue) {
        if (!invoker) {
          // 伪造 invoker
          // vue event invoker
          invoker = el._vei = (e) => {
            invoker.value(e) // 更新的时候调用此处，已经是更新后的 invoker.value，避免一次 removeEventListener
          }
          invoker.value = nextValue
          el.addEventListener(name, invoker)
        } else {
          invoker.value = nextValue // 存在 invoker，意味着更新
        }
      } else if (invoker) {
        el.removeEventListener(name, invoker) // 新事件不存在，旧事件存在，则移除绑定
      }
    } else if (key === 'class') {
      el.className = normalizeClass(nextValue) || ''
    } else if (shouldSetAsProps(el, key)) {
      const type = typeof el[key]
      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  },
  unmount (vnode) {
    const el = vnode.el
    const parent = el.parentNode
    if (parent) {
      parent.removeChild(el)
    }
  }
})

renderer.render(vnode, document.querySelector('#app'))