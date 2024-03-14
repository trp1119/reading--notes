/**
 * 5.5 浅响应与深响应
 * 目前 reactive 为浅响应，无法对 obj.foo.bar 触发副作用函数执行，即深响应
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

const ITERATE_KEY = Symbol()

// 封装
function reactive (data) {
  return new Proxy(data, {
    get (target, key, receiver) {
      if (key === 'raw') {
        return target
      }
      track(target, key)

      const res = Reflect.get(target, key, receiver)
      if (typeof res === 'object' && res !== null) { // 如果是普通对象，则将结果 递归 包装成响应式数据并返回
        return reactive(res)
      }
      return res
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
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
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

const data = {
  foo: {
    bar: 1
  },
}

const obj = reactive(data)

effect(() => {
  console.log(obj.foo.bar)
})

obj.foo.bar = 2
