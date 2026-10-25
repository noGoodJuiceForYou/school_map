import request from '@/utils/request'

// 查询子地点列表
export function listLocation(query) {
  return request({
    url: '/admin/subLocation/list',
    method: 'get',
    params: query
  })
}

// 获取子地点图片
export function getSubLocationImages(id) {
  return request({
    url: '/admin/subLocation/' + id + '/images',
    method: 'get'
  })
}

// 查询子地点详细
export function getLocation(id) {
  return request({
    url: '/admin/subLocation/' + id,
    method: 'get'
  })
}

// 新增子地点
export function addLocation(data) {
  return request({
    url: '/admin/subLocation/add',
    method: 'post',
    data: data
  })
}

// 修改子地点
export function updateLocation(data) {
  return request({
    url: '/admin/subLocation/update',
    method: 'put',
    data: data
  })
}

// 删除子地点
export function delLocation(ids) {
  return request({
    url: '/admin/subLocation/delete',
    method: 'delete',
    data: Array.isArray(ids) ? ids : [ids]
  })
}

// 新增子地点图片
export function addImages(id, image) {
  return request({
    url: '/admin/subLocation/addImages',
    method: 'post',
    params: { id, image }
  })
}

// 批量删除子地点图片
export function deleteImages(ids) {
  return request({
    url: '/admin/subLocation/deleteImages',
    method: 'delete',
    params: { ids }
  })
}

// uploadImage 已提取到 @/api/common.js，此处不再重复导出
