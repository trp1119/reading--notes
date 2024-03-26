/**
 * 4.3 散列冲突的解决方案
 * 不同 key 得到相同的 index
 * 解决方案1：
 * 4.3.1 开散列方法 open hashing ：将冲突记录在表外
 * (拉链法)
 */

class Node {
  constructor(name, data) {
    this.name = name
    this.data = data
    this.next = null
  }
}

class Hash {
  constructor () {
    this.table = []
  }
  // 除留余数法
  hash (key) {
    key += '' // 强制转化为字符串
    let HASHSIZE = 100
    let h = 0
    for (let i = 0; i < key.length; i ++) {
      h = key.charCodeAt(i) + h * 31 // 将字符串按照特定关系转化为一个整数
    }
    return h % HASHSIZE
  }
  loopup (key) { // 给定键查找对应值
    let hashValue = this.hash(key)
    let node = this.table[hashValue]
    while (node) {
      if (node.name === key + '') {
        return node
      }
      node = node.next
    }
  }
  get (key) {
    let node = this.loopup(key)
    return (node && node.data !== null) ? node.data : null
  }
  remove (key) {
    let node = this.loopup(key)
    if (node) {
      node.data = null // 实际并没有删除
    }
  }
  insert (key, data) {
    let hashValue = this.hash(key)
    let node = this.table[hashValue]
    let next = node
    if (node) {
      do {
        if (node.name === key + '') {
          node.data = data
          return
        }
      } while (node = node.next)
    }
    let np = new Node(key, data)
    this.table[hashValue] = np
    np.next = next // 头插法
  }
  forEach (cb) {
    for (let i = 0; i < 100; i++) { // HASHSIZE = 100
      let link= this.table[i]
      if (link) {
        while (link) {
          if (link.data  !== null) { // remove key 时置为 null 了
            cb(link.name, link.data)
          }
          link = link.next
        }
      }
    }
  }
}

let names = ['First Name', 'Last Name', 'address', 'phone', 'k101', 'k110']
let descs = ['Kobe', 'Bryant', 'USA', '26300788', 'Value1', 'Value2']
let hash = new Hash()
for (let i = 0; i < 6; i++) {
  hash.insert(names[i], descs[i])
}

console.log(hash.get('k110'))
hash.insert('phone', '9433120451')
console.log(hash.get('k101'), hash.get('phone'))