import request from '@/utils/request'

// 查询子地点图片列表
export function listSubLocationImages(query) {
  return request({
    url: '/system/sub-location-images/list',
    method: 'get',
    params: query
  })
}

// 查询子地点图片详细
export function getSubLocationImages(id) {
  return request({
    url: '/system/sub-location-images/' + id,
    method: 'get'
  })
}

// 新增子地点图片
export function addSubLocationImages(data) {
  return request({
    url: '/system/sub-location-images',
    method: 'post',
    data: data
  })
}

// 修改子地点图片
export function updateSubLocationImages(data) {
  return request({
    url: '/system/sub-location-images',
    method: 'put',
    data: data
  })
}

// 删除子地点图片
export function delSubLocationImages(id) {
  return request({
    url: '/system/sub-location-images/' + id,
    method: 'delete'
  })
}

// 导出子地点图片
export function exportSubLocationImages(query) {
  return request({
    url: '/system/sub-location-images/export',
    method: 'get',
    params: query
  })
}
