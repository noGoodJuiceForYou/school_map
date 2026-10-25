<template>
  <view class="app-container">
    <!-- 主内容区域 -->
    <view class="main-content">
      <slot></slot>
    </view>

    <!-- 左侧悬浮按钮 -->
    <view class="coze-float-btn" @click="toggleChatBot">
      <text class="coze-btn-text">AI助手</text>
    </view>

    <!-- 聊天框遮罩层 -->
    <view v-if="isChatVisible" class="chat-overlay" @click="hideChatBot">
      <view class="chat-container" @click.stop>
        <view class="chat-header">
          <text class="chat-title">Coze AI助手</text>
          <text class="chat-close" @click="hideChatBot">×</text>
        </view>
        <view id="coze-chat-container" class="chat-content"></view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        isChatVisible: false,
        cozeClient: null
      }
    },
    onLaunch: function() {
      console.log('App Launch')
    },
    onShow: function() {
      console.log('App Show')
    },
    onHide: function() {
      console.log('App Hide')
    },
    methods: {
      // 切换聊天框显示状态
      toggleChatBot() {
        if (this.isChatVisible) {
          this.hideChatBot()
        } else {
          this.showChatBot()
        }
      },

      // 显示聊天框并初始化 SDK
      showChatBot() {
        this.isChatVisible = true

        // 等待 DOM 更新后初始化 Coze SDK
        this.$nextTick(() => {
          this.initCozeSDK()
        })
      },

      // 隐藏聊天框并卸载 SDK
      hideChatBot() {
        this.isChatVisible = false
        this.destroyCozeSDK()
      },

      // 初始化 Coze SDK
      initCozeSDK() {
        // 检查 SDK 是否已加载
        if (typeof CozeWebSDK === 'undefined') {
          console.error('Coze SDK 未加载')
          return
        }

        // 如果已存在实例，先销毁
        if (this.cozeClient) {
          this.destroyCozeSDK()
        }

        // 创建新的 Coze 客户端实例
        this.cozeClient = new CozeWebSDK.WebChatClient({
          config: {
            bot_id: '7581092393697542185',
          },
          componentProps: {
            title: 'Coze',
          },
          auth: {
            type: 'token',
            token: import.meta.env.VITE_COZE_TOKEN || '',
            onRefreshToken: function() {
              return import.meta.env.VITE_COZE_TOKEN || ''
            }
          },
          ui: {
            // 禁用默认悬浮球
            asstBtn: {
              isNeed: false
            }
          }
        })

        // 显示聊天框
        if (this.cozeClient && typeof this.cozeClient.showChatBot === 'function') {
          this.cozeClient.showChatBot()
        }

        console.log('Coze SDK 初始化成功')
      },

      // 销毁 Coze SDK
      destroyCozeSDK() {
        if (this.cozeClient) {
          // 隐藏聊天框
          if (typeof this.cozeClient.hideChatBot === 'function') {
            this.cozeClient.hideChatBot()
          }

          // 销毁实例
          if (typeof this.cozeClient.destroy === 'function') {
            this.cozeClient.destroy()
          }

          this.cozeClient = null
          console.log('Coze SDK 已卸载')
        }
      }
    }
  }
</script>

<style>
  /* 每个页面公共 CSS */
  .app-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .main-content {
    width: 100%;
    height: 100%;
  }

  /* 左侧悬浮按钮 */
  .coze-float-btn {
    position: fixed;
    left: 20rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 80rpx;
    height: 160rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
    z-index: 9999;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .coze-float-btn:active {
    transform: translateY(-50%) scale(0.95);
    box-shadow: 0 2rpx 10rpx rgba(102, 126, 234, 0.3);
  }

  .coze-btn-text {
    color: #ffffff;
    font-size: 24rpx;
    font-weight: bold;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    letter-spacing: 4rpx;
  }

  /* 聊天框遮罩层 */
  .chat-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }

  /* 聊天框容器 */
  .chat-container {
    width: 80%;
    height: 70%;
    background: #ffffff;
    border-radius: 20rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
  }

  /* 聊天框头部 */
  .chat-header {
    height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
  }

  .chat-title {
    color: #ffffff;
    font-size: 32rpx;
    font-weight: bold;
  }

  .chat-close {
    color: #ffffff;
    font-size: 48rpx;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
  }

  /* 聊天内容区域 */
  .chat-content {
    flex: 1;
    position: relative;
  }
</style>