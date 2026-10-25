<template>
  <view class="login-register-container">
    <view class="auth-card">
      <view class="auth-header">
        <text class="auth-title">{{ auth.loginMode.value === 'login' ? '登录' : '注册' }}</text>
        <view class="auth-toggle">
          <text
            :class="{ 'active': auth.loginMode.value === 'login' }"
            @click="switchToLogin"
          >登录</text>
          <text
            :class="{ 'active': auth.loginMode.value === 'register' }"
            @click="switchToRegister"
          >注册</text>
        </view>
      </view>

      <view class="auth-form">
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input v-model="username" type="text" placeholder="请输入用户名" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">密码</text>
          <input v-model="password" type="password" placeholder="请输入密码" class="form-input" />
        </view>

        <view class="form-item" v-if="auth.loginMode.value === 'register'">
          <text class="form-label">确认密码</text>
          <input v-model="confirmPassword" type="password" placeholder="请确认密码" class="form-input" />
        </view>

        <view v-if="auth.loginError.value" class="error-message">{{ auth.loginError.value }}</view>

        <button
          @click="handleSubmit"
          :disabled="auth.isLoggingIn.value || !username.trim() || !password.trim()"
          class="submit-btn"
        >
          {{ auth.isLoggingIn.value ? '处理中...' : (auth.loginMode.value === 'login' ? '登录' : '注册') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const auth = useAuth(() => {
  uni.navigateBack()
})

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

function switchToLogin() {
  auth.loginMode.value = 'login'
  auth.loginError.value = ''
  password.value = ''
  confirmPassword.value = ''
}

function switchToRegister() {
  auth.loginMode.value = 'register'
  auth.loginError.value = ''
  password.value = ''
  confirmPassword.value = ''
}

function handleSubmit() {
  if (auth.loginMode.value === 'register' && password.value !== confirmPassword.value) {
    auth.loginError.value = '两次输入的密码不一致'
    return
  }
  auth.submitLogin({ username: username.value.trim(), password: password.value })
}
</script>

<style scoped>
.login-register-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.auth-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 30px;
}
.auth-header { text-align: center; margin-bottom: 30px; }
.auth-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; display: block; }
.auth-toggle { display: flex; justify-content: center; border-bottom: 1px solid #eee; margin-bottom: 20px; }
.auth-toggle text { padding: 10px 20px; font-size: 16px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; }
.auth-toggle text.active { color: #1890ff; border-bottom-color: #1890ff; }
.auth-form { display: flex; flex-direction: column; gap: 20px; }
.form-item { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 14px; color: #333; font-weight: 500; }
.form-input { padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
.submit-btn {
  padding: 14px; background-color: #1890ff; color: #fff;
  border: none; border-radius: 6px; font-size: 16px; font-weight: 500;
  cursor: pointer; margin-top: 10px;
}
.submit-btn:disabled { background-color: #d9d9d9; cursor: not-allowed; }
.error-message { color: #ff4d4f; font-size: 14px; text-align: center; }
@media screen and (max-width: 768px) { .auth-card { padding: 20px; } }
</style>
