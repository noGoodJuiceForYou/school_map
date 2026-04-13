<template>
  <view class="page-container">
    <!-- 搜索栏 -->
    <view class="custom-search-bar">
      <view class="search-container">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="searchKeyword" placeholder="搜索地点..." @input="handleSearchInput"
          @confirm="handleSearch" />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
      <text class="search-btn" @click="handleSearch">搜索</text>
    </view>

    <!-- 搜索结果 -->
    <view v-if="showSearchResults" class="search-results">
      <view v-for="(result, index) in searchResults" :key="index" class="search-result-item"
        @click="handleSearchResultClick(result)">
        <text class="result-name">{{ result.name }}</text>
      </view>
      <view v-if="searchResults.length === 0" class="no-results">
        <text>未找到相关地点</text>
      </view>
    </view>

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
      <button @click="startAi" class="icon-btn" title="AI">
        <text class="icon">AI</text>
      </button>
    </view>

    <!-- 经纬度显示区域 -->
    <!-- <view class="coordinates-display">
		<text v-if="showCoordinates">经度: {{ coordinates.lng.toFixed(6) }}, 纬度: {{ coordinates.lat.toFixed(6) }}</text>
		<text v-else>点击地图查看经纬度</text>
	</view> -->

    <!-- 底部备案信息导航栏 -->
    <view class="beian-footer">
      <view class="beian-content">
        <image class="beian-icon" src="/static/police.png" mode="aspectFit"></image>

        <!-- 公安备案号 - 使用@click实现点击跳转 -->
        <text class="beian-text beian-link" @click="openBeianLink('https://beian.mps.gov.cn/#/query/webSearch')"
          @mouseenter="hoverLink = 'gongan'" @mouseleave="hoverLink = ''"
          :class="{ 'link-hover': hoverLink === 'gongan' }">
          闽公网安备35069802000090号
        </text>

        <text class="beian-separator">|</text>

        <!-- ICP备案号 - 使用@click实现点击跳转 -->
        <text class="beian-text beian-link" @click="openBeianLink('https://beian.miit.gov.cn/')"
          @mouseenter="hoverLink = 'icp'" @mouseleave="hoverLink = ''" :class="{ 'link-hover': hoverLink === 'icp' }">
          闽ICP备2026010979号
        </text>
      </view>
    </view>
  </view>

  <!-- 地点信息弹窗 -->
  <view class="popup location-popup" v-if="showPopup">
    <view class="popup_title">
      {{ currentLocation ? currentLocation.name : '地点信息' }}
      <view class="popup_subtitle" v-if="currentLocation && currentLocation.description">
        {{ currentLocation.description }}
      </view>
      <!-- 左上角导航按钮 -->
      <view class="popup_header_left">
        <view class="navigate-button" @click="navigateToHere" title="到这儿去">
          <text class="navigate-icon">🧭</text>
          <text class="navigate-text">到这儿去</text>
        </view>
      </view>
      <!-- 右上角关闭按钮 -->
      <view class="popup_header_right">
        <view class="icon-btn_close" @click="hidePopup" title="关闭">
          <text class="icon">✕</text>
        </view>
      </view>
    </view>
    <view class="popup_content">
      <!-- 循环渲染每个section -->
      <view class="section" v-for="(section, sectionIndex) in currentLocation?.sections" :key="sectionIndex">
        <!-- 副地点名称 -->
        <view class="section-title" v-if="section.name">
          {{ section.name }}
        </view>
        <!-- 轮播图 -->
        <view v-if="section.images && section.images.length > 0" class="swiper-container">
          <!-- 前进按钮 -->
          <view class="swiper-button swiper-button-next" @click="nextSlide(sectionIndex)"
            :class="{ 'disabled': (swiperCurrent[sectionIndex] || 0) === section.images.length - 1 }">
            <text class="swiper-button-icon">›</text>
          </view>
          <!-- 后退按钮 -->
          <view class="swiper-button swiper-button-prev" @click="prevSlide(sectionIndex)"
            :class="{ 'disabled': (swiperCurrent[sectionIndex] || 0) === 0 }">
            <text class="swiper-button-icon">‹</text>
          </view>
          <view class="swiper-wrapper" @touchstart="touchStart(sectionIndex, $event)"
            @touchmove="touchMove(sectionIndex, $event)" @touchend="touchEnd(sectionIndex)"
            :style="{ transform: `translateX(-${(swiperCurrent[sectionIndex] || 0) * 100}%)` }">
            <view v-for="(image, imageIndex) in section.images" :key="imageIndex" class="swiper-slide">
              <img :src="image" alt="图片" class="swiper-image" @error="handleImageError($event, image)"
                @click="openImagePreview(image)" />
            </view>
          </view>
          <!-- 轮播指示器 -->
          <view v-if="section.images.length > 1" class="swiper-pagination">
            <view v-for="(image, index) in section.images" :key="index" class="swiper-pagination-bullet"
              :class="{ 'active': (swiperCurrent[sectionIndex] || 0) === index }"
              @click="setSwiperCurrent(sectionIndex, index)" />
          </view>
        </view>
        <view v-else class="no-images">
          <text>暂无图片</text>
        </view>
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
          <text v-if="startLocation"
            class="location-text">{{ startLocation.name || `经度: ${startLocation.lng.toFixed(6)}, 纬度: ${startLocation.lat.toFixed(6)}` }}</text>
          <text v-else class="placeholder">请点击地图选择起点</text>
        </view>
        <view class="route-btn-group">
          <button class="map-select-btn" @click="selectStartFromMap">点击地图选择</button>
          <button class="map-select-btn use-location-btn" @click="useMyLocationAsStart">使用我的位置</button>
        </view>
      </view>

      <!-- 终点选择 -->
      <view class="route-input">
        <text>终点:</text>
        <view class="location-info">
          <text v-if="endLocation"
            class="location-text">{{ endLocation.name || `经度: ${endLocation.lng.toFixed(6)}, 纬度: ${endLocation.lat.toFixed(6)}` }}</text>
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
      <img :src="previewImage" alt="预览图片" class="preview-image" @click.stop @touchstart="handleTouchStart"
        @touchmove="handleTouchMove" />
      <view class="preview-close" @click="closeImagePreview">×</view>
    </view>
  </view>

  <!-- Coze AI 助手 iframe 弹窗 -->
  <view class="coze-iframe-container" v-if="showCozeIframe">
    <view class="coze-iframe-header">
      <text class="coze-title">厦小嘉校园智能导览助手</text>
      <view class="coze-close-btn" @click="closeCozeIframe">
        <text class="icon">✕</text>
      </view>
    </view>
    <iframe class="coze-iframe" src="/static/coze-chat.html" frameborder="0" allow="microphone; camera"></iframe>
  </view>

</template>

<script setup>
  import {
    ref,
    onMounted,
    onUnmounted
  } from "vue"
  import {
    apiRoutePlanning,
    apiAddLocation,
    apiGetLocationInfo,
    apiGetLocationList
  } from "@/api/apis.js"
  import mapConfig from "@/config/map.js"
  import {
    geocode,
    reverseGeocode,
    routePlanning as mcpRoutePlanning,
    nearbySearch
  } from "@/api/mcp.js"

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
  const coordinates = ref({
    lng: 0,
    lat: 0
  })



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
  const contextMenuPosition = ref({
    x: 0,
    y: 0
  })

  // 图片预览相关
  const showImagePreview = ref(false)
  const previewImage = ref('')
  const imageScale = ref(1)
  const touchStartDistance = ref(0)
  const touchStartScale = ref(1)

  // 轮播图相关
  const swiperCurrent = ref({})
  const touchStartX = ref({})
  const touchEndX = ref({})

  // 搜索相关
  const searchKeyword = ref('')
  const searchResults = ref([])
  const showSearchResults = ref(false)

  // Coze iframe 相关
  const showCozeIframe = ref(false)

  // 备案链接悬停状态
  const hoverLink = ref('')

  // 打开备案链接（在新窗口打开）
  function openBeianLink(url) {
    window.open(url, '_blank')
  }

  //功能:轨迹演示动画
  function drawroute(pathPoints, mode = 'walking') {
    // 使用 window.AMap 确保访问全局对象
    const AMap = window.AMap;
    if (!AMap) {
      console.error('高德地图 API 加载失败');
      return;
    }

    // 步行模式的路线样式
    const strokeColor = "#1890ff";

    const routeline = new AMap.Polyline({
      path: [pathPoints[0]],
      strokeColor: strokeColor,
      strokeWeight: 3,
      strokeOpacity: 0.8,
      strokeStyle: "solid"
    })
    map.value.add(routeline)
    routeLines.value.push(routeline) // 保存路线对象

    map.value.setCenter(pathPoints[0])
    map.value.setZoom(18)
    map.value.setPitch(40)

    // 步行模式的图标
    const iconPath = "/static/walk.png";

    const movingMarker = new AMap.Marker({
      position: pathPoints[0],
      icon: new AMap.Icon({
        size: new AMap.Size(20, 20),
        image: iconPath,
        imageSize: new AMap.Size(20, 20)
      }),
      offset: new AMap.Pixel(-10, -10)
    })

    map.value.add(movingMarker)
    movingMarkers.value.push(movingMarker) // 保存移动标记对象

    let currentIndex = 0
    const totalPoints = pathPoints.length
    const animationDuration = 5000
    const interval = animationDuration / totalPoints

    const animate = () => {
      if (currentIndex < totalPoints) {

        movingMarker.setPosition(pathPoints[currentIndex])
        map.value.setCenter(pathPoints[currentIndex])
        const currentPath = pathPoints.slice(0, currentIndex + 1)
        routeline.setPath(currentPath)

        currentIndex++
        setTimeout(animate, interval)
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
        routePlanner.search(new AMap.LngLat(origin[0], origin[1]), new AMap.LngLat(destination[0], destination[1]),
          function(status, result) {
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

      console.log('点击位置经纬度:', {
        lng,
        lat
      })
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
      console.log('鼠标点击位置:', {
        lng,
        lat
      });
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
        console.log('标注位置:', {
          lng,
          lat
        });
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
            sections: [{
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
          sections: [{
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

    // 根据屏幕宽度设置地图旋转角度，电脑端设置为东西朝向
    const screenWidth = window.innerWidth;
    let rotation = 0; // 默认南北朝向
    if (screenWidth >= 1024) {
      rotation = 90; // 东西朝向
    }

    // 使用配置文件中的默认设置
    map.value = new AMap.Map("mapContainer", {
      zoom: mapConfig.default.zoom,
      center: mapConfig.default.center,
      viewMode: mapConfig.default.viewMode,
      zoomEnable: true, // 启用缩放
      pitch: 10,
      rotation: rotation, // 旋转角度，90为东西朝向
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
      [schoolCenter[0] + radius, schoolCenter[1] + radius] // 东北角
    );

    // 设置地图缩放限制
    map.value.on('zoomchange', function() {
      let currentZoom = map.value.getZoom();
      if (currentZoom < 15) {
        map.value.setZoom(15);
      } else if (currentZoom > 19) {
        map.value.setZoom(19);
      }
    });

    // 设置地图边界限制
    map.value.setLimitBounds(bounds);

    // 监听地图移动结束事件，当超出边界时回到中心点
    map.value.on('moveend', function() {
      const center = map.value.getCenter();
      if (!bounds.contains(center)) {
        resetCenter();
      }
    });

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
        extData: {
          id: id
        }
      });
      marker.on("click", handleMarkerClick);
      return marker;
    }

    // 从后端获取地点信息
    apiGetLocationList().then(res => {
      console.log('后端返回的地点信息:', res);
      if (res.code === 1 && res.data && res.data.length > 0) {
        // 批量创建标注
        res.data.forEach(item => {
          if (item.longitude && item.latitude) {
            const marker = createMarker([item.longitude, item.latitude], item.id);
            map.value.add(marker);
            customMarkers.value.push(marker);

            // 添加调试日志，确认标注添加成功
            console.log(`添加标注: ID=${item.id}, 名称=${item.name}, 位置=[${item.longitude}, ${item.latitude}]`);
          }
        });
        console.log(`成功添加 ${customMarkers.value.length} 个标注`);

        // 如果添加的标注数量为0，使用默认数据
        if (customMarkers.value.length === 0) {
          console.log('后端返回的地点数据中没有有效的经纬度信息，使用默认数据');
          useDefaultMarkers();
        }
      } else {
        console.log('后端没有返回地点信息，使用默认数据');
        useDefaultMarkers();
      }
    }).catch(err => {
      console.error('获取地点信息失败:', err);
      useDefaultMarkers();
    });
  }

  // 使用默认标注数据
  function useDefaultMarkers() {
    const AMap = window.AMap;
    if (!AMap) return;

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
        extData: {
          id: id
        }
      });
      marker.on("click", handleMarkerClick);
      return marker;
    }

    const markersData = [{
        position: [118.047711, 24.366820],
        id: 13
      },
      {
        position: [118.047727, 24.366038],
        id: 8
      },
      {
        position: [118.048051, 24.365390],
        id: 7
      },
      {
        position: [118.047784, 24.367666],
        id: 14
      },
      {
        position: [118.048140, 24.368295],
        id: 1
      },
      {
        position: [118.046590, 24.364827],
        id: 15
      },
      {
        position: [118.045586, 24.368535],
        id: 16
      },
      {
        position: [118.045974, 24.369617],
        id: 17
      },
      {
        position: [118.044702, 24.367506],
        id: 18
      },
      {
        position: [118.043331, 24.367355],
        id: 19
      },
      {
        position: [118.046971, 24.375327],
        id: 20
      },
      {
        position: [118.046274, 24.375337],
        id: 21
      },
      {
        position: [118.045841, 24.373859],
        id: 22
      },
      {
        position: [118.043479, 24.372686],
        id: 23
      },
      {
        position: [118.047669, 24.375076],
        id: 24
      },
      {
        position: [118.045294, 24.370534],
        id: 25
      },
      {
        position: [118.047914, 24.361845],
        id: 26
      },
      {
        position: [118.048112, 24.373254],
        id: 27
      },
      {
        position: [118.047892, 24.374060],
        id: 28
      },
      {
        position: [118.046474, 24.370833],
        id: 29
      },
      {
        position: [118.049037, 24.371581],
        id: 30
      },
      {
        position: [118.047021, 24.373289],
        id: 31
      },
      {
        position: [118.047790, 24.371697],
        id: 32
      },
      {
        position: [118.048886, 24.361454],
        id: 33
      },
      {
        position: [118.041409, 24.366549],
        id: 34
      },
      {
        position: [118.047093, 24.374297],
        id: 35
      },
      {
        position: [118.042551, 24.364712],
        id: 36
      },
      {
        position: [118.049281, 24.366859],
        id: 37
      },
    ];
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
    map.value.setZoom(16);
  }

  // Coze AI 助手 - 使用 iframe 方式打开
  function startAi() {
    showCozeIframe.value = true
  }

  // 关闭 Coze iframe
  function closeCozeIframe() {
    showCozeIframe.value = false
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
    const targetLocation = {
      ...currentLocation.value
    };

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

  // 使用我的位置作为起点
  function useMyLocationAsStart() {
    uni.showLoading({
      title: '定位中...',
      mask: true
    });

    locateMe(function(success, position) {
      uni.hideLoading();
      if (success) {
        // 定位成功，设置起点为当前位置
        startLocation.value = {
          lng: position[0],
          lat: position[1],
          name: '我的位置'
        };

        uni.showToast({
          title: '起点已设置为当前位置',
          icon: 'success'
        });
      } else {
        // 定位失败
        uni.showToast({
          title: '定位失败，请检查定位权限',
          icon: 'none'
        });
      }
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

  // 轮播图触摸开始事件
  function touchStart(sectionIndex, event) {
    touchStartX.value[sectionIndex] = event.touches[0].clientX
  }

  // 轮播图触摸移动事件
  function touchMove(sectionIndex, event) {
    touchEndX.value[sectionIndex] = event.touches[0].clientX
  }

  // 轮播图触摸结束事件
  function touchEnd(sectionIndex) {
    if (!swiperCurrent.value[sectionIndex]) {
      swiperCurrent.value[sectionIndex] = 0
    }
    const current = swiperCurrent.value[sectionIndex]
    const images = currentLocation.value?.sections[sectionIndex]?.images || []
    const imageCount = images.length

    if (touchEndX.value[sectionIndex] < touchStartX.value[sectionIndex] - 50) {
      // 向左滑动
      swiperCurrent.value[sectionIndex] = (current + 1) % imageCount
    } else if (touchEndX.value[sectionIndex] > touchStartX.value[sectionIndex] + 50) {
      // 向右滑动
      swiperCurrent.value[sectionIndex] = (current - 1 + imageCount) % imageCount
    }
  }

  // 手动设置轮播图当前索引
  function setSwiperCurrent(sectionIndex, index) {
    swiperCurrent.value[sectionIndex] = index
  }

  // 轮播图前进按钮点击事件
  function nextSlide(sectionIndex) {
    if (!swiperCurrent.value[sectionIndex]) {
      swiperCurrent.value[sectionIndex] = 0
    }
    const current = swiperCurrent.value[sectionIndex]
    const images = currentLocation.value?.sections[sectionIndex]?.images || []
    const imageCount = images.length

    if (current < imageCount - 1) {
      swiperCurrent.value[sectionIndex] = current + 1
    }
  }

  // 轮播图后退按钮点击事件
  function prevSlide(sectionIndex) {
    if (!swiperCurrent.value[sectionIndex]) {
      swiperCurrent.value[sectionIndex] = 0
    }
    const current = swiperCurrent.value[sectionIndex]

    if (current > 0) {
      swiperCurrent.value[sectionIndex] = current - 1
    }
  }

  // 搜索相关方法
  function handleSearchInput() {
    // 可以在这里添加防抖处理
    if (searchKeyword.value.length > 0) {
      // 自动搜索
      handleSearch();
    } else {
      // 搜索词为空时，清除搜索结果
      searchResults.value = [];
      showSearchResults.value = false;
    }
  }

  function handleSearch() {
    if (!searchKeyword.value.trim()) {
      showSearchResults.value = false;
      return;
    }

    // 从后端获取地点列表并过滤
    apiGetLocationList().then(res => {
      if (res.code === 1 && res.data && res.data.length > 0) {
        // 过滤搜索结果
        searchResults.value = res.data.filter(item => {
          return item.name.toLowerCase().includes(searchKeyword.value.toLowerCase());
        });
        showSearchResults.value = searchResults.value.length > 0;
      } else {
        searchResults.value = [];
        showSearchResults.value = false;
      }
    }).catch(err => {
      console.error('搜索失败:', err);
      searchResults.value = [];
      showSearchResults.value = false;
    });
  }

  function clearSearch() {
    searchKeyword.value = '';
    searchResults.value = [];
    showSearchResults.value = false;
  }

  function handleSearchResultClick(result) {
    // 关闭搜索结果
    showSearchResults.value = false;

    // 清空搜索栏
    searchKeyword.value = '';

    // 定位到搜索结果
    if (result.longitude && result.latitude) {
      const position = [result.longitude, result.latitude];
      map.value.setCenter(position);
      map.value.setZoom(18);

      // 清除之前的搜索标记
      const AMap = window.AMap;
      if (AMap) {
        const allOverlays = map.value.getAllOverlays();
        allOverlays.forEach(overlay => {
          if (overlay._isSearchMarker) {
            map.value.remove(overlay);
          }
        });

        // 模拟点击事件，打开地点信息弹窗
        const event = {
          lnglat: new AMap.LngLat(result.longitude, result.latitude)
        };
        handleMarkerClick.call({
          getExtData: () => ({
            id: result.id
          }),
          getPosition: () => position
        }, event);
      }
    }
  }



  onMounted(() => {
    // 检测 AMap 对象是否加载完成
    let checkCount = 0;
    const maxCheckCount = 30;

    function checkAMap() {
      checkCount++;

      if (window.AMap) {
        console.log('AMap 对象加载成功');
        initMap();
      } else if (checkCount < maxCheckCount) {
        console.log(`等待 AMap 对象加载... (${checkCount}/${maxCheckCount})`);
        setTimeout(checkAMap, 100);
      } else {
        console.error('高德地图 API 加载超时');
        uni.showToast({
          title: '地图加载失败，请检查网络连接',
          icon: 'none',
          duration: 3000
        });
      }
    }

    // 开始检测
    checkAMap();
  });
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
          cursor: pointer;
        }
      }

      .search-btn {
        color: #007AFF;
        font-size: 28rpx;
        cursor: pointer;
      }
    }

    .search-results {
      position: absolute;
      top: 120rpx;
      left: 20rpx;
      right: 20rpx;
      background: white;
      border-radius: 10rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
      max-height: 400rpx;
      overflow-y: auto;
      z-index: 999;

      .search-result-item {
        padding: 20rpx;
        border-bottom: 1rpx solid #f0f0f0;
        cursor: pointer;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: #f5f5f5;
        }

        .result-name {
          font-size: 28rpx;
          color: #333;
        }
      }

      .no-results {
        padding: 40rpx;
        text-align: center;
        color: #999;
        font-size: 26rpx;
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
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
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
      padding: 30rpx 90rpx;
      border-bottom: 1px solid #555;
      text-align: center;
      position: relative;
    }

    .popup_subtitle {
      font-size: 24rpx;
      color: #ccc;
      margin-top: 10rpx;
      font-weight: normal;
    }

    /* 左上角导航按钮区域 */
    .popup_header_left {
      position: absolute;
      top: 20rpx;
      left: 20rpx;
      z-index: 10;
    }

    /* 右上角关闭按钮区域 */
    .popup_header_right {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      z-index: 10;
    }

    /* 导航按钮 */
    .navigate-button {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 18rpx;
      border-radius: 25rpx;
      background-color: rgba(255, 255, 255, 0.15);
      cursor: pointer;
      transition: all 0.3s ease;

      .navigate-icon {
        font-size: 24rpx;
        color: #fff;
      }

      .navigate-text {
        font-size: 22rpx;
        font-weight: 500;
        color: #fff;
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    /* 关闭图标按钮 */
    .icon-btn_close {
      width: 50rpx;
      height: 50rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;

      .icon {
        font-size: 24rpx;
        color: #fff;
        font-weight: bold;
      }

      &:hover {
        background-color: rgba(255, 100, 100, 0.5);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
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

  /* 轮播图容器 */
  .swiper-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 12rpx;
    overflow: hidden;
    background-color: #f5f5f5;
    margin-bottom: 20rpx;
  }

  /* 轮播图包装器 */
  .swiper-wrapper {
    display: flex;
    height: 100%;
    transition: transform 0.3s ease;
  }

  /* 轮播图幻灯片 */
  .swiper-slide {
    flex: 0 0 100%;
    height: 100%;
    position: relative;
  }

  /* 轮播图图片 */
  .swiper-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
  }

  /* 轮播图指示器 */
  .swiper-pagination {
    position: absolute;
    bottom: 10rpx;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8rpx;
    z-index: 10;
  }

  /* 轮播图指示器圆点 */
  .swiper-pagination-bullet {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  /* 轮播图指示器激活状态 */
  .swiper-pagination-bullet.active {
    width: 24rpx;
    border-radius: 6rpx;
    background-color: #fff;
  }

  /* 轮播图切换按钮 */
  .swiper-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
  }

  /* 轮播图按钮图标 */
  .swiper-button-icon {
    font-size: 32rpx;
    color: #fff;
    font-weight: bold;
  }

  /* 前进按钮 */
  .swiper-button-next {
    right: 10rpx;
  }

  /* 后退按钮 */
  .swiper-button-prev {
    left: 10rpx;
  }

  /* 按钮悬停效果 */
  .swiper-button:hover {
    background-color: rgba(0, 0, 0, 0.8);
    transform: translateY(-50%) scale(1.1);
  }

  /* 按钮禁用状态 */
  .swiper-button.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* 禁用状态下的悬停效果 */
  .swiper-button.disabled:hover {
    background-color: rgba(0, 0, 0, 0.5);
    transform: translateY(-50%) scale(1);
  }

  /* 无图片状态 */
  .no-images {
    width: 100%;
    aspect-ratio: 16/9;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    color: #999;
    margin-bottom: 20rpx;
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

  /* Coze iframe 弹窗样式 */
  /* Coze iframe 弹窗样式 - 紧贴右下角 */
  .coze-iframe-container {
    position: fixed;
    right: 0;
    bottom: 8%;
    width: 25%;
    height: 80%;
    background-color: white;
    box-shadow: -2rpx -2rpx 20rpx rgba(0, 0, 0, 0.15);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 20rpx;

    .coze-iframe-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 24rpx;
      background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
      color: white;

      .coze-title {
        font-size: 28rpx;
        font-weight: bold;
      }

      .coze-close-btn {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.2);
        cursor: pointer;
        transition: all 0.3s ease;

        .icon {
          font-size: 28rpx;
          color: white;
          font-weight: bold;
        }

        &:hover {
          background-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }

    .coze-iframe {
      flex: 1;
      width: 100%;
      border: none;
      background-color: #fff;
    }
  }

  /* 移动端适配 - 占满全屏 */
  @media screen and (max-width: 768px) {
    .coze-iframe-container {
      width: 100%;
      height: 100%;
      right: 0;
      bottom: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;

      .coze-iframe-header {
        padding: 24rpx 32rpx;

        .coze-title {
          font-size: 34rpx;
        }

        .coze-close-btn {
          width: 60rpx;
          height: 60rpx;

          .icon {
            font-size: 36rpx;
          }
        }
      }
    }
  }

  /* 平板适配 */
  @media screen and (min-width: 769px) and (max-width: 1024px) {
    .coze-iframe-container {
      width: 35%;
      height: 75%;
    }
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
      padding: 20rpx 80rpx;
    }

    /* 移动端导航按钮适配 */
    .navigate-button {
      padding: 10rpx 16rpx;

      .navigate-icon {
        font-size: 20rpx;
      }

      .navigate-text {
        font-size: 20rpx;
      }
    }

    /* 移动端关闭按钮适配 */
    .icon-btn_close {
      width: 44rpx;
      height: 44rpx;

      .icon {
        font-size: 24rpx;
      }
    }

    .popup_header_left {
      top: 16rpx;
      left: 16rpx;
    }

    .popup_header_right {
      top: 16rpx;
      right: 16rpx;
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

      .route-btn-group {
        display: flex;
        gap: 10rpx;

        .map-select-btn {
          flex: 1;
          padding: 12rpx;
          font-size: 22rpx;
        }

        .use-location-btn {
          background-color: #4CD964 !important;
          color: white !important;
        }
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

    /* 移动端 Coze iframe 样式 */
    .coze-iframe-container {
      width: 90vw;
      height: 70vh;
      right: 5vw;
      bottom: 120rpx;
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

    .coze-iframe-container {
      width: 450rpx;
      height: 650rpx;
      right: 100rpx;
      bottom: 180rpx;
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

  /* ========== 底部备案信息导航栏 ========== */
  .beian-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60rpx;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    /*极高层级，确保在高德地图所有元素之上 */
    box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.5);
  }

  .beian-content {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    gap: 12rpx;
    padding: 0 20rpx;
  }

  /* 公安图标 */
  .beian-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 4rpx;
    flex-shrink: 0;
  }

  /* 备案号文本 */
  .beian-text {
    color: #000000;
    /* 白色文字 */
    font-size: 22rpx;
    line-height: 1.2;
  }

  /* 超链接样式 */
  .beian-link {
    color: #3282e3;
    /* 蓝色超链接 */
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
    /* 显示手型光标 */
  }

  /* 悬停效果 - 使用动态class实现（兼容uni-app H5） */
  .beian-link.link-hover {
    color: #0000ff;
    /* 悬停时变浅蓝 */
    text-decoration: underline;
  }

  /* 鼠标悬停时的光标效果 */
  .beian-text {
    cursor: pointer;
  }

  /* 分隔符 */
  .beian-separator {
    color: black;
    margin: 0 8rpx;
    font-size: 20rpx;
  }
</style>