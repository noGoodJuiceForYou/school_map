import { request } from "@/utils/request.js"

// 登录接口
export function apiGetlogin(data) {
	return request({
		url: "/map/login",
		method: 'POST',
		data: data
	})
}

// 注册接口
export function apiRegister(data) {
	return request({
		url: "/map/register",
		method: 'POST',
		data: data
	})
}

export function apiSearchPlace(data){
	return request({
		url:"https://restapi.amap.com/v3/place/text",
		method:"GET",
		data:{
			key:"a2d7433d8c3cac437658503c82a6b568",
			...data
		}
	})
}

export function apiRoutePlanning(data){
	return request({
		url:"https://restapi.amap.com/v3/direction/driving",
		method:"GET",
		data:{
			key:"a2d7433d8c3cac437658503c82a6b568",
			extensions:"all",
			output:"JSON",
			...data
		}
	})
}
