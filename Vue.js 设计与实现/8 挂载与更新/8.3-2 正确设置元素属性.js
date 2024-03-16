/**
 * 8.3 正确设置元素属性
 * 有些属性是只读的，不能通过 el.attr 设置，只能通过 setAttribute 设置，例如 input.form
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

function shouldSetAsProps  (el, key) {
  if (key === 'form' && el.tagName === 'INPUT') return false
  return key in el
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
      vnode.children.forEach(child => {
        patch(null, child, el)
      })
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key]
        if (shouldSetAsProps(el, key)) {
          const type = typeof el[type]
          if (type === 'boolean' && value === '') {
            el[key] = true
          } else {
            el[key] = value
          }
        } else {
          el.setAttribute(key, value)
        }
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