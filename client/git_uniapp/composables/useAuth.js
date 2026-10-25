import { ref } from 'vue'
import { apiLogin, apiRegister } from '@/api/apis.js'

/**
 * 认证逻辑 — 登录/注册/登出/状态管理
 */
export function useAuth(onLoginSuccess) {
  const isLoggedIn = ref(false)
  const currentUserId = ref(null)
  const username = ref('')
  const showUserMenu = ref(false)

  // 登录弹窗状态
  const showLoginDialog = ref(false)
  const loginUsername = ref('')
  const loginPassword = ref('')
  const loginError = ref('')
  const isLoggingIn = ref(false)
  const loginMode = ref('login')   // 'login' | 'register'
  const loginStudentId = ref('')   // 实际是手机号

  // ==================== 登录状态检查 ====================

  function checkLoginStatus() {
    return new Promise((resolve) => {
      try {
        const userId = uni.getStorageSync('userId')
        const storedUsername = uni.getStorageSync('username')
        if (userId && storedUsername) {
          isLoggedIn.value = true
          currentUserId.value = userId
          username.value = storedUsername
          resolve(true)
        } else {
          isLoggedIn.value = false
          currentUserId.value = null
          username.value = ''
          resolve(false)
        }
      } catch {
        isLoggedIn.value = false
        currentUserId.value = null
        username.value = ''
        resolve(false)
      }
    })
  }

  // ==================== 登出 ====================

  function logout() {
    uni.removeStorageSync('userId')
    uni.removeStorageSync('username')
    isLoggedIn.value = false
    currentUserId.value = null
    username.value = ''
    showUserMenu.value = false
    uni.showToast({ title: '已退出登录', icon: 'success' })
  }

  // ==================== 登录/注册 ====================

  function submitLogin(data) {
    const loginData = data || {
      username: loginUsername.value.trim(),
      password: loginPassword.value
    }

    if (!loginData.username || !loginData.password) {
      loginError.value = '请输入用户名和密码'
      return
    }

    isLoggingIn.value = true
    loginError.value = ''

    const userData = {
      username: loginData.username,
      password: loginData.password
    }

    const apiMethod = loginMode.value === 'login' ? apiLogin : apiRegister

    apiMethod(userData)
      .then(res => {
        if (res.code === 1) {
          uni.showToast({
            title: loginMode.value === 'login' ? '登录成功' : '注册成功',
            icon: 'success'
          })
          const userId = res.data?.id || ''
          const usernameVal = res.data?.username || loginData.username
          uni.setStorageSync('userId', userId)
          uni.setStorageSync('username', usernameVal)
          isLoggedIn.value = true
          currentUserId.value = userId
          username.value = usernameVal
          hideLoginDialog()
          showUserMenu.value = false
          if (typeof onLoginSuccess === 'function') onLoginSuccess()
        } else {
          loginError.value = res.msg || (loginMode.value === 'login' ? '登录失败' : '注册失败')
        }
      })
      .catch(() => {
        loginError.value = '网络错误，' + (loginMode.value === 'login' ? '登录' : '注册') + '失败'
      })
      .finally(() => {
        isLoggingIn.value = false
      })
  }

  function hideLoginDialog() {
    showLoginDialog.value = false
    loginError.value = ''
    isLoggingIn.value = false
    loginStudentId.value = ''
  }

  function switchLoginMode() {
    loginMode.value = loginMode.value === 'login' ? 'register' : 'login'
    loginError.value = ''
  }

  // ==================== 用户菜单 ====================

  function toggleUserMenu() {
    showUserMenu.value = !showUserMenu.value
  }

  return {
    // 状态
    isLoggedIn, currentUserId, username, showUserMenu,
    showLoginDialog, loginUsername, loginPassword, loginError,
    isLoggingIn, loginMode, loginStudentId,
    // 方法
    checkLoginStatus, logout, submitLogin, hideLoginDialog,
    switchLoginMode, toggleUserMenu,
  }
}
