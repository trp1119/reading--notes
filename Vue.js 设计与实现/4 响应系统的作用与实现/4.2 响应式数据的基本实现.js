/**
 * 4.2 响应式数据的基本实现
 */

// 存储副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hello world' }
// 代理数据
const obj = new Proxy(data, {
  get (target, key) {
    bucket.add(effect)
    return target[key]
  },
  set (target, key, value) {
    target[key] = value
    bucket.forEach(fn => fn())
    return true
  }
})

function effect () {
  console.log(obj.text)
}

// 执行副作用函数，触发读取
effect()

setTimeout(() => {
  obj.text = 'hello vue3'
}, 1000)

// 缺陷：硬编码 effect 名字固定