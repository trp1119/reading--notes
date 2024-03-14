/**
 * 4.8 计算属性 computed 与 lazy
 * 4.8-1 只实现了懒计算，未实现对值进行缓存，即依赖不变，不进行重复计算。不支持 effct 中 computed 变化触发 effect 执行
 */
let activeEffect
const effctStack = []

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effctStack.push(effectFn)
    const res = fn() // 存储 fn 执行结果
    effctStack.pop()
    activeEffect = effctStack[effctStack.length - 1]
    return res
  }
  effectFn.options = options // 增加用户自定义配置
  effectFn.deps = []
  // 只有非 lazy 的时候，才执行
  if (!options.lazy) {
    effectFn()
  }
  return effectFn // 将副作用函数作为返回值返回
}

function cleanup (effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

const bucket = new WeakMap()

const data = { foo: 1, bar: 2 }
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


function computed(getter) {
  let value // 缓存上一次的值
  let dirty = true // 标识是否需要重新计算，true 为脏，需要计算

  const effectFn = effect(getter, {
    lazy: true,
    scheduler () {
      dirty = true
      trigger(obj, 'value') // 计算属性依赖的响应式数据变化时，手动调用 trigger 触发响应
    }
  })

  const obj = {
    get value () {
      if (dirty) {
        value = effectFn()
        dirty = false // 下一次访问缓存
      }
      track(obj, 'value') // 当读取 value 时，手动调用 track 进行跟踪
      return value
    }
  }
  return obj
}

const sumRes = computed(() => obj.foo + obj.bar)

console.log(sumRes.value)

setTimeout(() => {
  obj.foo++
  console.log(sumRes.value)
}, 1000)


effect(() => {
  console.log('effect 内 computed 变化', sumRes.value)
})