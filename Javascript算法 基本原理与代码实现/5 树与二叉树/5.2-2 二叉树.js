/**
 * 二叉树
 * 
 * 找到匹配的字符串、文本分词、文件路径
 * 
 * 树的深度优先遍历：前序遍历、中序遍历、后序遍历
 */
class Node {
  constructor (data) {
    this.parent = null
    this.data = data
    this.left = null
    this.right = null
  }
}

class Tree {
  constructor () {
    this.root = null
    this._size = 0
  }
  insert (data) {
    const dir = this._insertLeft = !this._insertLeft
    function insertIt(node, data) {
      if (node.data === data) {
        return false
      } else if (!node.left) {
        node.left = new Node(data)
        node.left.parent = node
        return true
      } else if (!node.right) {
        node.right = new Node(data)
        node.right.parent = node
        return true
      } else {
        if (dir === true) {
          return insertIt(node.left, data)
        } else {
          return insertIt(node.right, data)
        }
      }
    }
    let ret = false
    if (!this.root) {
      this.root = new Node(data)
      return true
    } else {
      ret = insertIt(this.root, data)
    }
    if (ret) {
      this._size++
    }
    return ret
  }
  find (data) {
    let ret = null
    function findIt (node, data) {
      if (node) {
        if (node.data === data) {
          ret = node
        } else {
          findIt(node.left, data)
          findIt(node.right, data)
        }
      }
    }
    findIt(this.root, data)
    return ret
  }
  remove (data) {
    const p = this.find(data)
    if (p) {
      this.removeNode(p)
      this._size--
    }
  }
  transplant (node, child) {
    if (node.parent === null) {
      this.root = child
    } else if (node === node.parent.left) {
      node.parent.left = child
    } else {
      node.parent.right = child
    }
    if (child) {
      child.parent = node.parent
    }
  }
  removeNode (node) {
    if (node.left != null && node.right != null) {
      let succ = null
      for (succ = node.right; succ.left != null; succ = succ.left)
      node.data = succ.data
      this.removeNode(succ)
    } else {
      let child = node.left || node.right || null
      this.transplant(node, child)
    }
  }
  minNode () {
    let cur = node || this.root
    while (cur.left) {
      cur = cur.left
    }
    return cur
  }
  maxNode (node) {
    let cur = node || this.root
    while (cur.right) {
      cur = cur.right
    }
    return cur
  }
  min () {
    const node = this.minNode()
    return node?.data || null
  }
  max () {
    const node = this.maxNode()
    return node?.data || null
  }
  size () {
    this.getNodeSize(this.root)
  }
  getNodeSize (node) {
    if (node === null) return 0
    const leftChildSize = this.getNodeSize(node.left)
    const rightChildSize = this.getNodeSize(node.right)
    return leftChildSize + rightChildSize + 1
  }
  height () {
    return this.getNodeHeight(this.root)
  }
  getNodeHeight (node) {
    if (node === null) return 0
    const leftChildHeight = this.getNodeHeight(node.left)
    const rightChildHeight = this.getNodeHeight(node.right)
    const max = Math.max(leftChildHeight, rightChildHeight)
    return max + 1
  }
  // 前序遍历
  preOrder (callback) {
    this._forEach(this.root, callback, 'pre')
  }
  // 中序遍历
  inOrder (callback) {
    this._forEach(this.root, callback, 'middle')
  }
  // 后序遍历
  postOrder (callback) {
    this._forEach(this.root, callback, 'post')
  }
  _forEach (node, callback, type) {
    if (node) {
      if (type === 'pre') { // 中左右
        callback(node)
        this._forEach(node.left, callback, type)
        this._forEach(node.right, callback, type)
      } else if (type === 'middle') { // 左中右
        this._forEach(node.left, callback, type)
        callback(node)
        this._forEach(node.right, callback, type)
      } else if (type === 'post') { // 左右中
        this._forEach(node.left, callback, type)
        this._forEach(node.right, callback, type)
        callback(node)
      }
    }
  }
}

const arr = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1]
// const arr = [16, 14, 10, 8, 7]
const tree = new Tree()
arr.forEach(i => {
  tree.insert(i)
})
console.log(tree.find(9))
