/**
 * 4.7 调度执行
 * 例如：用户自行决定副作用函数执行时机、指定副作用函数执行次数
 */

let activeEffect
const effctStack = []

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effctStack.push(effectFn)
    fn()
    effctStack.pop()
    activeEffect = effctStack[effctStack.length - 1]
  }
  effectFn.options = options // 增加用户自定义配置
  effectFn.deps = []
  effectFn()
}

function cleanup (effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
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
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

const trigger = (target, key) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return true
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn) // 将副作用函数交回给用户自行决定处理
    } else {
      effectFn() // 用户未定义调度器，正常执行原逻辑
    }
  })
}

// 执行时机

// effect(function effectFn () {
//   console.log(obj.text)
// }, {
//   scheduler (fn) {
//     setTimeout(fn)
//   }
// })

// obj.text = 'hello vue3'

// console.log('结束了')

// hello world
// 结束了
// hello vue3

// 执行次数
// 定义一个任务队列
const jobQuene = new Set()
// 创建一个微任务
const p = Promise.resolve()

// 是否正在刷新队列标志
let isFlusing = false
function flushJob () {
  if (isFlusing) return
  isFlusing = true
  // 在微任务中刷新 jobQuene 队列
  p.then(() => {
    jobQuene.forEach(job => job())
  }).finally(() => {
    isFlusing = false
  })
}

effect(() => {
  console.log(obj.text)
}, {
  scheduler (fn) {
    // 每次调度时，将副作用函数添加到队列中
    jobQuene.add(fn)
    // 调用 flushJob 刷新队列
    flushJob()
  }
})

obj.text += '1'
obj.text += '2'