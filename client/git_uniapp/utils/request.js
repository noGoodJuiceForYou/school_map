// 基础 URL 配置 - 使用相对路径，通过nginx代理转发
const BASE_URL = '';

export function request(config = {}) {
	const {
		url,
		method = 'GET',
		data = {},
		...restConfig
	} = config
	
	// 构建完整的请求 URL
	const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
	
	return new Promise((resolve, reject) => {
		uni.request({
			url: fullUrl,
			method: method,
			data: data,
			...restConfig,
			success: (res) => {
				// 处理响应数据，只返回 data 部分
				if (res.statusCode === 200) {
					resolve(res.data);
				} else {
					reject(res);
				}
			},
			fail: (err) => {
				reject(err);
			}
		})
	})
}