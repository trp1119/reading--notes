/**
 * 5.2 二叉树
 * 一颗二叉查找树（Binary Search Tree，BST），找出树中第 k 大结点
 * 
 * 中序遍历是从小到大的
 * 方法二：中序遍历过程中累计访问节点数，到的 k 截止
 */

let index = 0
function kthNode (root, k) {
  if (root) {
    let node = kthNode(root.left, k)
    if (node !== null) {
      return node
    }
    index++
    if (index === k) {
      return root
    }
    node = kthNode(node.right, k)
    if (node !== null) {
      return node
    }

    return null
  }
}
