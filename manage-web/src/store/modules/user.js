import { defineStore } from 'pinia'
import router from '@/router'
import { ElMessageBox } from 'element-plus'
import { login, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isEmpty } from "@/utils/validate"
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      nickName: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
    actions: {
      // 登录
      async login(loginData) {
        try {
          const username = loginData.username.trim()
          const password = loginData.password
          const data = await login(username, password)
          
          // 成功登录 - 响应拦截器已处理，直接返回token
          const token = data.token
          setToken(token)
          this.token = token
          return data
        } catch (error) {
          // 如果是网络错误或其他错误，也需要处理
          console.error('Login error:', error)
          throw error
        }
      },
      // 获取用户信息
      async getInfo() {
        try {
          // 默认设置管理员角色
          this.roles = ['admin']
          this.permissions = []
          this.id = '1'
          this.name = 'admin'
          this.nickName = '管理员'
          this.avatar = defAva
          console.log('User info loaded:', this)
          
          // 引入权限模块并生成路由
          const usePermissionStore = (await import('@/store/modules/permission')).default
          const permissionStore = usePermissionStore()
          await permissionStore.generateRoutes(this.roles)
          
          return {}
        } catch (error) {
          console.error('Failed to get user info:', error)
          throw error
        }
      },
      // 退出系统
      logOut() {
        return new Promise((resolve) => {
          // 不调用后端接口，直接清除本地数据
          this.token = ''
          this.roles = []
          this.permissions = []
          removeToken()
          resolve()
        })
      }
    }
  })

export default useUserStore
