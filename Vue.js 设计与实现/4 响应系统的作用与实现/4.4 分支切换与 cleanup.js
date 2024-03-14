/**
 * 4.4 分支切换与 cleanup
 * 处理 if
 */

// 解决：每次副作用函数执行时，先把它从与之关联的依赖集合中删除。执行完毕后，重新建立联系（执行时会读取值，天生就会重新 set activeEffect，以前只不过是用 set 去重了）

let activeEffect

// 此时 effect 函数用于注册副作用函数！！！
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
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

effect(function effectFn () {
  console.log(obj.ok ? obj.text : '1')
})

setTimeout(() => {
  obj.ok = false // 执行副作用函数时重新建立的依赖
}, 1000)

setTimeout(() => {
  obj.text = 'hello vue3' // 依赖已无，此时修改不再执行副作用函数
}, 2000)