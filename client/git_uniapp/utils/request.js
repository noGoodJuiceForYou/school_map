// 基础 URL 配置 - 使用相对路径，通过nginx代理转发
const BASE_URL = 'http://localhost:8080';

export function request(config = {}) {
	const {
		url,
		method = 'GET',
		data = {},
		params = {},
		...restConfig
	} = config
	
	// 构建完整的请求 URL
	const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
	
	// 对于 GET 请求，将 params 作为 data 传递，uni.request 会自动转换为 query 字符串
	const requestData = method.toUpperCase() === 'GET' ? params : data;
	
	return new Promise((resolve, reject) => {
		try {
			uni.request({
				url: fullUrl,
				method: method,
				data: requestData,
				...restConfig,
				success: (res) => {
					// 处理响应数据，只返回 data 部分
					if (res.statusCode === 200) {
						// 确保返回的数据是有效的对象
						const responseData = res.data || { code: 0, msg: '无响应数据' };
						resolve(responseData);
					} else {
						reject(res);
					}
				},
				fail: (err) => {
					reject(err);
				}
			})
		} catch (error) {
			reject(error);
		}
	})
}