<template>
  <view class="person-view">
    <view class="top-decoration" :style="{ transform: `translateY(${scrollTop * 0.5}px)`, opacity: 1 - scrollTop / 200 }"></view>
    
    <uni-transition mode="out-in" type="slide-bottom" :show="showUserInfo" :duration="300">
      <view class="user-info-section" @click="handleUserInfoClick">
        <view class="user-avatar">
          <image :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
          <view class="avatar-badge" v-if="hasNewMessage">
            <view class="badge-dot"></view>
          </view>
        </view>
        <view class="user-details">
          <view class="user-name">{{ userInfo.username || '未登录用户' }}</view>
          <view class="user-id">ID: {{ userInfo.userId || '------' }}</view>
          <view class="user-level" v-if="userInfo.level">
            <text class="level-tag">Lv.{{ userInfo.level }}</text>
            <text class="level-desc">{{ getLevelDescription(userInfo.level) }}</text>
          </view>
        </view>
        <view class="edit-btn" @click.stop="handleEditProfile">
          <text class="edit-text">编辑资料</text>
          <uni-icons type="right" size="14" color="#1890ff"></uni-icons>
        </view>
      </view>
    </uni-transition>

    <view class="stats-section">
      <view class="stat-item" @click="navigateToMap('favorites')">
        <view class="stat-number">{{ stats.favorites }}</view>
        <view class="stat-label">收藏</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="navigateToMap('history')">
        <view class="stat-number">{{ stats.history }}</view>
        <view class="stat-label">历史</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="navigateToMap('plans')">
        <view class="stat-number">{{ stats.plans }}</view>
        <view class="stat-label">规划</view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-group-title">我的地图</view>
        
        <view class="menu-item" @click="navigateToMap('collections')" hover-class="menu-hover">
          <view class="menu-icon"><uni-icons type="star-filled" size="22" color="#FF9500"></uni-icons></view>
          <view class="menu-text">收藏地点</view>
          <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
        </view>
        
        <view class="menu-item" @click="navigateToMap('history')" hover-class="menu-hover">
          <view class="menu-icon"><uni-icons type="time" size="22" color="#5AC8FA"></uni-icons></view>
          <view class="menu-text">历史记录</view>
          <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
        </view>
        
        <view class="menu-item" @click="navigateToMap('routes')" hover-class="menu-hover">
          <view class="menu-icon"><uni-icons type="navigate" size="22" color="#FF2D55"></uni-icons></view>
          <view class="menu-text">路线规划历史</view>
          <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-group-title">其他功能</view>
        <view class="menu-item" @click="handleMenuItemClick('help')" hover-class="menu-hover">
          <view class="menu-icon"><uni-icons type="help-filled" size="22" color="#4CD964"></uni-icons></view>
          <view class="menu-text">帮助中心</view>
          <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
        </view>
        <view class="menu-item" @click="handleMenuItemClick('feedback')" hover-class="menu-hover">
          <view class="menu-icon"><uni-icons type="chatboxes" size="22" color="#FFCC00"></uni-icons></view>
          <view class="menu-text">意见反馈</view>
          <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
        </view>
      </view>
    </view>

    <view class="settings-section">
      <view class="menu-group">
        <view class="menu-group-title">设置</view>
        <view class="menu-item" @click="handleClearCache" hover-class="menu-hover">
          <view class="menu-icon"><uni-icons type="trash" size="22" color="#FF9500"></uni-icons></view>
          <view class="menu-text">清除缓存</view>
          <view class="cache-size">{{ cacheSize }}</view>
        </view>
        <view class="menu-item" @click="handleMenuItemClick('privacy')" hover-class="menu-hover">
          <view class="menu-icon"><uni-icons type="locked-filled" size="22" color="#5AC8FA"></uni-icons></view>
          <view class="menu-text">隐私设置</view>
          <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
        </view>
      </view>
    </view>

    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout" hover-class="logout-btn-hover">退出登录</button>
    </view>
    
    <view class="version-info">
      <text>版本号：v{{ appVersion }}</text>
    </view>
    
    <view class="custom-toast" :class="{ show: toast.show }">
        {{ toast.message }}
    </view>

  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 引入生命周期钩子
import { onShow, onPageScroll, onPullDownRefresh } from '@dcloudio/uni-app'
import { uniIcons } from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
import { uniTransition } from '@/uni_modules/uni-transition/components/uni-transition/uni-transition.vue'

// --- 状态定义 ---
const userInfo = ref({
  username: '游客',
  userId: '',
  avatar: '/static/chicken.gif', // 使用你的 assets 图片作为默认
  level: 1,
  points: 0
})

const cacheSize = ref('0KB')
const appVersion = ref('1.0.0')
const showUserInfo = ref(false)
const hasNewMessage = ref(false)
const scrollTop = ref(0) // 用于视差滚动动画

// 简单的 Toast 状态
const toast = ref({
    show: false,
    message: ''
})

const stats = ref({
  favorites: 0,
  history: 0,
  plans: 0
})

// --- 生命周期 ---

onShow(() => {
  loadUserData()
  calculateCache()
  // 触发入场动画
  setTimeout(() => {
    showUserInfo.value = true
  }, 100)
})

onPageScroll((e) => {
    scrollTop.value = e.scrollTop
})

onPullDownRefresh(() => {
    // 模拟刷新数据
    setTimeout(() => {
        loadUserData()
        uni.stopPullDownRefresh()
        uni.showToast({ title: '已刷新', icon: 'none' })
    }, 1000)
})

// --- 核心方法 ---

// 1. 加载用户数据（对接 chicken-input.vue 的逻辑）
const loadUserData = () => {
    try {
        const savedUserInfo = uni.getStorageSync('userInfo') // 假设登录页存的是这个key
        // 如果 chicken-input 存的是 'username' 这种散乱的key，需要适配：
        // const username = uni.getStorageSync('username')
        
        if (savedUserInfo) {
            // 如果存的是对象
            userInfo.value = { ...userInfo.value, ...savedUserInfo }
        } else {
            // 尝试读取分散存储的 (根据你提供的登录页代码逻辑推测)
            // 登录页好像没有显式存储 userInfo，建议在登录页 handleLogin 成功后添加 uni.setStorageSync('userInfo', res.data)
            // 这里做容错处理
            const tempName = uni.getStorageSync('username') // 假设你在某处存了
            if(tempName) userInfo.value.username = tempName
        }
        
        // 模拟随机统计数据 (实际应从API获取)
        stats.value = {
            favorites: Math.floor(Math.random() * 20),
            history: Math.floor(Math.random() * 50),
            plans: Math.floor(Math.random() * 10)
        }
    } catch (e) {
        console.error('读取用户信息失败', e)
    }
}

// 2. 计算等级描述
const getLevelDescription = (level) => {
  if (level >= 10) return '地图大师'
  if (level >= 5) return '地图专家'
  if (level >= 3) return '地图达人'
  return '地图新手'
}

// 3. 计算缓存大小 (模拟)
const calculateCache = () => {
    // UniApp 获取缓存信息
    uni.getStorageInfo({
        success: (res) => {
            if (res.currentSize > 1024) {
                cacheSize.value = (res.currentSize / 1024).toFixed(2) + 'MB'
            } else {
                cacheSize.value = res.currentSize + 'KB'
            }
        }
    })
}

// --- 事件处理 ---

// 跳转到地图页面
function navigateToMap(type) {
    // 跳转到 request_other.vue 并携带参数
    // 注意：需要在 pages.json 中配置好 tabbar 或页面路径
    uni.navigateTo({
        url: `/pages/request_other/request_other?type=${type}`,
        fail: () => {
            // 如果 request_other 是 tabBar 页面，必须用 switchTab
            uni.switchTab({ url: '/pages/request_other/request_other' })
        }
    })
}

function handleUserInfoClick() {
  uni.showToast({ title: '点击了个人卡片', icon: 'none' })
}

function handleEditProfile() {
  uni.showToast({ title: '编辑资料功能开发中', icon: 'none' })
}

function handleMenuItemClick(itemType) {
  uni.showToast({ title: `${itemType} 功能开发中`, icon: 'none' })
}

// 清除缓存 (修复了 DOM 操作)
function handleClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存吗？(将需要重新登录)',
    success: (res) => {
      if (res.confirm) {
        cacheSize.value = '清理中...'
        
        setTimeout(() => {
            // 真正清除 UniApp 缓存
            uni.clearStorageSync()
            cacheSize.value = '0KB'
            
            // 显示自定义动画提示
            showCustomToast('缓存已清除')
            
            // 因为清除了缓存(包含登录态)，建议重置用户信息
            userInfo.value.username = '未登录'
        }, 800)
      }
    }
  })
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除关键信息
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('token') // 假设有 token
        
        uni.showLoading({ title: '正在退出...' })
        
        setTimeout(() => {
          uni.hideLoading()
          // 跳转回登录页 (关闭所有页面跳转)
          uni.reLaunch({
            url: '/pages/chicken-input/chicken-input'
          })
        }, 500)
      }
    }
  })
}

// 自定义 Toast 显示方法 (替代 DOM 操作)
function showCustomToast(msg) {
    toast.value.message = msg
    toast.value.show = true
    setTimeout(() => {
        toast.value.show = false
    }, 2000)
}
</script>

<style lang="scss">
// 全局样式重置
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.person-view {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 40rpx;
  position: relative;
  overflow-x: hidden;
}

// 顶部背景装饰
.top-decoration {
  position: absolute;
  top: -100rpx;
  left: 0;
  right: 0;
  height: 300rpx;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 0 0 50% 50% / 30rpx;
  z-index: 0;
  // 动画由 style 绑定控制，CSS 中保留 transition
  transition: transform 0.1s linear, opacity 0.1s linear; 
}

/* 用户信息区域样式 */
.user-info-section {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 30rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

// 点击态改为 hover-class 效果更佳，这里保留 active 兼容非按钮元素
.user-info-section:active {
  transform: scale(0.98);
}

.user-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 30rpx;
  border: 4rpx solid #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  position: relative;
  background-color: #eee;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

// 新消息徽章
.avatar-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 32rpx;
  height: 32rpx;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-dot {
  width: 20rpx;
  height: 20rpx;
  background-color: #ff4757;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  color: #333;
}

.user-id {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

.user-level {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.level-tag {
  background: linear-gradient(90deg, #ff9f43, #ee5a24);
  color: white;
  padding: 2rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.level-desc {
  font-size: 24rpx;
  color: #666;
}

.edit-btn {
  display: flex;
  align-items: center;
  color: #1890ff;
  font-weight: 500;
}

.edit-text {
  font-size: 28rpx;
  margin-right: 8rpx;
}

/* 功能统计卡片 */
.stats-section {
  display: flex;
  background-color: #ffffff;
  margin: 0 30rpx 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.stat-item {
  flex: 1;
  padding: 30rpx 0;
  text-align: center;
  transition: background-color 0.2s;
}

.stat-item:active {
  background-color: #f9f9f9;
}

.stat-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 28rpx;
  color: #666;
}

.stat-divider {
  width: 1rpx;
  background-color: #f0f0f0;
  margin: 30rpx 0;
}

/* 菜单区域样式 */
.menu-section,
.settings-section {
  margin: 0 30rpx 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.menu-group {
  padding: 0 30rpx;
}

.menu-group-title {
  font-size: 28rpx;
  color: #999999;
  padding: 20rpx 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.menu-item:last-child {
  border-bottom: none;
}

// 统一的点击效果类
.menu-hover {
    background-color: #f5f7fa;
}

.menu-icon {
  margin-right: 20rpx;
  display: flex;
  align-items: center;
}

.menu-text {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.cache-size {
  color: #999999;
  font-size: 28rpx;
  margin-right: 10rpx;
}

/* 退出登录按钮样式 */
.logout-section {
  margin: 0 30rpx 30rpx;
}

.logout-btn {
  width: 100%;
  background-color: #ffffff;
  color: #ff3b30;
  border: 1rpx solid #ff3b30;
  font-size: 32rpx;
  padding: 8rpx 0; /* button自带padding，这里微调 */
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.logout-btn::after {
    border: none;
}

.logout-btn-hover {
  background-color: #ff3b30 !important;
  color: #ffffff !important;
}

/* 版本信息 */
.version-info {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding-bottom: 30rpx;
}

/* 替换原 DOM 操作的 Vue 驱动 Toast */
.custom-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 24rpx 48rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  opacity: 0;
  z-index: 9999;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.custom-toast.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .person-view {
    background-color: #1c1c1c;
  }
  
  .user-info-section,
  .stats-section,
  .menu-section,
  .settings-section,
  .logout-btn {
    background-color: #2c2c2c;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  }
  
  .user-name,
  .menu-text,
  .stat-label {
    color: #e5e5e5;
  }
  
  .user-id,
  .level-desc,
  .menu-group-title,
  .cache-size,
  .version-info {
    color: #888888;
  }
  
  .stat-divider,
  .menu-item {
    border-color: #3c3c3c;
  }
  
  .menu-hover {
    background-color: #3a3a3a;
  }
  
  .logout-btn {
      background-color: #2c2c2c;
      border-color: #ff453a;
      color: #ff453a;
  }
}
</style>