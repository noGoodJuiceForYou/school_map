import { defineStore } from 'pinia'
import router, { constantRoutes } from '@/router'

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      sidebarRouters: []
    }),
    actions: {
      setRoutes(routes) {
        this.routes = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
      },
      generateRoutes(roles) {
        return new Promise(resolve => {
          this.setRoutes(constantRoutes)
          this.setSidebarRouters(constantRoutes)
          resolve(constantRoutes)
        })
      }
    }
  })

export default usePermissionStore
