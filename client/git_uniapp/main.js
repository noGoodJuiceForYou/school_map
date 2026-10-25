import App from './App'
import mapConfig from '@/config/map.js'

// #ifdef H5
// 高德 key / 安全密钥来自 .env，避免写死在源码与 index.html 中
;(function loadAMap() {
  const { key, securityJsCode } = mapConfig.amap
  if (!key) {
    console.error('[map] 未配置 VITE_AMAP_KEY，请复制 .env.example 为 .env 并填入高德 key')
    return
  }
  window._AMapSecurityConfig = { securityJsCode }
  const script = document.createElement('script')
  script.src = `https://webapi.amap.com/maps?v=${mapConfig.amap.version}&key=${key}&plugins=AMap.SimpleMarker`
  document.head.appendChild(script)
})()
// #endif

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif