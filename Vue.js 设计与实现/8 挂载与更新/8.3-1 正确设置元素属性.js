/**
 * 8.3 正确设置元素属性
 * 设置属性有两种方式 el.setAttribute(attr, value) 与 el.attr = value
 * setAttribute 总是设置 value 为字符串，如 false 为 'false'，导致为 true
 * el.attr = false 没为题，但 value 为空则设置为 false, 如 disabled: '', 本意是true， el.disabled = '' = false，禁用变启用了。
 * el.setArrtibute 与 el。attr 并不能总是一一对应
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
      vnode.children.forEach(child => {
        patch(null, child, el)
      })
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key]
        if (key in el) { // 判断属性是否存在于 DOM Properties
          const type = typeof el[type]
          if (type === 'boolean' && value === '') { // 如果是 boolean 类型并且设置为空，则纠正为 true
            el[key] = true
          } else {
            el[key] = value
          }
        } else { // 不存在于 DOM Properties，则设置 HTML Attribute
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