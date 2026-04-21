import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getUserName, removeUserName } from '@/utils/auth'
import { isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

NProgress.configure({ showSpinner: false })

const whiteList = ['/', '/login', '/register']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  
  if (getUserName()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has username*/
    if (to.path === '/') {
      // 如果已登录，访问登录页面(/)，重定向到首页
      next({ path: '/index' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          next({ ...to, replace: true })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
      // 没有username
      if (isWhiteList(to.path)) {
        // 在免登录白名单，直接进入
        next()
      } else {
        next(`/?redirect=${to.fullPath}`) // 否则全部重定向到登录页(/)
        NProgress.done()
      }
    }
})

router.afterEach(() => {
  NProgress.done()
})
