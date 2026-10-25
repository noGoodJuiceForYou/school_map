<template>
  <view class="search-bar-wrapper">
    <view class="custom-search-bar">
      <view class="search-container">
        <text class="search-icon">&#x1F50D;</text>
        <input
          class="search-input"
          v-model="localKeyword"
          placeholder="搜索地点..."
          @confirm="$emit('search')"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="$emit('clear-search')">✕</text>
      </view>
      <text class="search-btn" @click="$emit('search')">搜索</text>
    </view>

    <view v-if="showSearchResults" class="search-results">
      <view
        v-for="(result, index) in searchResults"
        :key="index"
        class="search-result-item"
        @click="$emit('result-click', result)"
      >
        <text class="result-name">{{ result.name }}</text>
      </view>
      <view v-if="searchResults.length === 0" class="no-results">
        <text>未找到相关地点</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  searchKeyword: { type: String, default: '' },
  showSearchResults: { type: Boolean, default: false },
  searchResults: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:searchKeyword', 'search', 'clear-search', 'result-click', 'search-input'])

const localKeyword = ref(props.searchKeyword)
let syncingFromProp = false

watch(() => props.searchKeyword, (val) => {
  syncingFromProp = true
  localKeyword.value = val
  setTimeout(() => { syncingFromProp = false }, 0)
})

watch(localKeyword, (val) => {
  if (syncingFromProp) return
  emit('update:searchKeyword', val)
  emit('search-input')
})
</script>

<style lang="scss" scoped>
.custom-search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: white;
  border-bottom: 1rpx solid #eee;

  .search-container {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 50rpx;
    padding: 10rpx 20rpx;
    margin-right: 20rpx;

    .search-icon { margin-right: 10rpx; color: #999; }
    .search-input { flex: 1; height: 60rpx; font-size: 28rpx; }
    .clear-icon { color: #999; font-size: 40rpx; padding: 0 10rpx; cursor: pointer; }
  }
  .search-btn { color: #007AFF; font-size: 28rpx; cursor: pointer; }
}

.search-results {
  position: absolute;
  top: 120rpx;
  left: 20rpx;
  right: 20rpx;
  background: white;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  max-height: 400rpx;
  overflow-y: auto;
  z-index: 999;

  .search-result-item {
    padding: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    cursor: pointer;
    &:last-child { border-bottom: none; }
    &:hover { background-color: #f5f5f5; }
    .result-name { font-size: 28rpx; color: #333; }
  }
  .no-results {
    padding: 40rpx;
    text-align: center;
    color: #999;
    font-size: 26rpx;
  }
}
</style>
