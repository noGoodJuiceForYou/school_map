// 地图配置文件
// 高德 key 从 .env 读取（参考 .env.example），不要写死在代码里
export default {
  // 高德地图 JS API 配置
  amap: {
    key: import.meta.env.VITE_AMAP_KEY || '',
    securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE || '',
    version: '2.0',
    plugins: ['AMap.Walking', 'AMap.Riding', 'AMap.Driving']
  },
  
  // 地图默认配置
  default: {
    center: [118.045311, 24.366802], // 厦门大学嘉庚学院（回退到原位置，再向西移动1公里，然后向东移动0.5公里）
    zoom: 16,
    viewMode: '3D'
  }
}