/**
 * 5.1 理解 Proxy 和 Reflect
 * 原逻辑对于对象中的 get 中使用 this 无法触发副作用函数
 */

// const a = { foo: 1 }
// console.log(Reflect.get(a, 'foo', { foo: 2 })) // 1 因为 Reflect 仅作用于 getter 访问器函数的 this 上下文

// const b = {
//   foo: 1,
//   get bar () {
//     return this.foo
//   }
// }

// console.log(Reflect.get(b, 'bar', { foo: 2 })) // 2


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
  get bar () {
    return this.foo
  }
}
const obj = new Proxy(data, {
  get (target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set (target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return res
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
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

effect(() => {
  console.log(obj.bar)
})

obj.foo++ // foo 变化会导致 bar 变化，所以副作用函数也应触发
