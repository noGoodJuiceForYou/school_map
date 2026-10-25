<template>
  <view v-if="show" class="popup pending-images-popup">
    <view class="popup_title">
      正在审核的图片
      <view class="popup_header_right">
        <view class="icon-btn_close" @click="$emit('hide')" title="关闭">
          <text class="icon">✕</text>
        </view>
      </view>
    </view>
    <view class="popup_content">
      <view v-if="images.length > 0" class="pending-images-list">
        <view v-for="(image, index) in images" :key="index" class="pending-image-item">
          <img :src="image.image || image.imageUrl" alt="待审核图片" class="pending-image" @click="$emit('open-image-preview', image.image || image.imageUrl)" />
          <view class="pending-image-info">
            <text class="pending-image-location">{{ image.name }}</text>
            <text class="pending-image-time">{{ formatTime(image.time) }}</text>
          </view>
          <view class="pending-image-actions">
            <text class="delete-pending-image-btn" @click="$emit('delete-image', image.id)">删除</text>
          </view>
        </view>
      </view>
      <view v-else class="no-pending-images"><text>暂无待审核图片</text></view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  images: { type: Array, default: () => [] },
})

defineEmits(['hide', 'delete-image', 'open-image-preview'])

function formatTime(timeString) {
  if (!timeString) return ''
  return new Date(timeString).toLocaleString()
}
</script>

<style lang="scss" scoped>
.popup {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
  padding: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
}
.pending-images-popup {
  width: 90vw;
  max-width: 600rpx;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.popup_title {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  padding: 30rpx 90rpx;
  border-bottom: 1px solid #555;
  text-align: center;
  position: relative;
}
.popup_header_right { position: absolute; top: 20rpx; right: 20rpx; z-index: 10; }
.icon-btn_close {
  width: 50rpx; height: 50rpx; border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  .icon { font-size: 24rpx; color: #fff; font-weight: bold; }
  &:hover { background-color: rgba(255, 100, 100, 0.5); transform: scale(1.1); }
}
.popup_content { flex: 1; padding: 30rpx; overflow-y: auto; color: #fff; }
.pending-images-list { max-height: 600rpx; overflow-y: auto; }
.pending-image-item { display: flex; align-items: center; padding: 20rpx; background-color: #f9f9f9; border-radius: 12rpx; margin-bottom: 15rpx; }
.pending-image { width: 120rpx; height: 120rpx; object-fit: cover; border-radius: 8rpx; margin-right: 20rpx; display: block; }
.pending-image-info { flex: 1; display: flex; align-items: center; }
.pending-image-location { font-size: 30rpx; color: #333; font-weight: bold; margin-right: 20rpx; }
.pending-image-time { font-size: 24rpx; color: #999; }
.pending-image-actions { margin-left: 20rpx; }
.delete-pending-image-btn { color: #ff4d4f; font-size: 28rpx; cursor: pointer; padding: 10rpx 20rpx; border-radius: 8rpx; background-color: #fff1f0; &:hover { color: #ff7875; background-color: #fff2f0; } }
.no-pending-images { text-align: center; padding: 60rpx 0; color: #999; font-size: 32rpx; }
</style>
