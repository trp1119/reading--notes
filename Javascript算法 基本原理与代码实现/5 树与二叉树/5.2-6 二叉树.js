/**
 * 5.2 二叉树
 * 一颗二叉查找树（Binary Search Tree，BST），找出树中第 k 大结点
 * 
 * 中序遍历是从小到大的
 * 方法一：中序遍历将二叉树转为数组，取 k-1 值
 */

function kthNode (root, k) {
  if (!root || k < 0) return null
  const array = []

  inOrder(root, array)

  if (k > array.length) return null
  return array[k - 1]
}

function inOrder (root, array) {
  if (root === null) {
    return
  }
  inOrder(root.left, array)
  array.push(root)
  inOrder(root.right, array)
}