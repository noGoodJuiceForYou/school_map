<template>
  <view class="btn-group">
    <view class="icon-btn-container">
      <button @click="$emit('locate-me')" class="icon-btn" title="定位我的位置" :disabled="isLocating">
        <text class="icon">&#x1F4CD;</text>
      </button>
      <view v-if="isLocating" class="locating-indicator">
        <view class="spinner"></view>
        <text class="locating-text">定位中...</text>
      </view>
    </view>
    <button @click="$emit('paint-path')" class="icon-btn" title="路径规划">
      <text class="icon">&#x1F5FA;&#xFE0F;</text>
    </button>
    <button @click="$emit('clear-route')" class="icon-btn" title="清除路线">
      <text class="icon">&#x1F9F9;</text>
    </button>
    <button @click="$emit('reset-center')" class="icon-btn" title="回到中心">
      <text class="icon">&#x1F504;</text>
    </button>
    <button @click="$emit('start-ai')" class="icon-btn" title="AI">
      <text class="icon">AI</text>
    </button>
    <view class="icon-btn-container user-btn-container">
      <button @click.stop="$emit('toggle-user-menu')" class="icon-btn" title="用户中心">
        <text class="icon">{{ isLoggedIn ? '&#x1F464;' : '登' }}</text>
      </button>
      <view v-if="showUserMenu" class="user-menu" @click.stop>
        <view v-if="isLoggedIn" class="user-menu-item username-item">
          <text>{{ username }}</text>
        </view>
        <view v-if="isLoggedIn" class="user-menu-item" @click="$emit('show-pending-images')">
          <text>查看正在审核的图片</text>
        </view>
        <view v-if="isLoggedIn" class="user-menu-item" @click="$emit('logout')">
          <text>退出登录</text>
        </view>
        <view v-else class="user-menu-item" @click="$emit('show-login')">
          <text>登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  isLocating: { type: Boolean, default: false },
  isLoggedIn: { type: Boolean, default: false },
  username: { type: String, default: '' },
  showUserMenu: { type: Boolean, default: false },
})

defineEmits([
  'locate-me', 'paint-path', 'clear-route', 'reset-center',
  'start-ai', 'toggle-user-menu', 'show-pending-images',
  'logout', 'show-login',
])
</script>

<style lang="scss" scoped>
.btn-group {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  z-index: 998;
}
.icon-btn-container { position: relative; }
.icon-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
  .icon { font-size: 40rpx; }
  &:hover { background-color: rgba(255, 255, 255, 1); box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.3); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
}
.locating-indicator {
  position: absolute;
  left: 100rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 20rpx;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 40rpx;
  color: white;
  font-size: 24rpx;
  .spinner {
    width: 20rpx;
    height: 20rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.3);
    border-top: 2rpx solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .locating-text { white-space: nowrap; }
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-btn-container { position: relative; }
.user-menu {
  position: absolute;
  bottom: 10px;
  left: 60px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  overflow: hidden;
  z-index: 9999;
}
.user-menu-item {
  padding: 12px 16px;
  text-align: center;
  cursor: pointer;
  color: #333;
  &:hover { background-color: #f5f5f5; }
}
.username-item { font-weight: bold; border-bottom: 1px solid #eee; }
</style>
