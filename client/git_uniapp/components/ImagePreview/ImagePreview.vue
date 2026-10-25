<template>
  <view v-if="show" class="image-preview" @click="closePreview">
    <view class="preview-content" @click.stop>
      <img
        :src="image"
        alt="预览图片"
        class="preview-image"
        :style="{ transform: `scale(${scale})` }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
      />
      <view class="preview-close" @click="closePreview">×</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  show: { type: Boolean, default: false },
  image: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const scale = ref(1)
const touchStartDistance = ref(0)
const touchStartScale = ref(1)

function closePreview() {
  scale.value = 1
  emit('close')
}

function getDistance(t1, t2) {
  return Math.sqrt((t2.clientX - t1.clientX) ** 2 + (t2.clientY - t1.clientY) ** 2)
}

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    touchStartDistance.value = getDistance(e.touches[0], e.touches[1])
    touchStartScale.value = scale.value
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 2) {
    const d = getDistance(e.touches[0], e.touches[1])
    scale.value = Math.min(Math.max(0.5, d / touchStartDistance.value * touchStartScale.value), 3)
  }
}
</script>

<style lang="scss">
/* unscoped: full-screen overlay */
.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-content {
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
}
.preview-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 60rpx;
  color: white;
  cursor: pointer;
  z-index: 10000;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
