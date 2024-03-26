/**
 * 4.2 散列函数
 * 链表增删快，查找慢，数组查找快，增删慢
 */

// 不做冲突处理的散列
class Hash {
  constructor () {
    this.table = new Array(1000)
  }
  // 平方求和法
  hash (key) {
    let total = 0
    for (let i = 0; i < key.length; i++) {
      total += key.charCodeAt(i) // chatCodeAt 返回指定位置字符的 unicode 编码
    }
    // 把字符串转化为 unicode 后求和，再进行平方运算
    let s = total * total + ''
    // 保留中间两位
    let index = s.charAt(s.length / 2 - 1) * 10 + s.charAt(s.length / 2) * 1
    console.log(`Hash Value: ${key} -> ${index}`)
    return index
  }
  insert (key, data) {
    let index = this.hash(key)
    this.table[index] = {
      name: key,
      data
    }
  }
  get (key) {
    let index = this.hash(key)
    let node = this.table[index]
    return node && node.data
  }
  forEach (cb) {
    for (let i = 0; i < this.table.length; i++) {
      let node = this.table[i]
      if (node) {
        cb(node.data, node.name) // cb(value, key) => {}
      }
    }
  }
}

let someNames = ['David', 'Jennifer', 'Donnie', 'Raymond', 'Cynthia', 'Mike', 'Clayton', 'Danny', 'Jonathan']
let hash = new Hash()
for (let i = 0; i < someNames.length; i++) {
  hash.insert(someNames[i], someNames[i])
}

hash.forEach((value, key) => {
  console.log(value, key)
})