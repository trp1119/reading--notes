/**
 * 4.6 避免无限递归
 * 
 * 缺陷：前文一直是副作用函数中读取值，但当在副作用函数中进行自增设置时，副作用函数执行，先读取值，调用 track 进行存储当前副作用函数，然后设置值，调用 trigger 进行读取执行当前副作用函数。但此时副作用那个函数并未执行完毕，又执行了新的。进入无限递归，导致栈溢出
 */

let activeEffect
const effctStack = []

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effctStack.push(effectFn)
    fn()
    effctStack.pop()
    activeEffect = effctStack[effctStack.length - 1]
  }
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
    if (effectFn !== activeEffect) { // 添加守卫条件，如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
      effectsToRun.add(effectFn)
    } else {
      console.log('相同，不添加')
    }
  })
  effectsToRun.forEach(effectFn => effectFn())
}

let temp

effect(function effectFn () {
  console.log('设置值')
  obj.text += ' hello vue3'
})