/**
 * 4.3 设计一个完善的响应系统
 */

// 用一个全局变量存储被注册的副作用函数
let activeEffect

// 此时 effect 函数用于注册副作用函数！！！
function effect(fn) {
  activeEffect = fn
  fn()
}

const bucket = new Set()

const data = { text: 'hello world' }
const obj = new Proxy(data, {
  get (target, key) {
    if (activeEffect) {
      bucket.add(activeEffect)
    }
    return target[key]
  },
  set (target, key, value) {
    target[key] = value
    bucket.forEach(fn => fn())
    return true
  }
})

effect(() => {
  console.log(obj.text)
})

setTimeout(() => {
  obj.text1 = 'hello vue3' // 缺陷 仍会触发 effect，需将被操作字段与副作用函数绑定
}, 1000)

// 改进：重新设计桶 target -> key -> effectFn