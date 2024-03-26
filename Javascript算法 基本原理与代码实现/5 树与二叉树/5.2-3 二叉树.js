/**
 * 二叉树
 * 
 * 树的深度优先遍历
 * 
 * 已知前序遍历 GDAFEMHZ，中序遍历 ADEFGHMZ，求后序遍历
 * 
 */
function getPostorder (preorder, inorder, postorder) {
  let root = preorder[0], inLeftTree = [], inRightTree = [], list = inLeftTree;
  postorder = postorder || []

  // 分离中序遍历的左右子树
  for (let i = 0; i < inorder.length; i++) {
    if (inorder[i] !== root) {
      list.push(inorder[i])
    } else {
      list = inRightTree
    }
  }
  // inLeftTree [ 'A', 'D', 'E', 'F' ] inRightTree [ 'H', 'M', 'Z' ]

  // 分离前序遍历的左右子树
  let boundary = inLeftTree.length, preLeftTree = [], preRightTree = []
  for (let i = 1;  i < preorder.length; i++) {
    const el = preorder[i]
    if (preLeftTree.length < boundary) {
      preLeftTree.push(el)
    } else {
      preRightTree.push(el)
    }
  }
  // preLeftTree [ 'D', 'A', 'F', 'E' ] preRightTree [ 'M', 'H', 'Z' ]
  
  // 后序遍历，左树递归
  if (preLeftTree.length) {
    getPostorder(preLeftTree, inLeftTree, postorder)
  }
  // 后续遍历，右树递归
  if (preRightTree.length) {
    getPostorder(preRightTree, inRightTree, postorder)
  }
  // 后序遍历，处理根
  if (root) {
    postorder.push(root)
  }
  return postorder
}
const preorder = 'GDAFEMHZ'.split('')
const inorder = 'ADEFGHMZ'.split('')
console.log(getPostorder(preorder, inorder))

/**
 *        G
 *    D        M
 *  A   F    H   Z
 *      E
 */
