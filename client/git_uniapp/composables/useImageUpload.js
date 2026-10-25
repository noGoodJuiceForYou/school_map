import { ref } from 'vue'
import {
  apiAddPendingReviewImage,
  apiGetPendingReviewImages,
  apiDeletePendingReviewImage,
} from '@/api/apis.js'

/**
 * 图片上传 + 待审核图片管理
 * 接收 currentLocation ref 和 auth
 */
export function useImageUpload(currentLocation, auth) {
  const showPendingImagesDialog = ref(false)
  const pendingImages = ref([])
  const isUploading = ref(false)

  // ==================== 上传图片 ====================

  function uploadImage(sectionIndex) {
    if (!auth.isLoggedIn.value) {
      auth.showLoginDialog.value = true
      return
    }

    uni.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        isUploading.value = true
        uni.uploadFile({
          url: 'http://localhost:8080/user/common/upload',
          filePath: res.tempFilePaths[0],
          name: 'file',
          success: function (uploadRes) {
            try {
              const uploadResult = JSON.parse(uploadRes.data)
              if (uploadResult.code === 1) {
                const imageUrl = uploadResult.data
                const section = currentLocation.value?.sections[sectionIndex]
                const pendingImageData = {
                  userId: auth.currentUserId.value,
                  locationId: section?.subLocationId ? null : currentLocation.value.id,
                  subLocationId: section?.subLocationId || null,
                  url: imageUrl,
                  locationName: section?.subLocationId ? null : currentLocation.value.name,
                  subLocationName: section?.subLocationId ? section.name : null,
                }
                apiAddPendingReviewImage(pendingImageData).then(addRes => {
                  if (addRes.code === 1) {
                    uni.showToast({ title: '图片已提交审核', icon: 'success' })
                  } else {
                    uni.showToast({ title: '提交失败: ' + (addRes.msg || '未知错误'), icon: 'none' })
                  }
                }).catch(() => {
                  uni.showToast({ title: '网络错误，提交失败', icon: 'none' })
                })
              } else {
                uni.showToast({ title: '上传失败: ' + (uploadResult.msg || '未知错误'), icon: 'none' })
              }
            } catch {
              uni.showToast({ title: '上传失败，服务器返回格式错误', icon: 'none' })
            }
          },
          fail: function () {
            uni.showToast({ title: '上传失败，请重试', icon: 'none' })
          },
          complete: function () {
            isUploading.value = false
          },
        })
      },
      fail: function () {},
    })
  }

  // ==================== 待审核图片 ====================

  function showPendingImages() {
    if (!auth.isLoggedIn.value) {
      auth.showLoginDialog.value = true
      return
    }
    showPendingImagesDialog.value = true
    apiGetPendingReviewImages(auth.currentUserId.value).then(res => {
      if (res.code === 1) {
        pendingImages.value = res.data
      } else {
        uni.showToast({ title: '获取待审核图片失败: ' + (res.msg || '未知错误'), icon: 'none' })
      }
    }).catch(() => {
      uni.showToast({ title: '网络错误，获取失败', icon: 'none' })
    })
  }

  function hidePendingImagesDialog() {
    showPendingImagesDialog.value = false
  }

  function deletePendingImage(id) {
    uni.showModal({
      title: '确认删除',
      content: '确定要删除这张待审核的图片吗？',
      success: function (modalRes) {
        if (modalRes.confirm) {
          apiDeletePendingReviewImage(id).then(res => {
            if (res.code === 1) {
              uni.showToast({ title: '删除成功', icon: 'success' })
              apiGetPendingReviewImages(auth.currentUserId.value).then(r => {
                if (r.code === 1) pendingImages.value = r.data
              })
            } else {
              uni.showToast({ title: '删除失败: ' + (res.msg || '未知错误'), icon: 'none' })
            }
          }).catch(() => {
            uni.showToast({ title: '网络错误，删除失败', icon: 'none' })
          })
        }
      },
    })
  }

  return {
    showPendingImagesDialog, pendingImages, isUploading,
    uploadImage, showPendingImages, hidePendingImagesDialog, deletePendingImage,
  }
}
