/**
 * 9.4 如何移动元素
 */
const Fragment = Symbol()
const vnode_fragment = {
  type: Fragment,
  children: [
    { type: 'li', children: 'text1' },
    { type: 'li', children: 'text2' },
    { type: 'li', children: 'text3' }
  ]
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
    unmount,
    createText,
    setText
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

  function patchChildren(n1, n2, container) { // n1 旧 vnode n2 新 vnode
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c))
      }
      setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) { // n1 n2 都是 array，需进行对比，diff 算法
        // 简单 diff
        const oldChildren = n1.children
        const newChildren = n2.children

        let lastIndex = 0 // 存储寻找过程中遇到的最大索引值
        for (let i = 0; i < newChildren.length; i++) {
          const newVNode = newChildren[i]
          for (let j = 0;  j < oldChildren.length; j++) {
            const oldVNode = oldChildren[j]
            if (newVNode.key === oldVNode.key) {
              patch(oldVNode, newVNode, container)
              if (j < lastIndex) {
                const prevNode = newChildren[i - 1]
                // prevNode 不存在则说明当前 newVNode 是第一个节点，不需要移动
                if (prevNode) {
                  // 将 newVNode 对应的真实 DOM 移动到 prevNode 对应的真实 DOM 后
                  const anchor = prevNode.el.nextSibling
                  insert(newVNode.el, container, anchor)
                }
              } else {
                lastIndex = j
              }
              break
            }
          }
        }
      } else {
        setElementText(container, '') // 清空
        n2.children.forEach(c => patch(null, c, container))
      }
    } else {
      // 新子节点不存在
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c))
      } else if (typeof n1.children === 'string') {
        setElementText(container, '')
      }
    }
  }

  function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null)
      }
    }
    patchChildren(n1, n2, el)
  }

  function patch (n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    const { type } = n2
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container)
      } else {
        patchElement(n1, n2)
      }
    } else if (type === Text) {
      if (!n1) {
        const el = n2.el = createText(n2.children)
        insert(el, container)
      } else {
        const el = n2.el = n1.el
        if (n2.children !== n1.children) {
          setText(el, n2.children)
        }
      }
    } else if (type === Fragment) {
      if (!n1) {
        n2.children.forEach(c => patch(null, c, container))
      } else {
        patchChildren(n1, n2, container)
      }
    } else if (typeof type === 'object') {
    } else if (type === 'xxx') {
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
  createText(text) {
    return document.createTextNode(text)
  },
  setText(el, text) {
    el.nodeValue = text
  },
  patchProps (el, key, preValue, nextValue) {
    if (/^on/.test(key)) {
      const name = key.slice(2).toLowerCase()

      const invokers = el._vei || (el._vei = {})
      let invoker = invokers[key]

      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
            console.log('执行', el, e.timeStamp)
            if (e.timeStamp < invoker.attched) return
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach(fn => fn(e))
            } else {
              invoker.value(e)
            }
          }
          invoker.value = nextValue
          invoker.attched = performance.now()
          console.log('绑定', el, invoker.attched)
          el.addEventListener(name, invoker)
        } else {
          invoker.value = nextValue
        }
      } else if (invoker) {
        el.removeEventListener(name, invoker)
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
    if (vnode.type === Fragment) {
      vnode.children.forEach(c => unmount(c))
    }
    const parent = el.parentNode
    if (parent) {
      parent.removeChild(el)
    }
  }
})
