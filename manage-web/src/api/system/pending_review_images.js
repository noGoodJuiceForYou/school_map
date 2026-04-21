import request from '@/utils/request'

// 获取待审核图片列表
export function listPendingReviewImages() {
  return request({
    url: '/admin/pendingReviewImages/list',
    method: 'get'
  })
}

// 审核通过待审核图片
export function movePendingReviewImage(id) {
  return request({
    url: `/admin/pendingReviewImages/move?id=${id}`,
    method: 'post'
  })
}

// 删除待审核图片
export function deletePendingReviewImage(id) {
  return request({
    url: `/admin/pendingReviewImages/delete?id=${id}`,
    method: 'delete'
  })
}