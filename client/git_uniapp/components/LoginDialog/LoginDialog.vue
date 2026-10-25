<template>
  <view v-if="show" class="popup login-popup">
    <view class="popup_title">
      {{ loginMode === 'login' ? '登录' : '注册' }}
      <view class="popup_header_right">
        <view class="icon-btn_close" @click="$emit('hide')" title="关闭">
          <text class="icon">✕</text>
        </view>
      </view>
    </view>
    <view class="popup_content">
      <view class="login-form">
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input
            v-model="localUsername"
            type="text"
            placeholder="请输入用户名"
            class="form-input"
          />
        </view>
        <view class="form-item">
          <text class="form-label">密码</text>
          <input
            v-model="localPassword"
            type="password"
            placeholder="请输入密码"
            class="form-input"
          />
        </view>
        <view class="form-item" v-if="loginMode === 'register'">
          <text class="form-label">手机号</text>
          <input
            v-model="localStudentId"
            type="text"
            placeholder="请输入您的手机号"
            class="form-input"
          />
        </view>
        <view v-if="loginError" class="error-message">{{ loginError }}</view>
        <button
          @click="handleSubmit"
          :disabled="isLoggingIn || !localUsername.trim() || !localPassword.trim()"
          class="login-btn"
        >
          {{ isLoggingIn ? '处理中...' : (loginMode === 'login' ? '登录' : '注册') }}
        </button>
        <view class="login-switch">
          <text @click="$emit('switch-mode')" class="switch-text">
            {{ loginMode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  loginMode: { type: String, default: 'login' },
  loginError: { type: String, default: '' },
  isLoggingIn: { type: Boolean, default: false },
})

const emit = defineEmits(['hide', 'submit-login', 'switch-mode'])

const localUsername = ref('')
const localPassword = ref('')
const localStudentId = ref('')

// Reset fields when dialog opens
watch(() => props.show, (val) => {
  if (val) {
    localUsername.value = ''
    localPassword.value = ''
    localStudentId.value = ''
  }
})

function handleSubmit() {
  emit('submit-login', {
    username: localUsername.value.trim(),
    password: localPassword.value,
    phone: localStudentId.value.trim(),
  })
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
.login-popup {
  width: 90%;
  max-width: 400px;
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
.popup_header_right {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  z-index: 10;
}
.icon-btn_close {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  .icon { font-size: 24rpx; color: #fff; font-weight: bold; }
  &:hover { background-color: rgba(255, 100, 100, 0.5); transform: scale(1.1); }
}
.popup_content {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  color: #fff;
}
.login-form { padding: 20rpx 0; }
.form-item { margin-bottom: 20rpx; }
.form-label { display: block; font-size: 14px; margin-bottom: 8rpx; color: #333; }
.form-input {
  width: 100%;
  height: 48rpx;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 12rpx;
  font-size: 14px;
}
.error-message { color: #ff4d4f; font-size: 12px; margin-bottom: 16rpx; }
.login-btn {
  width: 100%;
  height: 70rpx;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16rpx;
  &:disabled { background-color: #d9d9d9; cursor: not-allowed; }
}
.login-switch { text-align: center; }
.switch-text { font-size: 12px; color: #1890ff; cursor: pointer; &:hover { text-decoration: underline; } }
</style>
