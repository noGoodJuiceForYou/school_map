<template>
  <view v-if="show" class="popup comment-popup">
    <view class="popup_title">
      {{ title }}
      <view class="popup_header_right">
        <view class="icon-btn_close" @click="$emit('hide')" title="关闭">
          <text class="icon">✕</text>
        </view>
      </view>
    </view>
    <view class="popup_content">
      <!-- 添加评论 -->
      <view v-if="type === 'add'" class="comment-input-section">
        <textarea
          v-model="localContent"
          placeholder="请输入评论内容..."
          class="comment-textarea"
        ></textarea>
      </view>
      <!-- 评论列表 -->
      <view v-else-if="type === 'list'" class="all-comments-list">
        <view v-for="(comment, index) in comments" :key="index" class="comment-item">
          <view class="comment-header">
            <text class="comment-username">{{ comment.username }}</text>
            <text class="comment-time">{{ formatTime(comment.time) }}</text>
          </view>
          <view class="comment-content">{{ comment.content }}</view>
          <view class="comment-actions" v-if="isCurrentUser(comment.userId)">
            <text class="delete-comment-btn" @click="$emit('delete-comment', comment.id)">删除</text>
          </view>
        </view>
        <view v-if="!comments || comments.length === 0" class="no-comments">
          <text>暂无评论</text>
        </view>
        <view v-if="totalComments > 0" class="pagination">
          <text class="page-info">共 {{ totalComments }} 条评论</text>
          <view class="page-controls">
            <text class="page-btn" :class="{ disabled: currentPage === 1 }" @click="$emit('prev-page')">上一页</text>
            <text class="page-current">{{ currentPage }} / {{ totalPages }}</text>
            <text class="page-btn" :class="{ disabled: currentPage === totalPages }" @click="$emit('next-page')">下一页</text>
          </view>
        </view>
      </view>
    </view>
    <view class="popup_bottom" v-if="type === 'add'">
      <button @click="$emit('hide')" :disabled="isSubmitting">取消</button>
      <button @click="handleSubmit" :disabled="!localContent.trim() || isSubmitting">
        {{ isSubmitting ? '发表中...' : '发表评论' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  type: { type: String, default: 'add' },
  title: { type: String, default: '发表评论' },
  comments: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  totalComments: { type: Number, default: 0 },
  isSubmitting: { type: Boolean, default: false },
  isCurrentUser: { type: Function, default: () => false },
})

const emit = defineEmits(['hide', 'submit-comment', 'prev-page', 'next-page', 'delete-comment'])

const localContent = ref('')

watch(() => props.show, (val) => {
  if (val) localContent.value = ''
})

function handleSubmit() {
  emit('submit-comment', localContent.value.trim())
}

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
.comment-popup {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40vw;
  padding: 30px;
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
.popup_bottom {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  border-top: 1px solid #555;
  button { background-color: #007AFF; color: white; border: none; padding: 10rpx 60rpx; border-radius: 20rpx; font-size: 25rpx; }
}
.comment-input-section { display: flex; justify-content: center; align-items: center; }
.comment-textarea {
  width: 100%; height: 150px; padding: 10px;
  border: 1px solid #555; border-radius: 4px;
  font-size: 16px; resize: none;
  background-color: #333; color: #fff;
}
.all-comments-list { max-height: 400px; overflow-y: auto; }
.comment-item { padding: 10px 0; border-bottom: 1px solid #333; }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.comment-username { font-size: 14px; font-weight: bold; color: #fff; }
.comment-time { font-size: 12px; color: #999; }
.comment-content { font-size: 16px; color: #ddd; line-height: 1.5; margin-bottom: 5px; }
.comment-actions { display: flex; justify-content: flex-end; }
.delete-comment-btn { font-size: 12px; color: #ff4d4f; cursor: pointer; &:hover { text-decoration: underline; } }
.no-comments { text-align: center; color: #999; font-size: 14px; padding: 20px 0; }
.pagination { margin-top: 20px; padding-top: 15px; border-top: 1px solid #333; }
.page-info { display: block; text-align: center; font-size: 12px; color: #ccc; margin-bottom: 10px; }
.page-controls { display: flex; justify-content: center; align-items: center; gap: 15px; }
.page-btn { font-size: 12px; color: #1890ff; cursor: pointer; &.disabled { color: #999; cursor: not-allowed; } &:hover:not(.disabled) { text-decoration: underline; } }
.page-current { font-size: 12px; color: #fff; }

@media screen and (max-width: 768px) {
  .comment-popup { width: 90vw; padding: 20px; }
  .comment-textarea { height: 100px; font-size: 14px; }
  .comment-username { font-size: 12px; }
  .comment-time { font-size: 10px; }
  .comment-content { font-size: 14px; }
}
</style>
