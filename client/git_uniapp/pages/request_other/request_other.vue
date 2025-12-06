<template>
	<view class="page-container">
		<view class="custom-search-bar">
			<view class="search-container">
				<text class="search-icon">🔍</text>
				<input class="search-input" :placeholder="placeholder" @focus="cancel" @blur="review" v-model="searchText" />
				<text class="clear-icon" @click="search_clear">×</text>
			</view>
			<text class="search-btn" @click="handleSearch">搜索</text>
		</view>
	
		<view class="container">
			<view id="mapContainer" class="map-container"></view>
		</view>
		<view class="btn-group">
			<button @click="locateMe">定位我的位置</button>
			<button @click="paintpath">路径规划</button>
		</view>
	</view>
	
	<view class="popup" v-if="showPopup">
	<view class="popup_title">
		{{ currentLocation ? currentLocation.name : '地点信息' }}
	</view>
	<view class="popup_content">
		<!-- 循环渲染每个section -->
		<view class="section" v-for="(section, sectionIndex) in currentLocation?.sections" :key="sectionIndex">
			<!-- 水平滚动图片列表 -->
			<scroll-view class="image-scroll" scroll-x show-scrollbar="false">
				<view class="image-list">
					<view class="image-item" v-for="(image, imageIndex) in section.images" :key="imageIndex">
						<img 
					:src="image" 
					alt="图片" 
					style="width: 100%; height: 100%; object-fit: cover;" 
					@error="handleImageError($event, image)"
				/>
					</view>
				</view>
			</scroll-view>
			<!-- 文字介绍 -->
			<view class="section-description" v-if="section.description">
				{{ section.description }}
			</view>
		</view>
	</view>
	<view class="popup_bottom">
		<button @click="hidePopup">关闭</button>
	</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from "vue"
import {apiSearchPlace,apiRoutePlanning} from "@/api/apis.js"

const map = ref(null)
const jing = ref(0)
const wei = ref(0)
const searchText = ref("")
const placeholder = ref("输入地点、服务")
//positioninfo用来存放点击地图某个点的信息
let positioninfo = ref({
	lng: 0,
	lat: 0
});
// 当前选中的地点，用于弹窗显示信息
// 数据结构包含sections数组，每个section有images数组和description
const currentLocation = ref(null)
const customMarker = ref(null)
const showPopup = ref(false) //决定弹窗是否显现
const destinationMarker = ref(null) // 目的地变量名
const currentPosition = ref([118.049801, 24.366802])
const destination = ref("")
const destLocation = ref("")
const destLng = ref("")
const desLat = ref("")
const navigationLine = ref(null)
const navigationSteps = ref([])
const isNavigating = ref(false)
const currentStepIndex = ref(0)


function startNavigation(){
	
}


//功能:轨迹演示动画
function drawroute(pathPoints){
	const routeline = new AMap.Polyline({
		path:[pathPoints[0]],
		strokeColor: "black",
		strokeWeight:3,
		strokeOpacity: 0.8,
		strokeStyle:"solid"
	})
	map.value.add(routeline)
	
	map.value.setCenter(pathPoints[0])
	map.value.setZoom(18)
	map.value.setPitch(40)
	
	const movingMarker = new AMap.Marker({
		position:pathPoints[0],
		icon:new AMap.Icon({
			size:new AMap.Size(20,20),
			image:"/static/walk.png",
			imageSize:new AMap.Size(20,20)
		}),
		offset:new AMap.Pixel(-10,-10)
	})
	
	map.value.add(movingMarker)
	
	let currentIndex = 0
	const totalPoints = pathPoints.length
	const animationDuration = 5000
	const interval = animationDuration / totalPoints
	
	const animate = ()=>{
		if(currentIndex < totalPoints){
			
			movingMarker.setPosition(pathPoints[currentIndex])
			map.value.setCenter(pathPoints[currentIndex])
			const currentPath = pathPoints.slice(0,currentIndex + 1)
			routeline.setPath(currentPath)
			
			currentIndex ++
			setTimeout(animate,interval)
		}
		else{
			uni.showModal({
				title:'是否需要导航',
				confirmText:"开始导航",
				cancelText:"取消",
				success:function (res){
					if(res.confirm){
						startNavigation()
					}
					else if(res.cancel){
						
					}
				},
				
			})	
		}
	}
	
	animate()
}

//功能：进行路径规划
function planroute(origin,destination,destName){
	apiRoutePlanning({
		origin: origin.join(","),
		destination: destination.join(",")
	}).then(res => {
		if(res.data.status === "1" && res.data.route && res.data.route.paths.length > 0){
			const path = res.data.route.paths[0]
			const steps = path.steps
			let pathPoints = []
			steps.forEach(step => {
				const polyline = step.polyline.split(";")
				polyline.forEach(point => {
					const [lng,lat] = point.split(",")
					pathPoints.push([parseFloat(lng),parseFloat(lat)])
				})
			})
			destinationMarker.value = new AMap.Marker({
				position:destination,
				title:destName
			})
			map.value.add(destinationMarker.value)
				
			drawroute(pathPoints)
			
		}
		else{
			uni.showToast({
				title:"路径规划失败",
				icon:"none"
			})
		}
	}).catch(err => {
		uni.showToast({
			title:"网络错误",
			icon:"none"
		})
	})
}




function paintpath() {
	// 清除之前的路径
	mapclear()
	planroute(currentPosition.value,[destLng.value,desLat.value],destination.value.name)
}

// 功能：清除地图的非自定义的标签
function mapclear() {
	const alloverlays = map.value.getAllOverlays()
	alloverlays.forEach(overlay => {
		if (overlay !== customMarker.value) {
			map.value.remove(overlay)
		}
	})
}

//用户点击地图上的某个点 获取这个点的所有信息
function handleAMapClick() {
	console.log('======= 地图点击事件 =======')
	map.value.on("click", function(e) {
		console.log('地图点击事件参数:', e)
		
		positioninfo.value.lng = e.lnglat.getLng()
		positioninfo.value.lat = e.lnglat.getLat()
		
		mapclear()
		
		const marker = new AMap.Marker({
			position: [positioninfo.value.lng, positioninfo.value.lat]
		});
		map.value.add(marker)
		
		map.value.setCenter(new AMap.LngLat(positioninfo.value.lng, positioninfo.value.lat));
		
		// 为了测试，直接调用showLocationInfo显示mock数据
		showLocationInfo(); // 不传参，会使用默认的mock数据
		console.log('======= 地图点击处理结束 =======')
	})
}

//创建地图实例
// 图片错误处理函数
function handleImageError(event, imageUrl) {
	console.log(`图片加载失败: ${imageUrl}`);
	// 设置备用图片（使用现有的logo.png）
	event.target.src = '/static/logo.png';
	// 显示错误提示
	event.target.alt = '图片加载失败';
}

// 显示地点详情弹窗
function showLocationInfo(location) {
	console.log('======= 弹窗显示开始 =======')
	console.log('1. 接收到的location数据:', location)
	console.log('1.1 location是否存在:', !!location)
	console.log('1.2 location.sections是否存在:', location?.sections)
	console.log('1.3 location.sections长度:', location?.sections?.length)
	
	// 强制设置mock数据用于测试
	const mockData = {
		name: "厦门大学嘉庚学院（测试数据）",
		sections: [
			{
				images: ["/static/pic1.jpg", "/static/pic2.jpg"],
				description: "这是学校的第一组展示图片，展示了校园的主要景观和建筑特色。这里环境优美，设施齐全，为学生提供了良好的学习和生活环境。"
			},
			{
				images: ["/static/pic1.jpg", "/static/pic2.jpg", "/static/pic3.jpg"],
				description: "这是学校的第二组展示图片，展示了更多校园细节和活动场景。包括教学楼、图书馆、体育场等重要设施，以及丰富多彩的校园文化生活。"
			}
		]
	};
	
	// 优先使用传入的location，但如果为空则使用mock数据
	currentLocation.value = location || mockData;
	showPopup.value = true;
	
	console.log('2. currentLocation设置后的值:', currentLocation.value)
	console.log('2.1 currentLocation.name:', currentLocation.value?.name)
	console.log('2.2 currentLocation.sections:', currentLocation.value?.sections)
	console.log('3. showPopup状态设置为:', showPopup.value)
	console.log('======= 弹窗显示结束 =======')
}

function initMap() {
	map.value = new AMap.Map("mapContainer", {
		zoom: 18,
		center: [118.049801, 24.366802],
		viewMode: "3D",
		zoomEnable: true, // 修正：启用缩放
		pitch: 10,
		rotation: 90, // 旋转角度
	})
	
	const bounds = new AMap.Bounds(
		[118.035, 24.355],
		[118.065, 24.380]
	)
	
	map.value.on('zoomchange', function() {
			let currentZoom = map.value.getZoom()
			if (currentZoom < 17.5) {
				map.value.setZoom(17.5)
			}
			else if (currentZoom > 18.5){
				map.value.setZoom(17.5)
			}
		})

	
	map.value.setLimitBounds(bounds)

	handleAMapClick()
	console.log(AMap)
	
	const marker = new AMap.Marker({
		position: [118.049801, 24.366802],
		title: "厦门大学嘉庚学院"
	});
	map.value.add(marker)
	
	addCustomIcon()
}

function addCustomIcon() {
	console.log('======= 添加自定义图标 =======')
	console.log('地图实例:', !!map.value ? '已获取' : '未获取')
	
	const customIcon = new AMap.Icon({
		size: new AMap.Size(100, 100),
		image: "/static/厦门大学嘉庚学院logo.webp",
		imageSize: new AMap.Size(100, 100)
	})
	console.log('创建自定义图标成功')
	
	customMarker.value = new AMap.Marker({
		position: [118.0472, 24.366591],
		icon: customIcon,
		title: "厦门大学嘉庚学院",
		anchor:new AMap.Pixel(50,50)
	});
	
	console.log('创建自定义标记成功')

	customMarker.value.on("click", function() {
		console.log('======= 自定义标记点击事件 =======')
		console.log('点击了自定义标记，准备显示弹窗')
		
		const locationData = {
			name: "厦门大学嘉庚学院",
			sections: [
				{
					// 第一组图片：2张照片
					images: ["/static/pic1.jpg", "/static/pic2.jpg"],
					description: "这是学校的第一组展示图片，展示了校园的主要景观和建筑特色。这里环境优美，设施齐全，为学生提供了良好的学习和生活环境。"
				},
				{
					// 第二组图片：3张照片
					images: ["/static/pic1.jpg", "/static/pic2.jpg", "/static/pic3.jpg"],
					description: "这是学校的第二组展示图片，展示了更多校园细节和活动场景。包括教学楼、图书馆、体育场等重要设施，以及丰富多彩的校园文化生活。"
				}
			]
		};
		
		console.log('准备传递的数据:', locationData);
		showLocationInfo(locationData);
		console.log('======= 自定义标记点击处理结束 =======')
	})

	map.value.add(customMarker.value);
	console.log('自定义标记已添加到地图')
	console.log('======= 添加自定义图标结束 =======')
}

//获取当前位置功能
function locateMe() {
	console.log("按钮被点击了")
	uni.getLocation({
		success: (res) => {
			console.log(res)
			jing.value = res.longitude
			wei.value = res.latitude
			map.value.setCenter([jing.value, wei.value])
			mapclear()	
			const marker = new AMap.Marker({
				position: [jing.value, wei.value],
				title: "我的位置"
			});
			map.value.add(marker)
		}
	})
}

//通过关键字搜索地图
function handleSearch() {
	apiSearchPlace({
			keywords: searchText.value,
			city: '漳州'
		}).then(res => {
			console.log('搜索成功:', res.data)
			if (res.data.status === '1' && res.data.pois) {
				showSearchResults(res.data.pois)
					
				//功能：记录搜索结果返回的第一个值方便进行路径规划
				destination.value = res.data.pois[0]
				destLocation.value = destination.value.location.split(',')
				destLng.value = parseFloat(destLocation.value[0])
				desLat.value = parseFloat(destLocation.value[1])
			} 
			else {
				uni.showToast({
					title: '搜索失败',
					icon: 'none'
				})
			}
		}).catch(err => {
			console.error('搜索请求失败:', err)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		})
}

function showSearchResults(pois) {
	mapclear()
	
	pois.forEach((poi, index) => {
		const marker = new AMap.Marker({
			position: [parseFloat(poi.location.split(',')[0]), parseFloat(poi.location.split(',')[1])],
			title: poi.name,
			map: map.value
		})
	})
	if (pois.length > 0) {
		const firstPoi = pois[0]
		const location = firstPoi.location.split(',')
		map.value.setCenter([parseFloat(location[0]), parseFloat(location[1])])
		map.value.setZoom(18)
	}
}

function cancel() {
	placeholder.value = ""
}

function review() {
	placeholder.value = "输入地点、服务"
}

function search_clear() {
	searchText.value = ""
}

//功能：将弹窗隐藏
function hidePopup() {
	showPopup.value = false;
	// 清除当前选中的地点，避免下次打开弹窗时显示旧数据
	currentLocation.value = null;
}

onMounted(() => {
	setTimeout(() => {
		initMap()
	}, 100)
})
</script>

<style lang="scss">
.page-container {
	display: flex;
	flex-direction: column;
	height: 100vh;

	.custom-search-bar {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background: white;
		border-bottom: 1rpx solid #eee;

		.search-container {
			flex: 1;
			display: flex;
			align-items: center;
			background: #f5f5f5;
			border-radius: 50rpx;
			padding: 10rpx 20rpx;
			margin-right: 20rpx;

			.search-icon {
				margin-right: 10rpx;
				color: #999
			}

			.search-input {
				flex: 1;
				height: 60rpx;
				font-size: 28rpx;
			}

			.clear-icon {
				color: #999;
				font-size: 40rpx;
				padding: 0 10rpx;
			}
		}

		.search-btn {
			color: #007AFF;
			font-size: 28rpx;
		}
	}
}

.container {
	width: 100%;
	height: 80vh;

	.map-container {
		width: 100%;
		height: 100%;
	}
}

.btn-group {
	display: flex;
	padding: 20rpx;
	justify-content: space-between;
	
	button {
		flex: 1;
		margin: 0 10rpx;
	}
}

.popup {
	position: fixed;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 80%;
	max-width: 500px;
	max-height: 80vh;
	background-color: #fff;
	border-radius: 20rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
	padding: 0;
	z-index: 9999;
	display: flex;
	flex-direction: column;
	/* 确保弹窗始终可见 */
	visibility: visible !important;
	opacity: 1 !important;
	pointer-events: auto !important;

	.popup_title {
		font-size: 36rpx;
		color: #333;
		font-weight: bold;
		padding: 30rpx;
		border-bottom: 1px solid #eee;
		text-align: center;
	}

	.popup_content {
		flex: 1;
		padding: 30rpx;
		overflow-y: auto;
	}

/* 每个内容区块的样式 */
.section {
	margin-bottom: 40rpx;
}

/* 水平滚动容器 */
.image-scroll {
	white-space: nowrap;
	margin-bottom: 20rpx;
	width: 100%;
	/* 隐藏滚动条但保留功能 */
	&::-webkit-scrollbar {
		display: none;
	}
}

/* 图片列表容器 */
.image-list {
	display: inline-flex;
	gap: 16rpx;
	width: auto;
}

/* 单个图片项 */
.image-item {
	display: inline-block;
	width: 450rpx;
	height: 300rpx;
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #f5f5f5;
}

.image-item img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

/* 文字介绍样式 */
.section-description {
	font-size: 28rpx;
	color: #666;
	line-height: 44rpx;
	text-align: justify;
	padding: 10rpx 0;
	word-break: break-all;
}

	.popup_bottom {
		display: flex;
		justify-content: center;
		padding: 20rpx;
		border-top: 1px solid #eee;
		
		button {
			background-color: #007AFF;
			color: white;
			border: none;
			padding: 15rpx 60rpx;
			border-radius: 60rpx;
			font-size: 28rpx;
		}
	}
}
</style>