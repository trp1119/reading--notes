/**
 * 4.4 散列的应用
 * 4.4.3 两数之和
 * 
 * 一边查找，一边存储
 */

function twoSum(numbers, target) {
  const hash = {}
  let res = []
  numbers.forEach((i, index) => {
    if (hash[i]) {
      res = [hash[i], index]
    } else {
      hash[target - i] = index // 存储需要的值
    }
  })
  return res
}

console.log(twoSum([5, 75, 25], 100))