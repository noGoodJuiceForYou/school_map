export function request(config = {}) {
	const {
		url,
		method = 'GET',
		data = {},
		...restConfig
	} = config
	
	return new Promise((resolve, reject) => {
		uni.request({
			url: url,
			method: method,
			data: data,
			...restConfig,
			success: (res) => {
				resolve(res)
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}