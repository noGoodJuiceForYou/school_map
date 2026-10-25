<template>
  <view v-if="show" class="coze-iframe-container">
    <view class="coze-iframe-header">
      <text class="coze-title">厦小嘉校园智能导览助手</text>
      <view class="coze-close-btn" @click="$emit('close')">
        <text class="icon">✕</text>
      </view>
    </view>
    <iframe
      class="coze-iframe"
      src="/static/coze-chat.html"
      frameborder="0"
      allow="microphone; camera"
    ></iframe>
  </view>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
})
defineEmits(['close'])
</script>

<style lang="scss">
/* unscoped: fixed overlay */
.coze-iframe-container {
  position: fixed;
  right: 0;
  bottom: 8%;
  width: 25%;
  height: 80%;
  background-color: white;
  box-shadow: -2rpx -2rpx 20rpx rgba(0, 0, 0, 0.15);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20rpx;
}

.coze-iframe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
  color: white;

  .coze-title {
    font-size: 28rpx;
    font-weight: bold;
  }

  .coze-close-btn {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;

    .icon { font-size: 28rpx; color: white; font-weight: bold; }

    &:hover { background-color: rgba(255, 255, 255, 0.4); transform: scale(1.05); }
    &:active { transform: scale(0.95); }
  }
}

.coze-iframe {
  flex: 1;
  width: 100%;
  border: none;
  background-color: #fff;
}

@media screen and (max-width: 768px) {
  .coze-iframe-container {
    width: 100%;
    height: 100%;
    right: 0;
    bottom: 0;
    .coze-iframe-header {
      padding: 24rpx 32rpx;
      .coze-title { font-size: 34rpx; }
      .coze-close-btn { width: 60rpx; height: 60rpx; .icon { font-size: 36rpx; } }
    }
  }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
  .coze-iframe-container { width: 35%; height: 75%; }
}
</style>
