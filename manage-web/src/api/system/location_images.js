import request from '@/utils/request'

// 查询地点图片列表
export function listLocationImages(query) {
  return request({
    url: '/system/location-images/list',
    method: 'get',
    params: query
  })
}

// 查询地点图片详细
export function getLocationImages(id) {
  return request({
    url: '/system/location-images/' + id,
    method: 'get'
  })
}

// 新增地点图片
export function addLocationImages(data) {
  return request({
    url: '/system/location-images',
    method: 'post',
    data: data
  })
}

// 修改地点图片
export function updateLocationImages(data) {
  return request({
    url: '/system/location-images',
    method: 'put',
    data: data
  })
}

// 删除地点图片
export function delLocationImages(id) {
  return request({
    url: '/system/location-images/' + id,
    method: 'delete'
  })
}

// 导出地点图片
export function exportLocationImages(query) {
  return request({
    url: '/system/location-images/export',
    method: 'get',
    params: query
  })
}
