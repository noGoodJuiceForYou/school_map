<template>
  <view v-if="show" class="popup route-popup">
    <view class="popup_title">路径规划</view>
    <view class="popup_content">
      <!-- 起点 -->
      <view class="route-input">
        <text>起点:</text>
        <view class="location-info">
          <text v-if="startLocation" class="location-text">{{ startLocation.name || `经度: ${startLocation.lng?.toFixed(6)}, 纬度: ${startLocation.lat?.toFixed(6)}` }}</text>
          <text v-else class="placeholder">请点击地图选择起点</text>
        </view>
        <view class="route-btn-group">
          <button class="map-select-btn" @click="$emit('select-start-from-map')">点击地图选择</button>
          <button class="map-select-btn use-location-btn" @click="$emit('use-my-location-as-start')">使用我的位置</button>
        </view>
      </view>
      <!-- 终点 -->
      <view class="route-input">
        <text>终点:</text>
        <view class="location-info">
          <text v-if="endLocation" class="location-text">{{ endLocation.name || `经度: ${endLocation.lng?.toFixed(6)}, 纬度: ${endLocation.lat?.toFixed(6)}` }}</text>
          <text v-else class="placeholder">请点击地图选择终点</text>
        </view>
        <button class="map-select-btn" @click="$emit('select-end-from-map')">点击地图选择</button>
      </view>
    </view>
    <view class="popup_bottom">
      <button @click="$emit('close')">取消</button>
      <button @click="$emit('confirm')" :disabled="!startLocation || !endLocation">开始规划</button>
    </view>
  </view>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  startLocation: { type: Object, default: null },
  endLocation: { type: Object, default: null },
})

defineEmits(['close', 'confirm', 'select-start-from-map', 'select-end-from-map', 'use-my-location-as-start'])
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
.route-popup {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 30vw;
  max-height: 80vh;
}
.popup_title {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  padding: 30rpx;
  border-bottom: 1px solid #555;
  text-align: center;
}
.popup_content { flex: 1; padding: 30rpx; overflow-y: auto; color: #fff; }
.popup_bottom {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  border-top: 1px solid #555;
  button { background-color: #007AFF; color: white; border: none; padding: 10rpx 60rpx; border-radius: 20rpx; font-size: 25rpx; }
}
.route-input {
  margin-bottom: 30rpx;
  text { display: block; margin-bottom: 10rpx; font-size: 28rpx; color: #fff; }
  .location-info {
    margin-bottom: 10rpx;
    .location-text { font-size: 26rpx; color: #000; padding: 10rpx; background-color: #f5f5f5; border-radius: 8rpx; display: block; }
    .placeholder { font-size: 26rpx; color: #ccc; }
  }
  .route-btn-group { display: flex; gap: 10rpx; }
  .map-select-btn {
    width: 100%; padding: 15rpx; background-color: #007AFF; color: white;
    border: none; border-radius: 8rpx; font-size: 26rpx;
    &.use-location-btn { background-color: #4CD964 !important; }
  }
}

@media screen and (max-width: 768px) {
  .route-popup { width: 90vw; max-height: 85vh; }
}
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .route-popup { width: 50vw; }
}
</style>
