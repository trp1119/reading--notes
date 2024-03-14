/**
 * 5.3 如何代理 Object
 * 前文仅有访问属性时建立响应式关系，in 存在性判断及 for in 循环时如何建立
 */


let activeEffect
const effctStack = []

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effctStack.push(effectFn)
    const res = fn()
    effctStack.pop()
    activeEffect = effctStack[effctStack.length - 1]
    return res
  }
  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}

function cleanup (effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

const bucket = new WeakMap()

const data = {
  foo: 1,
}

const ITERATE_KEY = Symbol()
const obj = new Proxy(data, {
  // 访问属性
  get (target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  // 判断属性是否存在
  has (target, key) {
    track(target, key)
    return Reflect.has(target, key)
  },
  // 遍历属性
  ownKeys (target) { // key 为 undefined
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  },
  set (target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return res
  }
})

const track = (target, key) => {
  console.log('建立')
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

  const interateEffects = depsMap.get(ITERATE_KEY) // 取得与 ITERATE_KEY 相关联的副作用函数

  const effectsToRun = new Set()
  // 将与 key 相关联的副作用函数添加到 effectsToRun
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  // 将与 ITERATE_KEY 相关联的副作用函数添加到 effectsToRun
  interateEffects && interateEffects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

effect(() => {
  // console.log(obj.bar)
  // if ('bar' in obj) {}
  for (const key in obj) {
    console.log(key)
  }
})

// obj.bar = 2
obj.foo = 2 // foo 变化会导致 bar 变化，所以副作用函数也应触发
