import { ref, computed } from 'vue'
import { apiGetComments, apiAddComment, apiDeleteComment } from '@/api/apis.js'

/**
 * 评论逻辑 — 加载/添加/删除/分页
 * 接收 currentLocation ref 和 auth 相关状态
 */
export function useComments(currentLocation, auth) {
  const showCommentDialog = ref(false)
  const commentDialogType = ref('add')  // 'add' | 'list'
  const commentDialogTitle = ref('发表评论')
  const newCommentContent = ref('')
  const currentSectionComments = ref([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalComments = ref(0)
  const isSubmitting = ref(false)

  // ==================== 分页计算 ====================

  const currentPageComments = computed(() => {
    if (!currentSectionComments.value || currentSectionComments.value.length === 0) return []
    const start = (currentPage.value - 1) * pageSize.value
    return currentSectionComments.value.slice(start, start + pageSize.value)
  })

  const totalPages = computed(() => Math.ceil(totalComments.value / pageSize.value))

  function prevPage() { if (currentPage.value > 1) currentPage.value-- }
  function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

  // ==================== 加载评论 ====================

  function loadCommentsForSection() {
    if (!currentLocation.value || !currentLocation.value.id) return
    apiGetComments(currentLocation.value.id).then(res => {
      if (res.code === 1 && res.data) {
        currentLocation.value.comments = []
        setTimeout(() => { currentLocation.value.comments = res.data }, 0)
      }
    }).catch(() => {})
  }

  function reloadAllCommentsForDialog() {
    if (!currentLocation.value || !currentLocation.value.id) return
    apiGetComments(currentLocation.value.id).then(res => {
      if (res.code === 1 && res.data) {
        currentSectionComments.value = res.data
        totalComments.value = res.data.length
        if (currentPage.value > totalPages.value) currentPage.value = Math.max(1, totalPages.value)
      }
    }).catch(() => {})
  }

  // ==================== 弹窗控制 ====================

  function showAddCommentDialog() {
    if (!auth.isLoggedIn.value) {
      auth.showLoginDialog.value = true
      return
    }
    commentDialogType.value = 'add'
    commentDialogTitle.value = '发表评论'
    newCommentContent.value = ''
    showCommentDialog.value = true
  }

  function showAllComments() {
    if (!currentLocation.value) return
    currentSectionComments.value = currentLocation.value.comments || []
    totalComments.value = currentSectionComments.value.length
    currentPage.value = 1
    commentDialogType.value = 'list'
    commentDialogTitle.value = '所有评论'
    showCommentDialog.value = true
  }

  function hideCommentDialog() {
    showCommentDialog.value = false
    newCommentContent.value = ''
    currentSectionComments.value = []
  }

  // ==================== 提交/删除 ====================

  function submitComment() {
    if (!newCommentContent.value.trim()) {
      uni.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    const locationId = currentLocation.value?.id || 0
    const commentData = {
      userId: auth.currentUserId.value,
      locationId,
      content: newCommentContent.value.trim()
    }
    isSubmitting.value = true
    apiAddComment(commentData).then(res => {
      if (res.code === 1) {
        uni.showToast({ title: '已发表评论', icon: 'success' })
        loadCommentsForSection()
        hideCommentDialog()
      } else {
        uni.showModal({ title: '提示', content: res.msg || '评论失败', showCancel: false, success: () => {} })
      }
    }).catch(() => {
      uni.showToast({ title: '网络错误，评论失败', icon: 'none' })
    }).finally(() => {
      isSubmitting.value = false
    })
  }

  function deleteComment(commentId) {
    if (!auth.isLoggedIn.value) {
      auth.showLoginDialog.value = true
      return
    }
    uni.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          apiDeleteComment(commentId).then(res => {
            if (res && res.code === 1) {
              uni.showToast({ title: '删除成功', icon: 'success' })
              loadCommentsForSection()
              if (commentDialogType.value === 'list') reloadAllCommentsForDialog()
            } else {
              uni.showToast({ title: (res && res.msg) || '删除失败', icon: 'none' })
            }
          }).catch(() => {
            uni.showToast({ title: '网络错误，删除失败', icon: 'none' })
          })
        }
      }
    })
  }

  // ==================== 工具 ====================

  function formatTime(timeString) {
    if (!timeString) return ''
    return new Date(timeString).toLocaleString()
  }

  function isCurrentUser(userId) {
    return auth.isLoggedIn.value && String(auth.currentUserId.value) === String(userId)
  }

  // 注册到 useMap.loadAllComments 回调
  currentLocation._loadCommentsImpl = loadCommentsForSection

  return {
    showCommentDialog, commentDialogType, commentDialogTitle,
    newCommentContent, currentSectionComments, currentPage, pageSize,
    totalComments, isSubmitting,
    currentPageComments, totalPages,
    showAddCommentDialog, showAllComments, hideCommentDialog,
    submitComment, deleteComment,
    loadCommentsForSection, reloadAllCommentsForDialog,
    prevPage, nextPage, formatTime, isCurrentUser,
  }
}
