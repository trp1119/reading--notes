/**
 * 5.4 合理地触发响应
 * 目前赋值相同时也会触发副作用函数执行，屏蔽由原型引起的更新
 */

const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE',
}

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
  bar: 2
}

const ITERATE_KEY = Symbol()

// 封装
function reactive (data) {
  return new Proxy(data, {
    get (target, key, receiver) {
      if (key === 'raw') { // 代理对象通过 raw 访问原始数据
        return target
      }
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    has (target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    ownKeys (target) {
      track(target, ITERATE_KEY)
      return Reflect.ownKeys(target)
    },
    set (target, key, newVal, receiver) {
      const oldVal = target[key]
      const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
      const res = Reflect.set(target, key, newVal, receiver)
      console.log(target, key, receiver.raw, target === receiver.raw)
      if (target === receiver.raw) { // receiver 是 target 的代理对象
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) { // 不等且都不是 NaN 才触发响应
          trigger(target, key, type)
        }
      }
      return res
    },
    deleteProperty (target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key)
  
      if (hadKey && res) {
        trigger(target, key, TriggerType.DELETE)
      }
      return res
    }
  })
}

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

const trigger = (target, key, type) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return true
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  
  if (type === TriggerType.ADD || type === TriggerType.DELETE) {
    const interateEffects = depsMap.get(ITERATE_KEY)
    interateEffects && interateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

// const obj = reactive(data)
// effect(() => {
//   console.log(obj.foo)
// })

// obj.foo = 1


const proto = { bar: 2 }
const parent = reactive(proto)
const obj2 = {}
const child = reactive(obj2)

Object.setPrototypeOf(child, parent) // 将 parent 作为 child 原型

effect(() => {
  console.log(child.bar)
})

child.bar = 3
