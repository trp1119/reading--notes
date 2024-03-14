/**
 * 4.3 设计一个完善的响应系统
 * 改进：重新设计桶 target -> key -> effectFn
 * 区分 target，区分 key
 */

// 用一个全局变量存储被注册的副作用函数
let activeEffect

// 此时 effect 函数用于注册副作用函数！！！
function effect(fn) {
  activeEffect = fn
  fn()
}

const bucket = new WeakMap()

const data = { text: 'hello world' }
const obj = new Proxy(data, {
  get (target, key) {
    if (!activeEffect) return // TODO 为什么直接 return 而不是 return target[key]
    let depsMap = bucket.get(target)
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map())) // 注意 depsMap = new Map() 写法
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)

    return target[key]
  },
  set (target, key, value) {
    target[key] = value
    const depsMap = bucket.get(target)
    if (!depsMap) return true
    const effects = depsMap.get(key)
    effects && effects.forEach(fn => fn())
    return true
  }
})

effect(() => {
  console.log(obj.text)
})

setTimeout(() => {
  obj.text1 = 'hello vue3' // 缺陷 仍会触发 effect，需将被操作字段与副作用函数绑定
}, 1000)

