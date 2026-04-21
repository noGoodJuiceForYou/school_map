import request from '@/utils/request'

// 分页查询评论审核列表
export function listReview(query) {
  return request({
    url: '/admin/commentReview/list',
    method: 'get',
    params: query
  })
}

// 删除评论
export function deleteReview(ids) {
  return request({
    url: '/admin/commentReview/delete',
    method: 'delete',
    params: { ids }
  })
}