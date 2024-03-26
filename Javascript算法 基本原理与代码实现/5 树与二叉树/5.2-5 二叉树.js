/**
 * 5.2 二叉树
 * 深度遍历的非递归实现优化
 */

class Tree {
  constructor () {
    this.root = null
  }
  // 前序遍历的非递归实现
  preOrder (callback) { // 中左右
    let node = this.root
    const stack = []
    while (node || stack.length) {
      if (node) {
        callback(node) // 中优于左
        stack.push(node)
        node = node.left // 压入 left
      } else {
        node = stack.pop()
        node = node.right // 压入 right
      }
    }
  }
  // 中序遍历的非递归实现
  inOrder (callback) { // 左中右
    let node = this.root
    const stack = []
    while(node || stack.length) {
      if (node) {
        stack.push(node)
        node = node.left
      } else {
        node = stack.pop()
        callback(node) // 中先于右
        node = node.right
      }
    }
  }
  // 后序遍历的非递归实现
  postOrder (callback) { // 左右中
    const out = []
    let node = this.root
    const stack = []
    while (node || stack.length) {
      if (node) {
        stack.push(node)
        out.push(node)
        node = node.right // 先放右
      } else {
        node = stack.pop()
        node = node.left // 放左
      }
    }
    while(out.length) {
      callback(out.pop())
    }
  }
}

function Node (val) {
  this.data = val
  this.left = this.right = null
}

const tree = new Tree()
const root = tree.root = new Node(40)
root.left = new Node(20)
root.right = new Node(51)
root.left.left = new Node(10)
root.left.right = new Node(30)
root.right.left = new Node(50)
root.right.right = new Node(55)

/**
 *        40
 *    20       51
 *  10 30     50 55
 * 
 * 前序遍历：40 20 10 30 51 50 55
 * 中序遍历：10 20 30 40 50 51 55
 * 后续遍历：10 30 20 50 55 51 40
 */

const preArray = []
tree.preOrder((node) => {
  preArray.push(node.data)
})
// console.log(preArray) // 40 20 10 30 51 50 55

const inArray = []
tree.inOrder((node) => {
  inArray.push(node.data)
})
// console.log(inArray) // 10 20 30 40 50 51 55

const postArray = []
tree.postOrder((node) => {
  postArray.push(node.data)
})
console.log(postArray) // 10 30 20 50 55 51 40


