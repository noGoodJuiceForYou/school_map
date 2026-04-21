<template>
  <view class="login-register-container">
    <view class="auth-card">
      <view class="auth-header">
        <text class="auth-title">{{ isLogin ? '登录' : '注册' }}</text>
        <view class="auth-toggle">
          <text 
            :class="{ 'active': isLogin }" 
            @click="isLogin = true"
          >
            登录
          </text>
          <text 
            :class="{ 'active': !isLogin }" 
            @click="isLogin = false"
          >
            注册
          </text>
        </view>
      </view>
      
      <view class="auth-form">
        <!-- 用户名输入 -->
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入用户名" 
            class="form-input"
          />
        </view>
        
        <!-- 密码输入 -->
        <view class="form-item">
          <text class="form-label">密码</text>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码" 
            class="form-input"
          />
        </view>
        
        <!-- 确认密码输入（仅注册时显示） -->
        <view class="form-item" v-if="!isLogin">
          <text class="form-label">确认密码</text>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="请确认密码" 
            class="form-input"
          />
        </view>
        
        <!-- 错误提示 -->
        <view v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </view>
        
        <!-- 提交按钮 -->
        <button 
          @click="submitForm" 
          :disabled="isSubmitting"
          class="submit-btn"
        >
          {{ isSubmitting ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { apiLogin, apiRegister, apiCheckLogin } from '@/api/apis.js'

// 状态管理
const isLogin = ref(true) // true: 登录，false: 注册
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

// 提交表单
async function submitForm() {
  // 表单验证
  if (!username.value.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }
  
  if (!password.value.trim()) {
    errorMessage.value = '请输入密码'
    return
  }
  
  if (!isLogin.value && password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }
  
  // 清除错误信息
  errorMessage.value = ''
  isSubmitting.value = true
  
  try {
    let response
    if (isLogin.value) {
      // 登录
      response = await apiLogin({
        username: username.value.trim(),
        password: password.value
      })
    } else {
      // 注册
      response = await apiRegister({
        username: username.value.trim(),
        password: password.value
      })
    }
    
    if (response.code === 1) {
      // 登录/注册成功
      if (isLogin.value) {
        // 保存用户信息
        uni.setStorageSync('userInfo', response.data)
        uni.setStorageSync('userId', response.data.id)
        uni.setStorageSync('username', response.data.username)
      } else {
        // 注册成功后自动登录
        const loginResponse = await apiLogin({
          username: username.value.trim(),
          password: password.value
        })
        if (loginResponse.code === 1) {
          uni.setStorageSync('userInfo', loginResponse.data)
          uni.setStorageSync('userId', loginResponse.data.id)
          uni.setStorageSync('username', loginResponse.data.username)
        }
      }
      
      // 跳转回上一页
      uni.navigateBack()
    } else {
      // 登录/注册失败
      errorMessage.value = response.msg || (isLogin.value ? '登录失败' : '注册失败')
    }
  } catch (error) {
    console.error('请求失败:', error)
    errorMessage.value = '网络错误，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
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

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  display: block;
}

.auth-toggle {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.auth-toggle text {
  padding: 10px 20px;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.auth-toggle text.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

.submit-btn {
  padding: 14px;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #40a9ff;
}

.submit-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .auth-card {
    padding: 20px;
  }
  
  .auth-title {
    font-size: 20px;
  }
  
  .form-input {
    padding: 10px;
    font-size: 14px;
  }
  
  .submit-btn {
    padding: 12px;
    font-size: 14px;
  }
}
</style>