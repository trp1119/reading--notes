/**
 * 4.4 散列的应用
 * 通常不会使用 Hash 类型，直接使用空对象（性能极佳的散列）
 * 4.4.1 数组去重
 */

const number = [2, 3, 4, 2, 5, 6, 4, 88, 1]
const hash = {}
number.forEach(i => {
  hash[`.${i}`] = i // 加 . 保证原顺序
})
let ret = []
Object.values(hash).forEach(value => {
  ret.push(value)
})

console.log(hash, ret)

