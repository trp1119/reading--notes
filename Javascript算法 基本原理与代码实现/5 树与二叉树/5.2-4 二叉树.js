/**
 * 5.2 二叉树
 * 深度遍历的非递归实现
 */

class Tree {
  constructor () {
    this.root = null
  }
  // 前序遍历的非递归实现
  preOrder (callback) {
    const node = this.root
    const stack = []
    node && stack.push(node)
    while (stack.length) {
      const node = stack.pop() // 压入立即弹出
      callback(node)
      const { left, right } = node
      if (right) {
        stack.push(right)
      }
      if (left) {
        stack.push(left)
      }
    }
  }
  // 中序遍历的非递归实现
  inOrder (callback) {
    let node = this.root
    let stack = [], hasRight = false
    node && stack.push(node) // 根节点入栈
    while (stack.length) {
      while (node.left) { // 左侧依次入栈
        stack.push(node.left)
        node = node.left
      }
      hasRight = false
      while (stack.length && !hasRight) {
        node = stack.pop()
        callback(node)
        const right = node.right
        if (right) {
          stack.push(right)
          node = right
          hasRight = true
        }
      }
    }
  }
  // 后序遍历的非递归实现 // TODO
  // postOrder (callback) {
  //   let node = this.root
  //   let stack = [], visited = false;
  //   node && stack.push(node)
  //   while (stack.length) {
  //     node = stack[stack.length - 1] // 没有弹出
  //     if ((!node.left && !node.right) || (visited && (visited === node.left || visited === node.right))) {
  //       callback(node)
  //       stack.pop()
  //       visited = node
  //     } else {
  //       if (node.right) {
  //         stack.push(node.right)
  //       }
  //       if (node.left) {
  //         stack.push(node.left)
  //       }
  //     }
  //   }
  // }
  // 前序 根 -> 左 -> 右
  // 后续 左 -> 右 -> 根 （根 -> 右 -> 左 反转）
  postOrder (callback) {
    let node = this.root
    const stack = []
    const out = []
    node && stack.push(node)
    while (stack.length) {
      const node = stack.pop() // 压入立即弹出
      out.push(node)
      const { left, right } = node
      if (left) {
        stack.push(left)
      }
      if (right) {
        stack.push(right)
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


