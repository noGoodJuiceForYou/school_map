import { request } from "@/utils/request.js"
import mapConfig from "@/config/map.js"

// 使用用户提供的Key（从配置文件导入）
export const AMAP_KEY = mapConfig.amap.key;
// 安全密钥
export const AMAP_SECURITY_CODE = mapConfig.amap.securityJsCode;
export function apiGetLocationInfo(id) {
	return request({
		url: `/user/location/${id}`,
		method: 'GET'
	})
}

// 添加父地点接口
export function apiAddLocation(data) {
	return request({
		url: '/admin/location/add',
		method: 'POST',
		header: {
			'Content-Type': 'application/json'
		},
		data: data
	})
}

// 获取所有地点列表接口
export function apiGetLocationList() {
	return request({
		url: '/user/location/list',
		method: 'GET'
	})
}

export function apiSearchPlace(data){
	// 直接使用浏览器端API调用，避免平台不匹配问题
	return new Promise((resolve, reject) => {
		const url = new URL('https://restapi.amap.com/v3/place/text');
		url.searchParams.append('key', AMAP_KEY);
		url.searchParams.append('city', data.city || '漳州');
		url.searchParams.append('keywords', data.keywords);
		url.searchParams.append('offset', data.offset || 20);
		url.searchParams.append('extensions', data.extensions || 'base');
		
		fetch(url.toString())
			.then(response => response.json())
			.then(data => resolve(data))
			.catch(err => reject(err));
	});
}

export function apiRoutePlanning(data){
	// 使用高德地图JS API的路径规划服务
	return new Promise((resolve, reject) => {
		const AMap = window.AMap;
		if (!AMap) {
			reject(new Error('高德地图API加载失败'));
			return;
		}
		
		const mode = data.mode || 'walking'; // 默认使用步行
		const origin = data.origin;
		const destination = data.destination;
		
		console.log('路径规划请求参数:', {
			mode: mode,
			origin: origin,
			destination: destination
		});
		
		// 确保坐标格式正确
		if (!Array.isArray(origin) || origin.length !== 2 || !Array.isArray(destination) || destination.length !== 2) {
			reject(new Error('坐标格式错误: origin和destination必须是包含两个数字的数组'));
			return;
		}
		
		// 只支持步行模式
		const ServiceClass = AMap.Walking;
		
		// 检查服务类是否存在
		if (!ServiceClass) {
			// 如果服务类不存在，尝试动态加载
			const pluginName = 'AMap.Walking';
			console.log('尝试动态加载插件:', pluginName);
			
			AMap.plugin(pluginName, function() {
				try {
					// 插件加载完成后，再次获取服务类
					const ServiceClass = AMap.Walking;
					if (!ServiceClass) {
						reject(new Error('插件加载失败: ' + pluginName));
						return;
					}
					
					// 创建服务实例
				const service = new ServiceClass();
					
					// 确保坐标格式正确
				let originPoint, destinationPoint;
				
					// 检查是否已经是AMap.LngLat对象
				if (origin instanceof AMap.LngLat) {
					originPoint = origin;
				} else if (Array.isArray(origin) && origin.length === 2) {
					// 如果是数组，转换为AMap.LngLat对象
					originPoint = new AMap.LngLat(origin[0], origin[1]);
				} else {
					reject(new Error('起点坐标格式错误'));
					return;
				}
				
				if (destination instanceof AMap.LngLat) {
					destinationPoint = destination;
				} else if (Array.isArray(destination) && destination.length === 2) {
					// 如果是数组，转换为AMap.LngLat对象
					destinationPoint = new AMap.LngLat(destination[0], destination[1]);
				} else {
					reject(new Error('终点坐标格式错误'));
					return;
				}
				
				// 执行路径规划
				service.search([originPoint, destinationPoint], function(status, result) {
					console.log('路径规划API响应:', { status, result });
					if (status === 'complete') {
						resolve(result);
					} else {
						reject(new Error('路径规划失败: ' + status));
					}
				});
				} catch (error) {
					console.error('创建服务实例失败:', error);
					reject(new Error('创建服务实例失败: ' + error.message));
				}
			});
		} else {
			// 服务类已存在，直接创建实例
			try {
				const service = new ServiceClass();
				
				// 确保坐标格式正确
				let originPoint, destinationPoint;
				
				// 检查是否已经是AMap.LngLat对象
				if (origin instanceof AMap.LngLat) {
					originPoint = origin;
				} else if (Array.isArray(origin) && origin.length === 2) {
					// 如果是数组，转换为AMap.LngLat对象
					originPoint = new AMap.LngLat(origin[0], origin[1]);
				} else {
					reject(new Error('起点坐标格式错误'));
					return;
				}
				
				if (destination instanceof AMap.LngLat) {
					destinationPoint = destination;
				} else if (Array.isArray(destination) && destination.length === 2) {
					// 如果是数组，转换为AMap.LngLat对象
					destinationPoint = new AMap.LngLat(destination[0], destination[1]);
				} else {
					reject(new Error('终点坐标格式错误'));
					return;
				}
				
				// 执行路径规划
				service.search([originPoint, destinationPoint], function(status, result) {
					console.log('路径规划API响应:', { status, result });
					if (status === 'complete') {
						resolve(result);
					} else {
						reject(new Error('路径规划失败: ' + status));
					}
				});
			} catch (error) {
				console.error('创建服务实例失败:', error);
				reject(new Error('创建服务实例失败: ' + error.message));
			}
		}
	});
}

// 获取评论列表
export function apiGetComments(locationId) {
	return request({
		url: '/user/comment/list',
		method: 'GET',
		params: { locationId }
	})
}

// 添加评论
export function apiAddComment(data) {
	return request({
		url: '/user/comment/add',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		data: data
	})
}

// 删除评论
export function apiDeleteComment(id) {
	return request({
		url: `/user/comment/delete/${id}`,
		method: 'DELETE'
	})
}

// 检查登录状态
export function apiCheckLogin() {
	return request({
		url: '/user/login/check',
		method: 'GET'
	})
}

// 用户登录
export function apiLogin(data) {
	return request({
		url: '/user/login',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		data: data
	})
}

// 用户注册
export function apiRegister(data) {
	return request({
		url: '/user/register',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		data: data
	})
}

// 上传图片
export function apiUploadImage(file) {
	const formData = new FormData()
	formData.append('file', file)
	return request({
		url: '/admin/common/upload',
		method: 'POST',
		headers: {
			'Content-Type': 'multipart/form-data'
		},
		data: formData
	})
}

// 添加待审核图片
export function apiAddPendingReviewImage(data) {
	return request({
		url: '/user/pendingReviewImages/add',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		data: data
	})
}

// 获取待审核图片列表
export function apiGetPendingReviewImages(userId) {
	return request({
		url: `/user/pendingReviewImages/list?userId=${userId}`,
		method: 'GET'
	})
}

// 删除待审核图片
export function apiDeletePendingReviewImage(id) {
	return request({
		url: `/user/pendingReviewImages/delete?id=${id}`,
		method: 'DELETE'
	})
}
