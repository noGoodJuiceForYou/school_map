import request from '@/utils/request'

// 获取普通用户列表
export function listUsers() {
  return request({
    url: '/admin/user/list',
    method: 'get'
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/user/delete/${id}`,
    method: 'delete'
  })
}

// 更新用户权限
export function updateUserIdentity(id, identity) {
  return request({
    url: '/admin/user/updateIdentity',
    method: 'put',
    params: { id, identity }
  })
}