import request from '@/utils/request'

// 查询地点信息列表
export function listInfo(query) {
  return request({
    url: '/admin/location/list',
    method: 'get',
    params: query
  })
}

// 查询地点信息详细
export function getInfo(id) {
  return request({
    url: '/admin/location/' + id,
    method: 'get'
  })
}

// 新增地点信息
export function addInfo(data) {
  return request({
    url: '/admin/location/add',
    method: 'post',
    data: data
  })
}

// 修改地点信息
export function updateInfo(data) {
  return request({
    url: '/admin/location/update',
    method: 'put',
    data: data
  })
}

// 删除地点信息
export function delInfo(ids) {
  console.log('delInfo called with ids:', ids);
  // 确保传递的是数组
  const idList = Array.isArray(ids) ? ids : [ids]
  return request({
    url: '/admin/location/delete',
    method: 'delete',
    params: { ids: idList.join(',') } // 转换为逗号分隔的字符串，适配后端@RequestParam
  })
}

// 获取地点图片
export function getImages(id) {
  return request({
    url: '/admin/location/' + id + '/images',
    method: 'get'
  })
}

// 获取父地点下拉列表
export function getLocationList() {
  return request({
    url: '/admin/location/Llist',
    method: 'get'
  })
}

// 新增地点图片
export function addImages(id, image) {
  return request({
    url: '/admin/location/addImages',
    method: 'post',
    params: { id, image }
  })
}

// 批量删除地点图片
export function deleteImages(ids) {
  return request({
    url: '/admin/location/deleteImages',
    method: 'delete',
    params: { ids }
  })
}

// 上传图片到OSS
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/admin/common/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
