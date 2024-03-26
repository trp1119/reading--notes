/**
 * 5.2 二叉树
 * 广度优先遍历
 */

class Tree {
  constructor () {
    this.root = null
  }
  levelOrder (callback) {
    const quene = []
    let node = this.root
    node && quene.push(node)
    while (quene.length) {
      const node = quene.shift()
      callback(node)
      const { left, right } = node
      if (left) {
        quene.push(left)
      }
      if (right) {
        quene.push(right)
      }
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
 * 广度优先：40 20 51 10 30 50 55
 */

const levelArray = []
tree.levelOrder((node) => {
  levelArray.push(node.data)
})
console.log(levelArray) // 40 20 51 10 30 50 55