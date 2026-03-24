<template>
	<view class="page-container">
		
	
		<view class="container">
			<view id="mapContainer" class="map-container"></view>
		</view>
		<view class="btn-group">
		<view class="icon-btn-container">
			<button @click="locateMe" class="icon-btn" title="定位我的位置" :disabled="isLocating">
				<text class="icon">📍</text>
			</button>
			<view v-if="isLocating" class="locating-indicator">
				<view class="spinner"></view>
				<text class="locating-text">定位中...</text>
			</view>
		</view>
		<button @click="paintpath" class="icon-btn" title="路径规划">
			<text class="icon">🗺️</text>
		</button>
		<button @click="clearRoute" class="icon-btn" title="删除地图所有标记">
			<text class="icon">🧹</text>
		</button>
		<button @click="resetCenter" class="icon-btn" title="回到中心">
			<text class="icon">🔄</text>
		</button>
	</view>
	
	<!-- 经纬度显示区域 -->
	<!-- <view class="coordinates-display">
		<text v-if="showCoordinates">经度: {{ coordinates.lng.toFixed(6) }}, 纬度: {{ coordinates.lat.toFixed(6) }}</text>
		<text v-else>点击地图查看经纬度</text>
	</view> -->
	</view>
	
	<!-- 地点信息弹窗 -->
<view class="popup location-popup" v-if="showPopup">
<view class="popup_title">
	{{ currentLocation ? currentLocation.name : '地点信息' }}
	<view class="popup_subtitle" v-if="currentLocation && currentLocation.description">
		{{ currentLocation.description }}
	</view>
</view>
<view class="popup_content">
	<!-- 循环渲染每个section -->
	<view class="section" v-for="(section, sectionIndex) in currentLocation?.sections" :key="sectionIndex">
		<!-- 副地点名称 -->
		<view class="section-title" v-if="section.name">
			{{ section.name }}
		</view>
		<!-- 水平滚动图片列表 -->
		<scroll-view class="image-scroll" scroll-x show-scrollbar="false">
			<view class="image-list">
				<view class="image-item" v-for="(image, imageIndex) in section.images" :key="imageIndex">
					<img 
					:src="image" 
					alt="图片" 
					style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" 
					@error="handleImageError($event, image)"
					@click="openImagePreview(image)"
				/>
				</view>
			</view>
		</scroll-view>
		<!-- 文字介绍 -->
		<view class="section-description" v-if="section.description">
			{{ section.description }}
		</view>
		<!-- 详细信息 -->
		<view class="section-description" v-if="section.information">
			{{ section.information }}
		</view>
	</view>
</view>
<view class="popup_bottom">
	<button @click="hidePopup">关闭</button>
	<button @click="navigateToHere">到这儿去</button>
</view>
</view>
	
	<!-- 路径规划对话框 -->
	<view class="popup route-popup" v-if="showRouteDialog">
	<view class="popup_title">
		路径规划
	</view>
	<view class="popup_content">
		<!-- 起点选择 -->
		<view class="route-input">
			<text>起点:</text>
			<view class="location-info">
				<text v-if="startLocation" class="location-text">{{ startLocation.name || `经度: ${startLocation.lng.toFixed(6)}, 纬度: ${startLocation.lat.toFixed(6)}` }}</text>
				<text v-else class="placeholder">请点击地图选择起点</text>
			</view>
			<button class="map-select-btn" @click="selectStartFromMap">点击地图选择</button>
		</view>
		
		<!-- 终点选择 -->
		<view class="route-input">
			<text>终点:</text>
			<view class="location-info">
				<text v-if="endLocation" class="location-text">{{ endLocation.name || `经度: ${endLocation.lng.toFixed(6)}, 纬度: ${endLocation.lat.toFixed(6)}` }}</text>
				<text v-else class="placeholder">请点击地图选择终点</text>
			</view>
			<button class="map-select-btn" @click="selectEndFromMap">点击地图选择</button>
		</view>
		
		
	</view>
	<view class="popup_bottom">
		<button @click="closeRouteDialog">取消</button>
		<button @click="confirmRoute" :disabled="!startLocation || !endLocation">开始规划</button>
	</view>
	</view>

	<!-- 图片预览弹窗 -->
	<view class="image-preview" v-if="showImagePreview">
		<view class="preview-content" @click="closeImagePreview">
			<img 
				:src="previewImage" 
				alt="预览图片" 
				class="preview-image" 
				@click.stop 
				@touchstart="handleTouchStart" 
				@touchmove="handleTouchMove"
			/>
			<view class="preview-close" @click="closeImagePreview">×</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from "vue"
import {apiRoutePlanning,apiAddLocation,apiGetLocationInfo} from "@/api/apis.js"
import mapConfig from "@/config/map.js"
import { geocode, reverseGeocode, routePlanning as mcpRoutePlanning, nearbySearch } from "@/api/mcp.js"

const map = ref(null)
const jing = ref(0)
const wei = ref(0)

//positioninfo用来存放点击地图某个点的信息
let positioninfo = ref({
	lng: 0,
	lat: 0
});
// 当前选中的地点，用于弹窗显示信息
// 数据结构包含sections数组，每个section有images数组和description
const currentLocation = ref(null)
const customMarkers = ref([])
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

// 路径规划相关对象
const routeLines = ref([]) // 保存路线对象
const movingMarkers = ref([]) // 保存移动标记对象

// 经纬度显示相关
const showCoordinates = ref(false)
const coordinates = ref({ lng: 0, lat: 0 })



// 交通方式选择
const selectedTransport = ref('walking') // 默认选择步行

// 路径规划相关
const showRouteDialog = ref(false) // 路径规划对话框
const startLocation = ref(null) // 起点位置信息
const endLocation = ref(null) // 终点位置信息
const selectingLocation = ref(null) // 当前正在选择的位置类型：'start' 或 'end'

// 定位状态管理
const isLocating = ref(false) // 是否正在定位中

// 添加标注相关
const showAddMarkerDialog = ref(false)
const newMarkerName = ref('')
const newMarkerPosition = ref({})
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })

// 图片预览相关
const showImagePreview = ref(false)
const previewImage = ref('')
const imageScale = ref(1)
const touchStartDistance = ref(0)
const touchStartScale = ref(1)





//功能:轨迹演示动画
function drawroute(pathPoints, mode = 'walking'){
	// 使用 window.AMap 确保访问全局对象
	const AMap = window.AMap;
	if (!AMap) {
		console.error('高德地图 API 加载失败');
		return;
	}
	
	// 步行模式的路线样式
	const strokeColor = "#1890ff";
	
	const routeline = new AMap.Polyline({
	path:[pathPoints[0]],
	strokeColor: strokeColor,
	strokeWeight:3,
	strokeOpacity: 0.8,
	strokeStyle:"solid"
})
map.value.add(routeline)
routeLines.value.push(routeline) // 保存路线对象
	
	map.value.setCenter(pathPoints[0])
	map.value.setZoom(18)
	map.value.setPitch(40)
	
	// 步行模式的图标
	const iconPath = "/static/walk.png";
	
	const movingMarker = new AMap.Marker({
	position:pathPoints[0],
	icon:new AMap.Icon({
		size:new AMap.Size(20,20),
		image:iconPath,
		imageSize:new AMap.Size(20,20)
	}),
	offset:new AMap.Pixel(-10,-10)
})

map.value.add(movingMarker)
movingMarkers.value.push(movingMarker) // 保存移动标记对象
	
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
		} else {
			// 动画结束
			console.log('路径动画完成');
		}
	}
	
	animate()
}

//功能：进行路径规划
function planroute(origin, destination, destName, mode = 'walking') {
	console.log('路径规划开始:', {
		origin: origin,
		destination: destination,
		destName: destName,
		mode: mode
	});
	
	// 确保 origin 和 destination 是数组格式，并且包含有效的数字经纬度
	if (!Array.isArray(origin) || origin.length !== 2 || !Array.isArray(destination) || destination.length !== 2) {
		console.error('路径规划参数错误: origin 和 destination 必须是包含两个数字的数组');
		uni.showToast({
			title: "路径规划参数错误",
			icon: "none"
		});
		return;
	}
	
	// 确保坐标值是有效的数字
	if (typeof origin[0] !== 'number' || typeof origin[1] !== 'number' || 
		typeof destination[0] !== 'number' || typeof destination[1] !== 'number') {
		console.error('路径规划参数错误: 坐标值必须是数字');
		uni.showToast({
			title: "路径规划参数错误: 坐标值必须是数字",
			icon: "none"
		});
		return;
	}
	
	// 使用高德地图 API 直接进行路径规划（不经过后端）
	directRoutePlanning(origin, destination, destName, mode);
}

// 新增：直接使用高德地图 API 进行路径规划
function directRoutePlanning(origin, destination, destName, mode) {
	const AMap = window.AMap;
	if (!AMap) {
		console.error('高德地图 API 加载失败');
		uni.showToast({
			title: "地图加载失败",
			icon: "none"
		});
		return;
	}
	
	// 安全码已在window._AMapSecurityConfig中设置
	
	// 步行模式的插件
	const pluginName = 'AMap.Walking';
	
	// 动态加载对应的路径规划插件
	AMap.plugin([pluginName], function() {
		console.log(`加载${pluginName}插件`);
		
		// 检查插件是否加载成功
		let routePlanner;
		let PlannerClass = AMap[pluginName.split('.')[1]];
		
		if (!PlannerClass) {
			console.error(`${pluginName}插件加载失败`);
			uni.showToast({
				title: "路径规划插件加载失败",
				icon: "none"
			});
			return;
		}
		
		try {
			// 初始化路径规划服务
				routePlanner = new PlannerClass({
					map: map.value
				});
			
			// 执行路径规划
			routePlanner.search(new AMap.LngLat(origin[0], origin[1]), new AMap.LngLat(destination[0], destination[1]), function(status, result) {
				console.log('路径规划状态:', status);
				console.log('路径规划结果:', result);
				
				if (status === 'complete') {
					// 路径规划成功
					if (result.routes && result.routes.length > 0) {
						const route = result.routes[0];
						
						// 提取路径点用于动画
						const steps = route.steps;
						let pathPoints = [];
						
						if (steps && steps.length > 0) {
							steps.forEach(step => {
								if (step.path) {
									pathPoints = pathPoints.concat(step.path);
								}
							});
						}
						
						console.log('路径点数量:', pathPoints.length);
						console.log('路线信息:', route);
						
						if (pathPoints.length > 0) {
							// 绘制路线动画
							drawroute(pathPoints, mode);
							
							uni.showToast({
								title: '路径规划成功',
								icon: 'success'
							});
						} else {
							// 即使没有路径点，也视为路径规划成功
							// 因为路线已经在地图上显示
							uni.showToast({
								title: '路径规划成功',
								icon: 'success'
							});
						}
					}
				} else {
					// 路径规划失败
					console.error('路径规划失败:', result);
					uni.showToast({
						title: "路径规划失败: " + (result.info || '未知错误'),
						icon: "none"
					});
				}
			});
		} catch (error) {
			console.error('初始化路径规划服务失败:', error);
			uni.showToast({
				title: "路径规划服务初始化失败",
				icon: "none"
			});
		}
	});
}




function paintpath() {
	// 打开路径规划对话框
	openRouteDialog();
}

// 功能：清除地图的非自定义的标签
function mapclear() {
	const alloverlays = map.value.getAllOverlays()
	alloverlays.forEach(overlay => {
		let isCustomMarker = false;
		for (const marker of customMarkers.value) {
			if (overlay === marker) {
				isCustomMarker = true;
				break;
			}
		}
		if (!isCustomMarker) {
			map.value.remove(overlay)
		}
	})
}

//用户点击地图上的某个点 获取这个点的所有信息
function handleAMapClick() {
	console.log('======= 地图点击事件 =======')
	// 添加地图点击事件监听器，获取并显示经纬度
	map.value.on("click", function(e) {
		console.log('地图点击事件参数:', e)
		
		// 获取点击位置的经纬度
		const lng = e.lnglat.getLng()
		const lat = e.lnglat.getLat()
		
		// 更新经纬度显示
		coordinates.value.lng = lng
		coordinates.value.lat = lat
		showCoordinates.value = true
		
		// 处理路径规划的位置选择
		if (selectingLocation.value) {
			const location = {
				lng: lng,
				lat: lat
			};
			
			if (selectingLocation.value === 'start') {
				startLocation.value = location;
				uni.showToast({
					title: '起点已选择',
					icon: 'success'
				});
			} else if (selectingLocation.value === 'end') {
				endLocation.value = location;
				uni.showToast({
					title: '终点已选择',
					icon: 'success'
				});
			}
			
			// 重置选择状态并重新打开路径规划对话框
			selectingLocation.value = null;
			showRouteDialog.value = true;
		}
		
		console.log('点击位置经纬度:', { lng, lat })
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

// 处理标注点击事件的可重用函数
function handleMarkerClick(e) {
	console.log('======= 圆形标注点击事件 =======')
		console.log('点击了圆形标注，准备从后端获取数据')
		
		// 从鼠标点击位置获取经纬度
		let lng, lat;
		if (e && e.lnglat) {
			// 从事件对象中获取点击位置
			lng = e.lnglat.getLng();
			lat = e.lnglat.getLat();
			console.log('鼠标点击位置:', { lng, lat });
		} else {
			// 回退到标注位置
			const position = this.getPosition();
			if (position) {
				if (typeof position.getLng === 'function' && typeof position.getLat === 'function') {
					// 如果是 AMap.LngLat 对象
					lng = position.getLng();
					lat = position.getLat();
				} else if (Array.isArray(position) && position.length === 2) {
					// 如果是数组 [lng, lat]
					[lng, lat] = position;
				} else {
					console.error('无法识别的坐标格式:', position);
					return;
				}
				console.log('标注位置:', { lng, lat });
			} else {
				console.error('无法获取位置信息');
				return;
			}
		}
		
		// 移动地图中心到点击位置，设置快速动画
		if (map.value) {
			map.value.panTo([lng, lat], 500); // 500毫秒完成平移
			
			// 放大地图
			setTimeout(() => {
				map.value.setZoom(18);
			}, 300);
		}
		
		// 获取标注的id
		const markerId = this.getExtData().id;
		console.log('标注id:', markerId);
		
		// 保存当前标注的位置，用于后续使用
		const currentMarkerPosition = this.getPosition();
	
	// 从后端接口获取数据，使用标注的id
	apiGetLocationInfo(markerId)
		.then(res => {
			console.log('后端接口响应:', res)
			if (res.code === 1 && res.data) {
				// 转换后端数据格式为前端需要的格式
				const sections = [];
				
				// 添加主地点信息
				sections.push({
					images: res.data.images || [],
					description: '',
					information: res.data.information || ''
				});
				
				// 添加副地点信息
				if (res.data.subLocations && res.data.subLocations.length > 0) {
					res.data.subLocations.forEach(subLocation => {
						sections.push({
							images: subLocation.images || [],
							description: subLocation.introduction || '',
							name: subLocation.name || ''
						});
					});
				}
				
				const locationData = {
					name: res.data.name,
					description: res.data.description,
					information: res.data.information,
					sections: sections,
					subLocations: res.data.subLocations || [],
					position: currentMarkerPosition // 保存标注的位置信息
				};
				
				console.log('后端数据转换后:', locationData);
				showLocationInfo(locationData);
			} else {
				// 如果后端数据获取失败，使用默认数据
				console.log('后端数据获取失败，使用默认数据')
				const defaultData = {
					name: "厦门大学嘉庚学院",
					description: "厦门大学嘉庚学院是一所综合性大学",
					information: "厦门大学嘉庚学院创建于2003年，是经国家教育部批准，由教育部直属重点大学厦门大学和厦门嘉庚教育发展有限公司共同举办的，按新机制和新模式运作的本科层次独立学院。",
					sections: [
						{
							images: ["/static/pic1.jpg", "/static/pic2.jpg"],
							description: '',
							information: "这里环境优美，设施齐全，为学生提供了良好的学习和生活环境。"
						},
						{
							name: "图书馆",
							images: ["/static/pic1.jpg", "/static/pic2.jpg", "/static/pic3.jpg"],
							description: "图书馆是学生学习的重要场所",
							information: "图书馆藏书丰富，环境安静，为学生提供了良好的学习环境。"
						}
					],
					subLocations: [{
						name: "图书馆",
						introduction: "图书馆是学生学习的重要场所",
						images: ["/static/pic1.jpg", "/static/pic2.jpg", "/static/pic3.jpg"]
					}],
					position: currentMarkerPosition // 保存标注的位置信息
				};
				showLocationInfo(defaultData);
			}
		})
		.catch(err => {
			console.error('后端接口请求失败:', err)
			// 请求失败时使用默认数据
			const defaultData = {
				name: "厦门大学嘉庚学院",
				description: "厦门大学嘉庚学院是一所综合性大学",
				information: "厦门大学嘉庚学院创建于2003年，是经国家教育部批准，由教育部直属重点大学厦门大学和厦门嘉庚教育发展有限公司共同举办的，按新机制和新模式运作的本科层次独立学院。",
				sections: [
					{
						images: ["/static/pic1.jpg", "/static/pic2.jpg"],
						description: '',
						information: "这里环境优美，设施齐全，为学生提供了良好的学习和生活环境。"
					},
					{
						name: "图书馆",
						images: ["/static/pic1.jpg", "/static/pic2.jpg", "/static/pic3.jpg"],
						description: "图书馆是学生学习的重要场所",
						information: "图书馆藏书丰富，环境安静，为学生提供了良好的学习环境。"
					}
				],
				subLocations: [{
					name: "图书馆",
					introduction: "图书馆是学生学习的重要场所",
					images: ["/static/pic1.jpg", "/static/pic2.jpg", "/static/pic3.jpg"]
				}]
			};
			showLocationInfo(defaultData);
		});
	
	console.log('======= 圆形标注点击处理结束 =======')
}

// 显示地点详情弹窗
function showLocationInfo(location) {
	console.log('======= 弹窗显示开始 =======')
	console.log('1. 接收到的location数据:', location)
	console.log('1.1 location是否存在:', !!location)
	
	// 如果传入了location参数，直接使用
	if (location) {
		currentLocation.value = location;
		showPopup.value = true;
		console.log('2. 使用传入的location数据')
	} else {
		// 从后端接口获取数据（这里使用默认ID 1，实际应该根据具体地点动态获取）
		console.log('2. 从后端接口获取数据')
		apiGetLocationInfo(1)
			.then(res => {
				console.log('3. 后端接口响应:', res)
				if (res.code === 1 && res.data) {
					// 转换后端数据格式为前端需要的格式
					const sections = [];
					
					// 添加主地点信息
					sections.push({
						images: res.data.images || [],
						description: res.data.description || res.data.information || ''
					});
					
					// 添加副地点信息
					if (res.data.subLocations && res.data.subLocations.length > 0) {
						res.data.subLocations.forEach(subLocation => {
							sections.push({
								images: subLocation.images || [],
								description: subLocation.introduction || ''
							});
						});
					}
					
					// 创建位置数据，不包含position信息（因为在这个分支中没有标注对象）
				const locationData = {
					name: res.data.name,
					description: res.data.description, // 保存主地点的description
					subLocations: res.data.subLocations, // 保存副地点信息
					sections: sections
				};
				currentLocation.value = locationData;
				showPopup.value = true;
				console.log('4. 后端数据转换后:', currentLocation.value)
				} else {
					// 如果后端数据获取失败，显示错误提示
					console.log('4. 后端数据获取失败，显示错误提示')
					uni.showToast({
						title: '获取地点信息失败',
						icon: 'none'
					});
				}
			})
			.catch(err => {
				console.error('5. 后端接口请求失败:', err)
				// 请求失败时显示错误提示
				uni.showToast({
					title: '网络错误，获取地点信息失败',
					icon: 'none'
				});
			});
	}
	
	console.log('6. showPopup状态设置为:', showPopup.value)
	console.log('======= 弹窗显示结束 =======')
}

function initMap() {
	// 使用 window.AMap 确保访问全局对象
	const AMap = window.AMap;
	if (!AMap) {
		console.error('高德地图 API 加载失败');
		return;
	}
	
	// 安全码已在window._AMapSecurityConfig中设置
	
	// 使用配置文件中的默认设置
	map.value = new AMap.Map("mapContainer", {
		zoom: mapConfig.default.zoom,
		center: mapConfig.default.center,
		viewMode: mapConfig.default.viewMode,
		zoomEnable: true, // 启用缩放
		pitch: 10,
		rotation: 90, // 旋转角度
		plugins: []
	})
	
	// 加载路径规划插件、定位插件和 SimpleMarker 插件
	AMap.plugin(['AMap.Walking', 'AMap.Geolocation', 'AMap.SimpleMarker'], function() {
		console.log('路径规划插件加载完成');
		console.log('AMap.Walking:', typeof AMap.Walking);
		console.log('AMap.Geolocation:', typeof AMap.Geolocation);
		console.log('AMap.SimpleMarker:', typeof AMap.SimpleMarker);
	});
	
	// 厦门大学嘉庚学院坐标（回退到原位置，再向西移动1公里，然后向东移动0.5公里）
	// 1度经度约等于111.32公里，0.5公里约等于0.00449度经度
	const schoolCenter = [118.045311, 24.366802];
	
	// 计算3公里范围的边界
	// 粗略计算：1度经度约等于111.32公里，1度纬度约等于111公里
	// 3公里约等于 3/111.32 ≈ 0.027度经度，3/111 ≈ 0.027度纬度
	const radius = 0.027;
	const bounds = new AMap.Bounds(
		[schoolCenter[0] - radius, schoolCenter[1] - radius], // 西南角
		[schoolCenter[0] + radius, schoolCenter[1] + radius]  // 东北角
	);
	
	// 设置地图缩放限制
	map.value.on('zoomchange', function() {
		let currentZoom = map.value.getZoom();
		if (currentZoom < 16) {
			map.value.setZoom(16);
		} else if (currentZoom > 19) {
			map.value.setZoom(19);
		}
	});

	// 设置地图边界限制
	map.value.setLimitBounds(bounds);

	handleAMapClick()
	
	// 添加右键菜单事件监听（PC端）
	map.value.on('rightclick', showContextMenuEvent)
	
	// 添加长按事件监听（移动端）
	map.value.on('longpress', function(e) {
		
		// 记录长按位置的坐标
		newMarkerPosition.value = {
			lng: e.lnglat.getLng(),
			lat: e.lnglat.getLat()
		}
		// 显示添加标注弹窗
		showAddMarkerDialog.value = true
	})
	
	console.log('高德地图 API 加载成功:', AMap)
	
	addCustomIcon()
}

function addCustomIcon() {
	console.log('======= 添加圆形标注 =======')
	console.log('地图实例:', !!map.value ? '已获取' : '未获取')
	
	const AMap = window.AMap;
	if (!AMap) {
		console.error('高德地图 API 加载失败');
		return;
	}
	
	// 先清除已有的自定义标注
	if (customMarkers.value.length > 0) {
		customMarkers.value.forEach(marker => {
			if (map.value) {
				map.value.remove(marker);
			}
		});
		customMarkers.value = [];
	}
	
	// 创建标注的函数
	function createMarker(position, id) {
		const marker = new AMap.Marker({
			position: position,
			title: "点击查看详细信息",
			icon: new AMap.Icon({
				size: new AMap.Size(12, 20),
				image: "//webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
				imageSize: new AMap.Size(12, 20)
			}),
			anchor: new AMap.Pixel(6, 20),
			offset: new AMap.Pixel(0, 0),
			extData: { id: id }
		});
		marker.on("click", handleMarkerClick);
		return marker;
	}
	
	// 所有标注的坐标和ID
	const markersData = [
		{ position: [118.047711, 24.366820], id: 13 },
		{ position: [118.047727, 24.366038], id: 8 },
		{ position: [118.048051, 24.365390], id: 7 },
		{ position: [118.047784, 24.367666], id: 14 },
		{ position: [118.048140, 24.368295], id: 1 },
		{ position: [118.046590, 24.364827], id: 15 },
		{ position: [118.045586, 24.368535], id: 16 },
		{ position: [118.045974, 24.369617], id: 17 },
		{ position: [118.044702, 24.367506], id: 18 },
		{ position: [118.043331, 24.367355], id: 19 },
		{ position: [118.046971, 24.375327], id: 20 },
		{ position: [118.046274, 24.375337], id: 21 },
		{ position: [118.045841, 24.373859], id: 22 },
		{ position: [118.043479, 24.372686], id: 23 },
		{ position: [118.047669, 24.375076], id: 24 },
		{ position: [118.045294, 24.370534], id: 25 },
		{ position: [118.047914, 24.361845], id: 26 },
		{ position: [118.048112, 24.373254], id: 27 },
		{ position: [118.047892, 24.374060], id: 28 },
		{ position: [118.046474, 24.370833], id: 29 },
		{ position: [118.049037, 24.371581], id: 30 },
		{ position: [118.047021, 24.373289], id: 31 },
		{ position: [118.047790, 24.371697], id: 32 },
		{ position: [118.048886, 24.361454], id: 33 },
		{ position: [118.041409, 24.366549], id: 34 },
		{ position: [118.047093, 24.374297], id: 35 },
		{ position: [118.042551, 24.364712], id: 36 },
		{ position: [118.049281, 24.366859], id: 37 },
	];
	
	// 批量创建标注
	markersData.forEach(data => {
		const marker = createMarker(data.position, data.id);
		map.value.add(marker);
		customMarkers.value.push(marker);
	});
	
	console.log(`成功添加 ${customMarkers.value.length} 个标注`);
}

//获取当前位置功能
function locateMe(callback) {
	// 设置定位中状态
	isLocating.value = true;
	
	const AMap = window.AMap;
	if (!AMap || !AMap.Geolocation) {
		console.error('高德地图定位插件加载失败');
		uni.showToast({
			title: '定位插件加载失败',
			icon: 'none'
		});
		isLocating.value = false;
		if (callback) callback(false);
		return;
	}
	
	// 初始化定位对象
	const geolocation = new AMap.Geolocation({
		enableHighAccuracy: true, // 是否使用高精度定位，默认:true
		timeout: 15000, // 延长超时时间到15秒，增加定位成功率
		maximumAge: 0, // 定位结果缓存0毫秒，默认：0ms
		convert: true, // 自动偏移坐标，默认：true
		showButton: false, // 不显示定位按钮，只使用我们自定义的绿色标记
		buttonPosition: 'LB', // 定位按钮停靠位置，默认：'LB'，左下角
		buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
		showMarker: false, // 不显示默认标记，我们自己添加绿色标记
		showCircle: false, // 不显示精度圆圈
		panToLocation: true, // 定位成功后将定位到的位置作为地图中心点，默认：true
		zoomToAccuracy: true, // 调整地图视野范围以显示定位精度
		extension: 'all' // 获取详细的定位信息
	});
	
	// 开始定位
	geolocation.getCurrentPosition(function(status, result) {
		// 定位完成，重置定位状态
		isLocating.value = false;
		
		if (status === 'complete') {
			console.log('定位成功:', result);
			
			// 获取定位结果
			const position = result.position;
			jing.value = position.lng;
			wei.value = position.lat;
			
			// 清除之前的覆盖物
			mapclear();

			// 使用 SimpleMarker 构建定位标注点
			if (AMap.SimpleMarker) {
				const marker = new AMap.SimpleMarker({
					position: [jing.value, wei.value],
					title: "我的位置",
					iconLabel: {
						innerHTML: "我",
						yOffset: -30
					},
					iconStyle: 'green'
				});
				
				map.value.add(marker);
			} else {
				// 如果 SimpleMarker 不可用，使用默认标记
				const marker = new AMap.Marker({
					position: [jing.value, wei.value],
					title: "我的位置",
					icon: new AMap.Icon({
						size: new AMap.Size(12, 20),
						image: "//webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
						imageSize: new AMap.Size(12, 20)
					})
				});
				map.value.add(marker);
			}
			
			// 显示定位精度信息
			if (result.accuracy) {
				console.log('定位精度:', result.accuracy, '米');
			}
			
			// 设置地图中心和缩放级别
			map.value.setCenter([jing.value, wei.value]);
			map.value.setZoom(18);
			
			// 执行回调函数
			if (callback) callback(true, [jing.value, wei.value]);
		} else {
			console.error('定位失败:', status, result);
			let errorMessage = '定位失败，请检查定位权限';
			if (status === 'timeout') {
				errorMessage = '定位超时，请检查网络连接';
			} else if (status === 'no_data') {
				errorMessage = '无法获取定位数据，请检查位置服务';
			}
			uni.showToast({
				title: errorMessage,
				icon: 'none'
			});
			if (callback) callback(false);
		}
	});
}

// 回到中心坐标功能
function resetCenter() {
	// 厦门大学嘉庚学院中心坐标
	const schoolCenter = [118.045311, 24.366802];
	map.value.setCenter(schoolCenter);
	map.value.setZoom(16); // 重置到默认缩放级别
}

// 清除路径规划路线
function clearRoute() {
	const AMap = window.AMap;
	if (!AMap || !map.value) {
		return;
	}
	
	// 清除所有覆盖物（除了自定义标注）
	const allOverlays = map.value.getAllOverlays();
	console.log('清除前覆盖物数量:', allOverlays.length);
	
	allOverlays.forEach(overlay => {
		// 保留自定义标注
		let isCustomMarker = false;
		for (const marker of customMarkers.value) {
			if (overlay === marker) {
				isCustomMarker = true;
				break;
			}
		}
		
		// 如果不是自定义标注，则移除
		if (!isCustomMarker) {
			map.value.remove(overlay);
		}
	});
	
	// 清空路线和移动标记数组
	routeLines.value = [];
	movingMarkers.value = [];
	
	// 重置路径规划相关变量
	destinationMarker.value = null;
	startLocation.value = null;
	endLocation.value = null;
	
	// 重新添加自定义标注（确保它们还在）
	if (customMarkers.value.length === 0) {
		addCustomIcon();
	}
	
	console.log('清除后覆盖物数量:', map.value.getAllOverlays().length);
	
	uni.showToast({
		title: '已清除',
		icon: 'success'
	});
}

// 打开路径规划对话框
function openRouteDialog() {
	showRouteDialog.value = true;
}

// 关闭路径规划对话框
function closeRouteDialog() {
	showRouteDialog.value = false;
	// 重置所有路径规划相关变量
	startLocation.value = null;
	endLocation.value = null;
	selectingLocation.value = null;
}

// 到这儿取功能
function navigateToHere() {
	console.log('======= 到这儿取功能 =======');
	console.log('当前地点信息:', currentLocation.value);
	
	// 检查是否有地点信息
	if (!currentLocation.value || !currentLocation.value.position) {
		console.error('没有地点信息');
		uni.showToast({
			title: '无法获取地点信息',
			icon: 'none'
		});
		return;
	}
	
	// 保存地点信息，因为hidePopup会清除currentLocation
	const targetLocation = {...currentLocation.value};
	
	// 先关闭信息弹窗
	hidePopup();
	
	// 显示正在规划中的提示
	uni.showLoading({
		title: '规划路线中...',
		mask: true
	});
	
	// 先调用定位方法确定起点
	locateMe(function(success, position) {
		if (success) {
			console.log('定位成功，开始路径规划');
			
			// 检查保存的地点信息是否有效
			if (!targetLocation || !targetLocation.position) {
				console.error('地点信息已丢失');
				uni.hideLoading();
				uni.showToast({
					title: '无法获取地点信息',
					icon: 'none'
				});
				return;
			}
			
			// 获取终点位置
			let endPosition = targetLocation.position;
			
			// 转换终点坐标格式
			let endCoords;
			if (endPosition && typeof endPosition.getLng === 'function' && typeof endPosition.getLat === 'function') {
				// 如果是 AMap.LngLat 对象
				endCoords = [endPosition.getLng(), endPosition.getLat()];
			} else if (Array.isArray(endPosition) && endPosition.length === 2) {
				// 如果是数组
				endCoords = endPosition;
			} else if (endPosition && endPosition.lng !== undefined && endPosition.lat !== undefined) {
				// 如果是对象 {lng, lat}
				endCoords = [endPosition.lng, endPosition.lat];
			} else {
				console.error('无法识别的终点坐标格式:', endPosition);
				uni.hideLoading();
				uni.showToast({
					title: '终点坐标格式错误',
					icon: 'none'
				});
				return;
			}
			
			console.log('起点:', position);
			console.log('终点:', endCoords);
			
			// 隐藏loading
			uni.hideLoading();
			
			// 执行路径规划
			planroute(position, endCoords, targetLocation.name, selectedTransport.value);
			
		} else {
			console.error('定位失败，无法进行路径规划');
			uni.hideLoading();
		}
	});
}

// 从地图选择起点
function selectStartFromMap() {
	selectingLocation.value = 'start';
	showRouteDialog.value = false;
	uni.showToast({
		title: '请在地图上点击选择起点',
		icon: 'none'
	});
}

// 从地图选择终点
function selectEndFromMap() {
	selectingLocation.value = 'end';
	showRouteDialog.value = false;
	uni.showToast({
		title: '请在地图上点击选择终点',
		icon: 'none'
	});
}

// 确认路径规划
function confirmRoute() {
	if (!startLocation.value || !endLocation.value) {
		uni.showToast({
			title: '请选择起点和终点',
			icon: 'none'
		});
		return;
	}
	
	// 准备起点和终点坐标
	let startCoords, endCoords;
	
	// 如果是从地图点击选择的位置，直接使用 lng 和 lat
	if (startLocation.value.lng && startLocation.value.lat) {
		startCoords = [startLocation.value.lng, startLocation.value.lat];
	} else if (startLocation.value.location) {
		// 如果是从搜索结果选择的位置，解析 location
		startCoords = startLocation.value.location.split(',').map(Number);
	}
	
	if (endLocation.value.lng && endLocation.value.lat) {
		endCoords = [endLocation.value.lng, endLocation.value.lat];
	} else if (endLocation.value.location) {
		endCoords = endLocation.value.location.split(',').map(Number);
	}
	
	// 清除之前的路径
	clearRoute();
	
	// 调用路径规划函数
	planroute(startCoords, endCoords, endLocation.value?.name || '终点', selectedTransport.value);
	
	// 关闭对话框
	closeRouteDialog();
}



//功能：将弹窗隐藏
function hidePopup() {
	showPopup.value = false;
	// 清除当前选中的地点，避免下次打开弹窗时显示旧数据
	currentLocation.value = null;
}



// 显示右键菜单
function showContextMenuEvent(e) {
	// 检查preventDefault方法是否存在
	if (e.preventDefault) {
		e.preventDefault()
	}
	showContextMenu.value = true
	contextMenuPosition.value = {
		x: e.clientX,
		y: e.clientY
	}
	// 记录点击位置的坐标
	newMarkerPosition.value = {
		lng: e.lnglat.getLng(),
		lat: e.lnglat.getLat()
	}
}

// 关闭右键菜单
function closeContextMenu() {
	showContextMenu.value = false
}

// 显示添加标注弹窗
function showAddMarker() {
	closeContextMenu()
	showAddMarkerDialog.value = true
}

// 关闭添加标注弹窗
function closeAddMarkerDialog() {
	showAddMarkerDialog.value = false
	newMarkerName.value = ''
	newMarkerPosition.value = {}
}

// 添加标注
function addMarker() {
	if (!newMarkerName.value) {
		uni.showToast({
			title: '请输入地点名称',
			icon: 'none'
		})
		return
	}
	
	const locationData = {
		name: newMarkerName.value,
		longitude: newMarkerPosition.value.lng,
		latitude: newMarkerPosition.value.lat,
		description: ''
	}
	
	apiAddLocation(locationData)
		.then(res => {
			if (res.code === 200) {
				// 添加成功，在地图上显示新标注
				const AMap = window.AMap
				if (AMap) {
					const marker = new AMap.Marker({
						position: [newMarkerPosition.value.lng, newMarkerPosition.value.lat],
						title: newMarkerName.value
					})
					map.value.add(marker)
				}
				closeAddMarkerDialog()
				uni.showToast({
					title: '添加成功',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: res.message || '添加失败',
					icon: 'none'
				})
			}
		})
		.catch(err => {
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		})
}

// 打开图片预览
function openImagePreview(image) {
	previewImage.value = image
	imageScale.value = 1
	showImagePreview.value = true
}

// 关闭图片预览
function closeImagePreview() {
	showImagePreview.value = false
	previewImage.value = ''
	imageScale.value = 1
}

// 处理触摸开始事件
function handleTouchStart(e) {
	if (e.touches.length === 2) {
		touchStartDistance.value = getDistance(e.touches[0], e.touches[1])
		touchStartScale.value = imageScale.value
	}
}

// 处理触摸移动事件
function handleTouchMove(e) {
	if (e.touches.length === 2) {
		const currentDistance = getDistance(e.touches[0], e.touches[1])
		const scale = currentDistance / touchStartDistance.value * touchStartScale.value
		// 限制缩放范围
		imageScale.value = Math.min(Math.max(0.5, scale), 3)
		// 应用缩放
		const img = e.target
		img.style.transform = `scale(${imageScale.value})`
	}
}

// 计算两点之间的距离
function getDistance(touch1, touch2) {
	const x = touch2.clientX - touch1.clientX
	const y = touch2.clientY - touch1.clientY
	return Math.sqrt(x * x + y * y)
}

onMounted(() => {
	// 检测 AMap 对象是否加载完成
	let checkCount = 0;
	const maxCheckCount = 30; // 最多检查30次，约3秒
	
	function checkAMap() {
		checkCount++;
		
		if (window.AMap) {
			// AMap 对象已加载
			console.log('AMap 对象加载成功');
			// 初始化地图
			console.log('开始初始化地图');
			initMap();
		} else if (checkCount < maxCheckCount) {
			// AMap 对象未加载，继续检测
			console.log(`等待 AMap 对象加载... (${checkCount}/${maxCheckCount})`);
			setTimeout(checkAMap, 100);
		} else {
			// 超时，显示错误信息
			console.error('高德地图 API 加载超时，请检查网络连接或 API key 是否正确');
			// 显示错误提示给用户
			uni.showToast({
				title: '地图加载失败，请检查网络连接',
				icon: 'none',
				duration: 3000
			});
		}
	}
	
	// 开始检测
	checkAMap();
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
	flex: 1;
	position: relative;

	.map-container {
		width: 100%;
		height: 100%;
	}
}

.btn-group {
	position: absolute;
	left: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	flex-direction: column;
	gap: 15rpx;
	z-index: 998;
	
	.icon-btn-container {
		position: relative;
		
		.icon-btn {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.9);
			border: 1rpx solid #ddd;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
			
			.icon {
				font-size: 40rpx;
			}
			
			&:hover {
				background-color: rgba(255, 255, 255, 1);
				box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.3);
			}
			
			&:disabled {
				opacity: 0.7;
				cursor: not-allowed;
			}
		}
		
		.locating-indicator {
			position: absolute;
			left: 100rpx;
			top: 50%;
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			gap: 10rpx;
			padding: 10rpx 20rpx;
			background-color: rgba(0, 0, 0, 0.7);
			border-radius: 40rpx;
			color: white;
			font-size: 24rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
			
			.spinner {
				width: 20rpx;
				height: 20rpx;
				border: 2rpx solid rgba(255, 255, 255, 0.3);
				border-top: 2rpx solid white;
				border-radius: 50%;
				animation: spin 1s linear infinite;
			}
			
			.locating-text {
				white-space: nowrap;
			}
		}
	}
	
	.icon-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.9);
		border: 1rpx solid #ddd;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
		
		.icon {
			font-size: 40rpx;
		}
		
		&:hover {
			background-color: rgba(255, 255, 255, 1);
			box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.3);
		}
	}
	
	.transport-selector {
		display: none;
	}
}

/* 旋转动画 */
@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

/* 经纬度显示区域 */
.coordinates-display {
	padding: 15rpx 20rpx;
	background-color: #f5f5f5;
	border-bottom: 1rpx solid #eee;
	text-align: center;
	font-size: 28rpx;
	color: #333;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 999;
}

.popup {
	position: fixed;
	background-color: rgba(0, 0, 0, 0.9);
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
			color: #fff;
			font-weight: bold;
			padding: 30rpx;
			border-bottom: 1px solid #555;
			text-align: center;
		}

		.popup_subtitle {
			font-size: 24rpx;
			color: #ccc;
			margin-top: 10rpx;
			font-weight: normal;
		}

		.section-title {
			font-size: 28rpx;
			color: #fff;
			font-weight: bold;
			margin-bottom: 15rpx;
			padding-bottom: 10rpx;
			border-bottom: 1px solid #444;
		}

	.popup_content {
		flex: 1;
		padding: 30rpx;
		overflow-y: auto;
		color: #fff;
		/* 自定义滚动条样式 */
		&::-webkit-scrollbar {
			width: 6rpx;
		}
		&::-webkit-scrollbar-track {
			background: rgba(255, 255, 255, 0.1);
			border-radius: 3rpx;
		}
		&::-webkit-scrollbar-thumb {
			background: rgba(255, 255, 255, 0.3);
			border-radius: 3rpx;
		}
		&::-webkit-scrollbar-thumb:hover {
			background: rgba(255, 255, 255, 0.5);
		}
	}

	.popup_bottom {
		display: flex;
		justify-content: space-around;
		padding: 20rpx;
		border-top: 1px solid #555;
		
		button {
			background-color: #007AFF;
			color: white;
			border: none;
			padding: 15rpx 60rpx;
			border-radius: 60rpx;
			font-size: 28rpx;
			margin: 0 10rpx;
		}
	}
}

/* 地点信息弹窗 */
.location-popup {
	right: 0;
	top: 0;
	width: 25vw;
	max-height: 75vh;
}

/* 路径规划弹窗 */
.route-popup {
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 30vw;
	max-height: 80vh;
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

/* 媒体查询 - 适配手机屏幕 */
@media screen and (max-width: 768px) {
	.location-popup {
		width: 70vw;
		max-height: 60vh;
		right: 0;
		top: 0;
		border-radius: 0 0 0 20rpx;
	}
	
	.route-popup {
		width: 90vw;
		max-height: 85vh;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	
	.popup_title {
		font-size: 32rpx;
		padding: 20rpx;
	}
	
	.popup_content {
		padding: 20rpx;
	}
	
	.section {
		margin-bottom: 30rpx;
	}
	
	.image-item {
		width: 300rpx;
		height: 200rpx;
	}
	
	.section-description {
		font-size: 24rpx;
		line-height: 36rpx;
	}
	
	.popup_bottom button {
		padding: 12rpx 40rpx;
		font-size: 24rpx;
		margin: 0 5rpx;
	}
	
	.route-input {
		margin-bottom: 20rpx;
		
		text {
			font-size: 24rpx;
			margin-bottom: 8rpx;
		}
		
		.location-info .location-text {
			font-size: 22rpx;
			padding: 8rpx;
		}
		
		.location-info .placeholder {
			font-size: 22rpx;
		}
		
		.map-select-btn {
			padding: 12rpx;
			font-size: 22rpx;
		}
	}
	
	.popup .transport-selector {
		margin-bottom: 15rpx;
		
		text {
			font-size: 24rpx;
			margin-bottom: 8rpx;
		}
		
		.transport-options {
			gap: 10rpx;
			
			button {
				padding: 12rpx;
				font-size: 24rpx;
			}
		}
	}
}

/* 媒体查询 - 适配平板屏幕 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
	.location-popup {
		width: 40vw;
		max-height: 75vh;
	}
	
	.route-popup {
		width: 50vw;
		max-height: 80vh;
	}
}

/* 右键菜单样式 */
.context-menu {
	position: fixed;
	z-index: 9999;
	background-color: #fff;
	border-radius: 8rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
	padding: 10rpx 0;
	min-width: 200rpx;
}

.menu-item {
	padding: 15rpx 20rpx;
	font-size: 28rpx;
	color: #333;
	cursor: pointer;
}

.menu-item:hover {
	background-color: #f5f5f5;
}

/* 路径规划输入样式 */
.route-input {
	margin-bottom: 30rpx;
	
	text {
		display: block;
		margin-bottom: 10rpx;
		font-size: 28rpx;
		color: #fff;
	}
	
	.location-info {
		margin-bottom: 10rpx;
		
		.location-text {
			font-size: 26rpx;
			color: #000;
			padding: 10rpx;
			background-color: #f5f5f5;
			border-radius: 8rpx;
		}
		
		.placeholder {
			font-size: 26rpx;
			color: #ccc;
		}
	}
	
	.map-select-btn {
		width: 100%;
		padding: 15rpx;
		background-color: #007AFF;
		color: white;
		border: none;
		border-radius: 8rpx;
		font-size: 26rpx;
	}
	
	
}

/* 弹窗中的交通方式选择器样式 */
.popup .transport-selector {
	width: 100%;
	display: flex;
	flex-direction: column;
	margin-bottom: 20rpx;
	
	text {
		display: block;
		margin-bottom: 10rpx;
		font-size: 28rpx;
		color: #fff;
	}
	
	.transport-options {
		display: flex;
		gap: 15rpx;
		
		button {
			flex: 1;
			padding: 15rpx;
			font-size: 28rpx;
			border: 1rpx solid #555;
			border-radius: 8rpx;
			background-color: #333;
			color: #fff;
		}
		
		button.active {
			background-color: #007AFF;
			color: white;
			border-color: #007AFF;
		}
	}
}

/* 表单样式 */
.form-item {
	margin-bottom: 30rpx;
	display: flex;
	align-items: center;
}

.form-item text {
	width: 120rpx;
	font-size: 28rpx;
	color: #333;
}

.form-item input {
	flex: 1;
	height: 60rpx;
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
}

/* 图片预览弹窗样式 */
.image-preview {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.9);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.preview-content {
	position: relative;
	width: 90%;
	height: 90%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.preview-image {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
	transition: transform 0.2s ease;
}

.preview-close {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	font-size: 60rpx;
	color: white;
	cursor: pointer;
	z-index: 10000;
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>