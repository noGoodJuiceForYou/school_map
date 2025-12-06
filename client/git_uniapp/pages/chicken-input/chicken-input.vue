<template>
  <!-- 添加背景和整体容器 -->
  <view class="page-container">
    <!-- 添加标题 -->
    <view class="header">
      <text class="title">欢迎登录</text>
      <text class="subtitle">请登录您的账户</text>
    </view>
    <!-- 原有内容 -->
	
	
    <view class="form-container" v-if="currentTab === 0">
		
		<view class = "menu-tabs">
			<view class = "tab-item" :class = "{active:currentTab === 0}" @click="switchTab(0)">登录</view>
			<view class = "tab-item" :class = "{active:currentTab === 1}" @click="switchTab(1)">注册</view>
		</view>
		
      <view class = "out">
        <view class = "line">
          <text class="label">账号：</text>
          <input placeholder="请输入您的账号" @focus="acquire" @blur="clear" v-model="login_str">
        </view>
        <image class = "img1" src = "/static/chicken.gif" :class = "isActive?'':'img2'"></image>
      </view>
      
      <view class = "out">
        <view class = "line">
          <text class="label">密码：</text>
          <input password="true" placeholder="请输入您的密码" @focus="yyc = true" @blur="yyc = false" v-model="login_psw">
        </view>
      </view>
    </view>
	
	<!-- 注册界面 -->
	<view class="form-container" v-if="currentTab === 1">
		
		<view class = "menu-tabs">
			<view class = "tab-item" :class = "{active:currentTab === 0}" @click="switchTab(0)">登录</view>
			<view class = "tab-item" :class = "{active:currentTab === 1}" @click="switchTab(1)">注册</view>
		</view>
		
	  <view class = "out">
	    <view class = "line">
	      <text class="label">账号：</text>
	      <input placeholder="请输入您的账号" @focus="acquire" @blur="clear" v-model="register_str">
	    </view>
	    <image class = "img1" src = "/static/chicken.gif" :class = "isActive?'':'img2'"></image>
	  </view>
	  
	  <view class = "out">
	    <view class = "line">
	      <text class="label">密码：</text>
	      <input password="true" placeholder="请输入您的密码" v-model="register_psw1">
	    </view>
	  </view>
	  <view class = "out">
	      <view class = "line">
	        <text class="label">确认密码：</text>
	        <input password="true" placeholder="请确认您的密码" v-model="register_psw2">
	      </view>
	    </view>
	</view>

    <!-- 添加登录按钮 -->
    <view class="button-container" v-if="currentTab === 0">
      <button class="login-btn" @click="handleLogin">登录</button>
      <view class="register-container">
        <text class="register-text">还没有账号？</text>
        <text class="register-text2" style="z-index: 3;">立即注册</text>
      </view>
    </view>
	 <!-- 添加注册按钮 -->
	<view class="button-container" v-if="currentTab === 1">
	  <button class="login-btn" @click="handleRegister">注册</button>
	</view>
	
    
    <!-- 原有图片 -->
    <image :src = "yyc ? '/static/close.png' : '/static/open.png'"  class = "img3" v-if="currentTab === 0"></image>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import {onShow} from "@dcloudio/uni-app"
import {apiGetlogin} from "@/api/apis.js"
const currentTab = ref(0) //菜单变量
const login_str = ref("")
const login_psw = ref("")
const register_str = ref("") // 注册名字
const register_psw1 = ref("")
const register_psw2 = ref("")
const isActive = ref(false)
const yyc = ref(false)


onShow(()=>{
  uni.showLoading({
    title:"加载中...",
    mask:true
  })
  
  setTimeout(()=>{
    uni.hideLoading()
  },100)
})

//菜单栏确认点击事件
function switchTab(index){
	currentTab.value = index
}


function acquire(){
  isActive.value = true;
}

function clear(){
  isActive.value = false;
}

async function handleLogin() {
	if(login_str.value === "" || login_psw.value === ""){
		uni.showToast({
			title:"账号或密码不能为空！",
			icon:"none"
		});
		return
	}
	
	try {
		let res = await apiGetlogin({
			username: login_str.value,
			password: login_psw.value
		})
		
		// 在这里处理业务逻辑
		if(res.data.code === 0) {
			uni.showToast({
				title:"用户名或密码错误",
				icon:'error'
			})
		} else if(res.data.code === 1){
			uni.showToast({
				title:"登录成功！"
			})
			uni.navigateTo({
				url:"/pages/person-view/person-view"
			})
		}
	} catch(error) {
		console.error('登录失败:', error)
	}
}

// 注册逻辑方法
async function handleRegister(){
	if(register_str.value === "" || register_psw1.value === "" || register_psw2.value === "") {
		uni.showToast({
			title:"请填写完整",
			icon:'none'
		})
		return
	}
	
	if(register_psw1.value != register_psw2.value) {
		uni.showToast({
			title:"前后密码输入不一致",
			icon:'none'
		})
		return
	}
	
	try {
		const res = await apiRegister({
			username: register_str.value,
			password: register_psw2.value
		})
		if(res.data.code === 0) {
			uni.showToast({
				title: res.data.msg,
			})
		} else if(res.data.code === 1){
			uni.showToast({
				title:"注册成功！"
			})
			uni.navigateTo({
				url:"/pages/person-view/person-view"
			})
		}
	} catch(error) {
		console.error('注册失败:', error)
	}
}

</script>

<style lang = "scss">
/* 新增样式 */
.page-container {
  min-height: 100vh;
  background: #ffffff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
	  .menu-tabs {
		display: flex;
		background-color: white;
		border-radius: 12rpx;
		padding: 8rpx;
		margin-top: 20rpx;
			.tab-item {
				flex:1;
				text-align: center;
				padding: 18rpx 0rpx;
				font-size: 32rpx;
				color:#666;
				transition:all 0.3s;
				border-radius: 8rpx;
			}
			.tab-item.active {
			  border-bottom: 1px solid red;
			}
  }
}

.header {
  text-align: center;
  margin-top: 80rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.form-container {
  margin-top: 80rpx;
}

.button-container {
  margin-top: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 10rpx 20rpx rgba(102, 126, 234, 0.2);
  margin-bottom: 40rpx;
}

.login-btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 6rpx 12rpx rgba(102, 126, 234, 0.2);
}

.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-text {
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
}

.register-text2 {
  background: transparent;
  color: #667eea;
  font-size: 28rpx;
  border: none;
  text-decoration: underline;
  padding: 0;
}

/* 优化原有样式 */
.out{
  margin-top: 30px;
  position: relative;
  input{
    border: 1px solid #ddd;
    height: 20px;
    position: relative;
    background-color: #f9f9f9;
    padding: 12px 10px;
    z-index: 2;
    border-radius: 8rpx;
    color: #333;
    width: 100%;
    transition: all 0.3s;
  }
  
  input:focus {
    border-color: #667eea;
    background-color: #fff;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
  
  .line{
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .label {
    color: #333;
    width: 155rpx;
    flex-shrink: 0;
  }

  .img1{
    width: 24px;
    height: 24px;
    position: absolute;
    z-index: 1;
    top:-24px;
    left:45%;
    transition:0.3s;
  }
  .img2{
    top:0px;
    transition:0.3s;
  }
}
.img3{
  position: fixed;
  width:150px;
  height: 150px;
  right: 0px;
  bottom: 49px;
}

/* 输入框placeholder样式 */
input::placeholder {
  color: #999;
}
</style>