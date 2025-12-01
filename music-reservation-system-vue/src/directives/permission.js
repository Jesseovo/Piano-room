/**
 * 权限控制指令
 * 用于根据用户角色或权限控制元素的显示和隐藏
 */
import store from '@/store'

// 检查用户是否有权限
function checkPermission(el, binding) {
  const { value } = binding
  const userRoles = store.getters.currentUser?.userType || ''
  
  if (value && value instanceof Array) {
    if (value.length > 0) {
      // 检查用户类型是否在允许的角色列表中
      const hasPermission = value.includes(userRoles)
        
      if (!hasPermission) {
        // 如果没有权限，元素将被移除
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    throw new Error(`需要指定角色! 例如 v-permission="['admin','teacher']"`)
  }
}

export default {
  // 指令插入到DOM时执行
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  // 组件更新时执行
  update(el, binding) {
    checkPermission(el, binding)
  }
}