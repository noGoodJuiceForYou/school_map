<template>
  <view class="beian-footer">
    <view class="beian-content">
      <image class="beian-icon" src="/static/police.png" mode="aspectFit"></image>
      <text
        class="beian-text beian-link"
        @click="openLink('https://beian.mps.gov.cn/#/query/webSearch')"
        @mouseenter="hoverGongan = true"
        @mouseleave="hoverGongan = false"
        :class="{ 'link-hover': hoverGongan }"
      >
        闽公网安备35069802000090号
      </text>
      <text class="beian-separator">|</text>
      <text
        class="beian-text beian-link"
        @click="openLink('https://beian.miit.gov.cn/')"
        @mouseenter="hoverIcp = true"
        @mouseleave="hoverIcp = false"
        :class="{ 'link-hover': hoverIcp }"
      >
        闽ICP备2026010979号
      </text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const hoverGongan = ref(false)
const hoverIcp = ref(false)

function openLink(url) {
  window.open(url, '_blank')
}
</script>

<style lang="scss">
/* unscoped: needs high z-index to overlay Amap UI */
.beian-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.5);
}
.beian-content {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  gap: 12rpx;
  padding: 0 20rpx;
}
.beian-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 4rpx;
  flex-shrink: 0;
}
.beian-text {
  color: #000;
  font-size: 22rpx;
  line-height: 1.2;
  cursor: pointer;
}
.beian-link {
  color: #3282e3;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  &.link-hover {
    color: #0000ff;
    text-decoration: underline;
  }
}
.beian-separator {
  color: black;
  margin: 0 8rpx;
  font-size: 20rpx;
}
</style>
