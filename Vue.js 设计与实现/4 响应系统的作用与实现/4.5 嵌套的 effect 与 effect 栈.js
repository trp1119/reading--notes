/**
 * 4.5 嵌套的 effect 与 effect 栈
 * 例如：组件嵌套
 * 嵌套时，外层副作用函数执行，设置 activeEffect，然后内存副作用函数执行，又重设了 activeEffect，回到外层副作用函数读取值进行绑定时，绑定的已经是内层 activeEffect，导致绑定出错
 */

let activeEffect
const effctStack = [] // 副作用函数栈

// 此时 effect 函数用于注册副作用函数！！！
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effctStack.push(effectFn) // 入栈
    fn()
    effctStack.pop() // 内层执行完毕，将自己的 effectFn 弹出，此时栈顶的及上一级副作用函数
    activeEffect = effctStack[effctStack.length - 1] // 重新绑定
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

const data = { text: 'hello world', ok: true }
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
  // deps 就是一个与当前副作用函数存在关联的依赖集合 key -> [activeEffect]
  activeEffect.deps.push(deps)
}

const trigger = (target, key) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return true
  const effects = depsMap.get(key)

  const effectsToRun = new Set(effects) // 创造新 set 进行遍历，防止执行 effectFn，清除 deps 后，执行 fn() 读取值又填充 deps，导致无限循环
  effectsToRun.forEach(effectFn => effectFn())
}

let temp

effect(function effectFn1 () {
  console.log('执行 effectFn1')
  effect(function effectFn2 () {
    console.log('执行 effectFn2 ' + obj.ok)
  })
  temp = obj.text // 放到嵌套副作用函数后读取会导致副作用函数绑定错误！！！
})

// setTimeout(() => {
//   obj.ok = false // 执行副作用函数时重新建立的依赖
// }, 1000)

setTimeout(() => {
  obj.text = 'hello vue3' // 依赖已无，此时修改不再执行副作用函数
}, 2000)