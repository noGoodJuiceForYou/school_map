<template>
  <view v-if="show" class="popup location-popup">
    <view class="popup_title">
      {{ currentLocation?.name || '地点信息' }}
      <view class="popup_subtitle" v-if="currentLocation?.description">
        {{ currentLocation.description }}
      </view>
      <view class="popup_header_left">
        <view class="navigate-button" @click="$emit('navigate-to-here')" title="到这儿去">
          <text class="navigate-icon">&#x1F9ED;</text>
          <text class="navigate-text">到这儿去</text>
        </view>
      </view>
      <view class="popup_header_right">
        <view class="icon-btn_close" @click="$emit('hide-popup')" title="关闭">
          <text class="icon">✕</text>
        </view>
      </view>
    </view>
    <view class="popup_content">
      <view class="section" v-for="(section, sectionIndex) in currentLocation?.sections" :key="sectionIndex">
        <view class="section-title" v-if="section.name">{{ section.name }}</view>
        <template v-if="section.images && section.images.length > 0">
          <view class="swiper-container">
            <view
              class="swiper-button swiper-button-next"
              @click="$emit('next-slide', sectionIndex)"
              :class="{ disabled: (swiperCurrent[sectionIndex] || 0) === section.images.length - 1 }"
            >
              <text class="swiper-button-icon">›</text>
            </view>
            <view
              class="swiper-button swiper-button-prev"
              @click="$emit('prev-slide', sectionIndex)"
              :class="{ disabled: (swiperCurrent[sectionIndex] || 0) === 0 }"
            >
              <text class="swiper-button-icon">‹</text>
            </view>
            <view
              class="swiper-wrapper"
              @touchstart="$emit('touch-start', sectionIndex, $event)"
              @touchmove="$emit('touch-move', sectionIndex, $event)"
              @touchend="$emit('touch-end', sectionIndex)"
              :style="{ transform: `translateX(-${(swiperCurrent[sectionIndex] || 0) * 100}%)` }"
            >
              <view v-for="(image, imageIndex) in section.images" :key="imageIndex" class="swiper-slide">
                <img
                  :src="image"
                  alt="图片"
                  class="swiper-image"
                  @error="(e) => $emit('image-error', e, image)"
                  @click="$emit('open-image-preview', image)"
                />
              </view>
            </view>
            <view v-if="section.images.length > 1" class="swiper-pagination">
              <view
                v-for="(image, index) in section.images"
                :key="index"
                class="swiper-pagination-bullet"
                :class="{ active: (swiperCurrent[sectionIndex] || 0) === index }"
                @click="$emit('set-swiper-current', sectionIndex, index)"
              />
            </view>
          </view>
          <view class="upload-image-btn" @click="$emit('upload-image', sectionIndex)">
            <text>我要上传图片</text>
          </view>
        </template>
        <view v-else class="no-images">
          <text>暂无图片</text>
          <view class="upload-image-btn" @click="$emit('upload-image', sectionIndex)">
            <text>我要上传图片</text>
          </view>
        </view>
        <view class="section-description" v-if="section.description">{{ section.description }}</view>
        <view class="section-description" v-if="section.information">{{ section.information }}</view>
        <!-- 评论区域 - 只有主地点显示 -->
        <view v-if="!section.subLocationId" class="comments-section">
          <view class="comments-header">
            <text class="comments-title">评论</text>
            <view class="header-right">
              <text class="username-display" v-if="isLoggedIn">{{ username }}</text>
              <text class="add-comment-btn" @click="$emit('show-add-comment')">发表评论</text>
            </view>
          </view>
          <view class="comments-list">
            <view v-for="(comment, ci) in displayedComments?.slice(0, 2)" :key="ci" class="comment-item">
              <view class="comment-header">
                <text class="comment-username">{{ comment.username }}</text>
                <text class="comment-time">{{ formatTime(comment.time) }}</text>
              </view>
              <view class="comment-content">{{ comment.content }}</view>
              <view class="comment-actions" v-if="isCurrentUser(comment.userId)">
                <text class="delete-comment-btn" @click="$emit('delete-comment', comment.id)">删除</text>
              </view>
            </view>
            <view v-if="displayedComments && displayedComments.length > 2" class="view-more-comments">
              <text @click="$emit('show-all-comments')">查看全部 {{ displayedComments.length }} 条评论</text>
            </view>
            <view v-if="!displayedComments || displayedComments.length === 0" class="no-comments">
              <text>暂无评论，快来发表第一条评论吧！</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  currentLocation: { type: Object, default: null },
  swiperCurrent: { type: Object, default: () => ({}) },
  isLoggedIn: { type: Boolean, default: false },
  username: { type: String, default: '' },
  displayedComments: { type: Array, default: () => [] },
  isCurrentUser: { type: Function, default: () => false },
})

defineEmits([
  'navigate-to-here', 'hide-popup',
  'next-slide', 'prev-slide', 'touch-start', 'touch-move', 'touch-end',
  'set-swiper-current', 'open-image-preview', 'upload-image',
  'show-add-comment', 'show-all-comments', 'delete-comment', 'image-error',
])

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
.location-popup {
  right: 0;
  top: 0;
  width: 25vw;
  max-height: 75vh;
  z-index: 100;
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
.popup_subtitle {
  font-size: 24rpx;
  color: #ccc;
  margin-top: 10rpx;
  font-weight: normal;
}
.popup_header_left { position: absolute; top: 20rpx; left: 20rpx; z-index: 10; }
.popup_header_right { position: absolute; top: 20rpx; right: 20rpx; z-index: 10; }
.navigate-button {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 18rpx;
  border-radius: 25rpx;
  background-color: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  .navigate-icon { font-size: 24rpx; color: #fff; }
  .navigate-text { font-size: 22rpx; font-weight: 500; color: #fff; }
  &:hover { background-color: rgba(255, 255, 255, 0.3); transform: scale(1.05); }
  &:active { transform: scale(0.95); }
}
.icon-btn_close {
  width: 50rpx; height: 50rpx; border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s ease;
  .icon { font-size: 24rpx; color: #fff; font-weight: bold; }
  &:hover { background-color: rgba(255, 100, 100, 0.5); transform: scale(1.1); }
  &:active { transform: scale(0.95); }
}
.section-title { font-size: 28rpx; color: #fff; font-weight: bold; margin-bottom: 15rpx; padding-bottom: 10rpx; border-bottom: 1px solid #444; }
.popup_content {
  flex: 1; padding: 30rpx; overflow-y: auto; color: #fff;
  &::-webkit-scrollbar { width: 6rpx; }
  &::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 3rpx; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 3rpx; }
}
.section { margin-bottom: 40rpx; }
.swiper-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
  margin-bottom: 20rpx;
}
.swiper-wrapper { display: flex; height: 100%; transition: transform 0.3s ease; }
.swiper-slide { flex: 0 0 100%; height: 100%; position: relative; }
.swiper-image { width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
.swiper-pagination { position: absolute; bottom: 10rpx; left: 50%; transform: translateX(-50%); display: flex; gap: 8rpx; z-index: 10; }
.swiper-pagination-bullet { width: 12rpx; height: 12rpx; border-radius: 50%; background-color: rgba(255, 255, 255, 0.5); transition: all 0.3s ease; cursor: pointer; }
.swiper-pagination-bullet.active { width: 24rpx; border-radius: 6rpx; background-color: #fff; }
.swiper-button {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 50rpx; height: 50rpx; border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10;
  .swiper-button-icon { font-size: 32rpx; color: #fff; font-weight: bold; }
  &:hover { background-color: rgba(0, 0, 0, 0.8); transform: translateY(-50%) scale(1.1); }
  &.disabled { opacity: 0.3; cursor: not-allowed; &:hover { background-color: rgba(0, 0, 0, 0.5); transform: translateY(-50%) scale(1); } }
}
.swiper-button-next { right: 10rpx; }
.swiper-button-prev { left: 10rpx; }
.no-images { width: 100%; aspect-ratio: 16/9; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f5f5f5; border-radius: 12rpx; color: #999; margin-bottom: 20rpx; }
.upload-image-btn { background-color: #409eff; color: white; padding: 15rpx 30rpx; border-radius: 8rpx; font-size: 28rpx; text-align: center; margin-top: 15rpx; margin-bottom: 20rpx; cursor: pointer; &:hover { background-color: #66b1ff; } }
.section-description { font-size: 28rpx; color: #666; line-height: 44rpx; text-align: justify; padding: 10rpx 0; word-break: break-all; }

/* 评论区 */
.comments-section { margin-top: 20px; padding-top: 15px; border-top: 1px solid #333; }
.comments-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header-right { display: flex; align-items: center; gap: 10px; }
.comments-title { font-size: 16px; font-weight: bold; color: #fff; }
.username-display { font-size: 14px; color: #ccc; }
.add-comment-btn { font-size: 14px; color: #1890ff; cursor: pointer; &:hover { text-decoration: underline; } }
.comments-list { margin-bottom: 15px; }
.comment-item { padding: 10px 0; border-bottom: 1px solid #333; }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.comment-username { font-size: 14px; font-weight: bold; color: #fff; }
.comment-time { font-size: 12px; color: #999; }
.comment-content { font-size: 16px; color: #ddd; line-height: 1.5; margin-bottom: 5px; }
.comment-actions { display: flex; justify-content: flex-end; }
.delete-comment-btn { font-size: 12px; color: #ff4d4f; cursor: pointer; &:hover { text-decoration: underline; } }
.view-more-comments { text-align: center; margin-top: 10px; text { font-size: 14px; color: #1890ff; cursor: pointer; &:hover { text-decoration: underline; } } }
.no-comments { text-align: center; color: #999; font-size: 14px; padding: 20px 0; }

@media screen and (max-width: 768px) {
  .location-popup { width: 70vw; max-height: 60vh; right: 0; top: 0; border-radius: 0 0 0 20rpx; }
  .popup_title { font-size: 32rpx; padding: 20rpx 80rpx; }
  .navigate-button { padding: 10rpx 16rpx; .navigate-icon { font-size: 20rpx; } .navigate-text { font-size: 20rpx; } }
  .icon-btn_close { width: 44rpx; height: 44rpx; .icon { font-size: 24rpx; } }
  .popup_header_left { top: 16rpx; left: 16rpx; }
  .popup_header_right { top: 16rpx; right: 16rpx; }
  .popup_content { padding: 20rpx; }
  .section { margin-bottom: 30rpx; }
}
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .location-popup { width: 40vw; max-height: 75vh; }
}
</style>
