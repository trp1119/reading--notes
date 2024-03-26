/**
 * 4.4 散列的应用
 * 4.4.2 求只出现一次的数字
 */

const number = [2, 3, 4, 2, 5, 6, 4, 88, 1]
const hash = {}
number.forEach(i => {
  if (hash[i]) {
    hash[i].count++
  } else {
    hash[i] = {
      data: i,
      count: 1
    }
  }
})
let ret = []
Object.values(hash).forEach(value => {
  if (value.count === 1) {
    ret.push(value.data)
  }
})

console.log(hash, ret)

