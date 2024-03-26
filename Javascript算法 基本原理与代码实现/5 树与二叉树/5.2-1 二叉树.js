/**
 * 二叉树
 */
class Node {
  // 孩子兄弟表示法
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
  // 插入
  insert (data) {
    // arr 16,   14,   10,  8,    7,     9,    3,    2,    4,    1
    // dir       true false true  false  true  false true  false true
    const dir = this._insertLeft = !this._insertLeft // 插入方向 true ->
    // console.log(dir, data)
    function insertIt(node, data) {
      if (node.data === data) {
        return false
      } else if (!node.left) {
        // console.log('插入左')
        node.left = new Node(data)
        node.left.parent = node
        return true
      } else if (!node.right) {
        // console.log('插入右')
        node.right = new Node(data)
        node.right.parent = node
        return true
      } else {
        if (dir === true) {
          return insertIt(node.left, data) // 递归
        } else {
          return insertIt(node.right, data) // 递归
        }
      }
    }
    let ret = false
    if (!this.root) {
      this.root = new Node(data)
      // this._insertLeft = !this._insertLeft
      return true
    } else {
      ret = insertIt(this.root, data)
    }
    if (ret) {
      this._size++
    }
    return ret
  }
  // 查找
  find (data) {
    let ret = null
    function findIt (node, data) {
      if (node) {
        if (node.data === data) {
          ret = node
        } else {
          // 递归
          findIt(node.left, data)
          findIt(node.right, data)
        }
      }
    }
    findIt(this.root, data)
    return ret
  }
  // 删除
  // TODO
  // remove (data) {
  //   let node = this.find(data)
  //   if (data) {
  //     this._size--
  //     if (data === this.root) {
  //       this.node = null
  //       return true
  //     }
  //     let left = node.left, right = node.right, parent = node.parent, isLeft = parent && parent.left === node
  //     if (!left && !right) { // 没有孩子结点
  //       if (isLeft) {
  //         parent.left = null
  //       } else {
  //         parent.right = null
  //       }
  //     } else if (left && !right) { // 只有左孩子结点 
  //       if (isLeft) {
  //         parent.left = left
  //       } else {
  //         parent.right = left
  //       }
  //       left.parent = parent
  //     } else if (!left && right) { // 只有右孩子结点 
  //       if (isLeft) {
  //         parent.left = right
  //       } else {
  //         parent.right = right
  //       }
  //       right.parent = parent
  //     } else if (left && right) { // 两个孩子结点
  //       let child = right
  //       while (child.left) {
  //         child = child.data
  //       }
  //       node.data = child.data
  //       this.remove(node.data)
  //     }
  //   }
  // }
  remove (data) {
    const p = this.find(data)
    if (p) {
      this.removeNode(p) // 方便递归
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
    // replace 表示删除之后顶替上来的结点
    // parent 为replace 结点的父结点
  
    // 如果删除的结点左右孩子都有
    if (node.left != null && node.right != null) {
      let succ = null
      for (succ = node.right; succ.left != null; succ = succ.left) // 找到后继
      node.data = succ.data // 覆盖值
      this.removeNode(succ) // 递归删除，只可能递归一次
    } else {
      // 叶子或只有一个孩子
      let child = node.left || node.right || null
      this.transplant(node, child)
    }
  }
  // 最小值一定位于树的最左边
  minNode () {
    let cur = node || this.root
    while (cur.left) {
      cur = cur.left
    }
    return cur
  }
  // 最大值一定位于数的最右边
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
  // 获取树的结点数
  size () {
    // return this._size // 或者 this.getNodeSize(this.root)
    this.getNodeSize(this.root)
  }
  // 获取指定结点子树数（含结点）
  getNodeSize (node) {
    if (node === null) return 0
    const leftChildSize = this.getNodeSize(node.left)
    const rightChildSize = this.getNodeSize(node.right)
    return leftChildSize + rightChildSize + 1
  }
  // 获取树高度
  height () {
    return this.getNodeHeight(this.root)
  }
  // 获取指定结点的度
  getNodeHeight (node) {
    if (node === null) return 0 // 递归出口
    const leftChildHeight = this.getNodeHeight(node.left)
    const rightChildHeight = this.getNodeHeight(node.right)
    const max = Math.max(leftChildHeight, rightChildHeight)
    return max + 1 // 加上自己
  }
}

const arr = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1]
// const arr = [16, 14, 10, 8, 7]
const tree = new Tree()
arr.forEach(i => {
  tree.insert(i)
})
console.log(tree.find(9))
