/**
 * 4.3 散列冲突的解决方案
 * 解决方案2：
 * 4.3.2 闭散列方法 closed hashing ：将冲突记录在表内，解约空间
 */

// 二次探测散列：线性探测插入 key 太集中，二次探测使 key 值稍微分散

class Node {
  constructor (name, data) {
    this.name = name
    this.data = data
    this.state = true
  }
}

class Hash {
  constructor () {
    this.table = []
    this.capacity = 100 // 容量
    this.length = 0
  }
  hash (s) {
    /**
     * 在编程中，"seed"（种子）通常指的是一个用于生成随机数序列的起始值。随机数生成算法通常基于一个种子值来计算出随机数序列。这样的设计允许在需要随机数时，通过指定相同的种子值来获取相同的随机数序列，从而使得程序的行为可预测。
     */
    const seed = 131
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + hash * seed
    }
    return (hash & 0x7FFFFFFF)
  }
  getHash(key, capacity) {
    return this.hash(key + '') % capacity
  }
  size () {
    return this.length
  }
  insert (key, value) {
    let inserted = false
    const index = this.find(key, function (item) {
      item.data = value
      if (!item.state) {
        this.length++
      }
      inserted = item.state = true
    })
    if (!inserted) {
      this.table[index] = new Node(key, value)
      this.length++
    }
    if (this.length * 10 / this.capacity > 6) {
      this.capacity *= 2
    }
    return true
  }
  find (key, cb) {
    let index = this.getHash(key, this.capacity),
      i = 1,
      table = this.table
    while(table[index]) {
      if (table[index].name === key + '') {
        cb.call(this, table[index])
      }
      index = index + 2 * i - 1
      index %= this.capacity
      i++
    }
    return index
  }
  get (key) {
    let value = null
    this.find(key, function (item) {
      if (item.state) {
        value = item.data
      }
    })
    return value
  }
  remove (key) {
    const oldSize = this.length
    this.find(key, function (item) {
      item.state = false
      this.length--
      if (this.length * 10 / this.capacity < 6) {
        this.capacity /= 2
      }
    })
    return this.length !== oldSize
  }
  forEach(cb) {
    for (let i = 0; i < this.capacity; i++) {
      const el = this.table[i]
      if (el && el.state) {
        cb(el.name, el.data)
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

hash.forEach((el, i) => {
  console.log(el, i)
})