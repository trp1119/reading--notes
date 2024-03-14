/**
 * 4.3 设计一个完善的响应系统
 * 改进：封装 track 和 trigger
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
    track(target, key)
    return target[key]
  },
  set (target, key, value) {
    target[key] = value
    trigger(target, key)
    return true
  }
})

const track = (target, key) => {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map())) // 注意 depsMap = new Map() 写法
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
}

const trigger = (target, key) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return true
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}

// effect(function effectFn1 () {
//   console.log(obj.text + ' 1')
// })

// effect(function effectFn2 () {
//   console.log(obj.text + ' 2')
// })

// setTimeout(() => {
//   obj.text = 'hello vue3'
// }, 1000)

// setTimeout(() => {
//   obj.text1 = 'hello vue3 text1'
// }, 1000)

effect(function effectFn3 () {
  console.log(obj.text + ' 1')
  console.log(obj.text2 + ' 2')
})

setTimeout(() => {
  obj.text2 = 'hello vue3 text2'
}, 1000)
