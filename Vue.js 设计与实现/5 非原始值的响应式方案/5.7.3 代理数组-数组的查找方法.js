/**
 * 5.7 代理数组
 * 5.7.3 数组的查找方法
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
function createReactive (obj, isShallow = false, isReadonLy = false) {
  return new Proxy(obj, {
    get (target, key, receiver) {
      if (key === 'raw') {
        return target
      }

      if (!isReadonLy && typeof key !== 'symbol') { // TODO ???
        track(target, key)
      }

      const res = Reflect.get(target, key, receiver)

      if (isShallow) {
        return res
      }

      if (typeof res === 'object' && res !== null) {
        return isReadonLy ? readonly(res) : reactive(res)
      }
      return res
    },
    has (target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    ownKeys (target) {
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY) // 操作目标是数组则使用 length 属性作为 key 建立响应
      return Reflect.ownKeys(target)
    },
    set (target, key, newVal, receiver) {
      if (isReadonLy) {
        console.warn(`属性 ${key} 是只读的`)
        return true
      }

      const oldVal = target[key]

      const type = Array.isArray(target)
        ? Number(key) < target.length ? TriggerType.SET : TriggerType.ADD
        : Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
      const res = Reflect.set(target, key, newVal, receiver)
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type, newVal)
        }
      }

      return res
    },
    deleteProperty (target, key) {
      if (isReadonLy) {
        console.warn(`属性 ${key} 是只读的`)
        return true
      }

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

const trigger = (target, key, type, newVal) => {
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

  if (type === TriggerType.ADD && Array.isArray(target)) {
    const lengthEffects = depsMap.get('length')
    lengthEffects && lengthEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  if (Array.isArray(target) && key === 'length') {
    depsMap.forEach((effects, index) => {
      if (index >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
          }
        })
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

function reactive (obj) {
  return createReactive(obj)
}

function shallowReactive (obj) {
  return createReactive(obj, true)
}

function readonly (obj) {
  return createReactive(obj, false, true)
}

function shallowReadonly (obj) {
  return createReactive(obj, true, true)
}

const arr = reactive(['foo'])

// effect(() => {
//   for (const key in arr) {
//     console.log(key)
//   }
// })

// arr[1] = 'bar'


effect(() => {
  for (const value of arr) {
    console.log(value)
  }
})

arr[1] = 'bar'

// 数组的 values 方法返回值实际就是数组内建的迭代器
console.log(Array.prototype.values === Array.prototype[Symbol.iterator])
