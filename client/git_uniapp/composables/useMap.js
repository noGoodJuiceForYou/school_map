import { ref } from 'vue'
import { apiGetLocationInfo, apiGetLocationList } from '@/api/apis.js'
import mapConfig from '@/config/map.js'

/**
 * 地图核心逻辑 — 初始化、标记、点击事件、定位、轮播
 */
export function useMap() {
  const map = ref(null)
  const jing = ref(0)
  const wei = ref(0)
  const positioninfo = ref({ lng: 0, lat: 0 })
  const currentLocation = ref(null)
  const customMarkers = ref([])
  const showPopup = ref(false)
  const selectedMarker = ref(null)
  const currentPosition = ref([118.049801, 24.366802])
  const isLocating = ref(false)

  // 路径相关
  const routeLines = ref([])
  const movingMarkers = ref([])
  const selectingLocation = ref(null) // 'start' | 'end' | null

  // 轮播相关
  const swiperCurrent = ref({})
  const touchStartX = ref({})
  const touchEndX = ref({})

  // 经纬度显示
  const showCoordinates = ref(false)
  const coordinates = ref({ lng: 0, lat: 0 })

  // 上下文菜单（右键）
  const showContextMenu = ref(false)
  const contextMenuPosition = ref({ x: 0, y: 0 })

  // ==================== 工具函数 ====================

  function handleImageError(event, imageUrl) {
    console.log(`图片加载失败: ${imageUrl}`)
    event.target.src = '/static/logo.png'
    event.target.alt = '图片加载失败'
  }

  // ==================== 轮播控制 ====================

  function touchStart(sectionIndex, event) {
    touchStartX.value[sectionIndex] = event.touches[0].clientX
  }

  function touchMove(sectionIndex, event) {
    touchEndX.value[sectionIndex] = event.touches[0].clientX
  }

  function touchEnd(sectionIndex) {
    if (!swiperCurrent.value[sectionIndex]) {
      swiperCurrent.value[sectionIndex] = 0
    }
    const current = swiperCurrent.value[sectionIndex]
    const images = currentLocation.value?.sections[sectionIndex]?.images || []
    const imageCount = images.length

    if (touchEndX.value[sectionIndex] < touchStartX.value[sectionIndex] - 50) {
      swiperCurrent.value[sectionIndex] = (current + 1) % imageCount
    } else if (touchEndX.value[sectionIndex] > touchStartX.value[sectionIndex] + 50) {
      swiperCurrent.value[sectionIndex] = (current - 1 + imageCount) % imageCount
    }
  }

  function setSwiperCurrent(sectionIndex, index) {
    swiperCurrent.value[sectionIndex] = index
  }

  function nextSlide(sectionIndex) {
    if (!swiperCurrent.value[sectionIndex]) swiperCurrent.value[sectionIndex] = 0
    const current = swiperCurrent.value[sectionIndex]
    const images = currentLocation.value?.sections[sectionIndex]?.images || []
    if (current < images.length - 1) swiperCurrent.value[sectionIndex] = current + 1
  }

  function prevSlide(sectionIndex) {
    if (!swiperCurrent.value[sectionIndex]) swiperCurrent.value[sectionIndex] = 0
    const current = swiperCurrent.value[sectionIndex]
    if (current > 0) swiperCurrent.value[sectionIndex] = current - 1
  }

  // ==================== 弹窗控制 ====================

  function showLocationInfo(location) {
    if (location) {
      currentLocation.value = location
      showPopup.value = true
      setTimeout(() => loadAllComments(), 100)
    } else {
      apiGetLocationInfo(1).then(res => {
        if (res.code === 1 && res.data) {
          const sections = []
          sections.push({
            images: res.data.images || [],
            description: res.data.description || res.data.information || ''
          })
          if (res.data.subLocations && res.data.subLocations.length > 0) {
            res.data.subLocations.forEach(sub => {
              sections.push({
                images: sub.images || [],
                description: sub.introduction || '',
                subLocationId: sub.id
              })
            })
          }
          currentLocation.value = {
            id: res.data.id,
            name: res.data.name,
            description: res.data.description,
            subLocations: res.data.subLocations,
            sections: sections
          }
          showPopup.value = true
          setTimeout(() => loadAllComments(), 100)
        } else {
          uni.showToast({ title: '获取地点信息失败', icon: 'none' })
        }
      }).catch(() => {
        uni.showToast({ title: '网络错误，获取地点信息失败', icon: 'none' })
      })
    }
  }

  function hidePopup() {
    const AMap = window.AMap
    showPopup.value = false
    currentLocation.value = null
    if (selectedMarker.value && AMap) {
      selectedMarker.value.setIcon(new AMap.Icon({
        size: new AMap.Size(12, 20),
        image: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        imageSize: new AMap.Size(12, 20)
      }))
    }
  }

  // ==================== 评论加载占位 ====================

  function loadAllComments() {
    // 由 useComments composable 提供实现，这里留空作为回调占位
    if (typeof loadAllComments._impl === 'function') {
      loadAllComments._impl()
    }
  }

  // ==================== 标记点击处理 ====================

  function handleMarkerClick(e) {
    const AMap = window.AMap
    if (!AMap) return

    let lng, lat
    if (e && e.lnglat) {
      lng = e.lnglat.getLng()
      lat = e.lnglat.getLat()
    } else {
      const position = this.getPosition()
      if (position) {
        if (typeof position.getLng === 'function' && typeof position.getLat === 'function') {
          lng = position.getLng()
          lat = position.getLat()
        } else if (Array.isArray(position) && position.length === 2) {
          [lng, lat] = position
        } else { return }
      } else { return }
    }

    if (map.value) {
      map.value.panTo([lng, lat], 500)
      setTimeout(() => map.value.setZoom(18), 300)
    }

    if (selectedMarker.value) {
      selectedMarker.value.setIcon(new AMap.Icon({
        size: new AMap.Size(12, 20),
        image: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        imageSize: new AMap.Size(12, 20)
      }))
    }

    this.setIcon(new AMap.Icon({
      size: new AMap.Size(16, 26),
      image: '//webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
      imageSize: new AMap.Size(16, 26)
    }))
    selectedMarker.value = this

    const markerId = this.getExtData().id
    const currentMarkerPosition = this.getPosition()

    apiGetLocationInfo(markerId).then(res => {
      if (res.code === 1 && res.data) {
        const sections = []
        sections.push({
          images: res.data.images || [],
          description: '',
          information: res.data.information || ''
        })
        if (res.data.subLocations && res.data.subLocations.length > 0) {
          res.data.subLocations.forEach(sub => {
            sections.push({
              images: sub.images || [],
              description: sub.introduction || '',
              name: sub.name || '',
              subLocationId: sub.id
            })
          })
        }
        showLocationInfo({
          id: res.data.id,
          name: res.data.name,
          description: res.data.description,
          information: res.data.information,
          sections: sections,
          subLocations: res.data.subLocations || [],
          position: currentMarkerPosition
        })
      } else {
        showLocationInfo(_defaultLocationData(currentMarkerPosition))
      }
    }).catch(() => {
      showLocationInfo(_defaultLocationData(currentMarkerPosition))
    })
  }

  function _defaultLocationData(position) {
    return {
      name: '厦门大学嘉庚学院',
      description: '厦门大学嘉庚学院是一所综合性大学',
      information: '厦门大学嘉庚学院创建于2003年，是经国家教育部批准，由教育部直属重点大学厦门大学和厦门嘉庚教育发展有限公司共同举办的，按新机制和新模式运作的本科层次独立学院。',
      sections: [
        { images: ['/static/pic1.jpg', '/static/pic2.jpg'], description: '', information: '这里环境优美，设施齐全，为学生提供了良好的学习和生活环境。' },
        { name: '图书馆', images: ['/static/pic1.jpg', '/static/pic2.jpg', '/static/pic3.jpg'], description: '图书馆是学生学习的重要场所', information: '图书馆藏书丰富，环境安静，为学生提供了良好的学习环境。' }
      ],
      subLocations: [{ name: '图书馆', introduction: '图书馆是学生学习的重要场所', images: ['/static/pic1.jpg', '/static/pic2.jpg', '/static/pic3.jpg'] }],
      position
    }
  }

  // ==================== 地图初始化 ====================

  function initMap() {
    const AMap = window.AMap
    if (!AMap) { console.error('高德地图 API 加载失败'); return }

    const screenWidth = window.innerWidth
    let rotation = screenWidth >= 1024 ? 90 : 0

    map.value = new AMap.Map('mapContainer', {
      zoom: mapConfig.default.zoom,
      center: mapConfig.default.center,
      viewMode: mapConfig.default.viewMode,
      zoomEnable: true,
      pitch: 10,
      rotation: rotation,
      plugins: []
    })

    AMap.plugin(['AMap.Walking', 'AMap.Geolocation', 'AMap.SimpleMarker'], () => {
      console.log('路径规划插件加载完成')
    })

    const schoolCenter = [118.045311, 24.366802]
    const radius = 0.027
    const bounds = new AMap.Bounds(
      [schoolCenter[0] - radius, schoolCenter[1] - radius],
      [schoolCenter[0] + radius, schoolCenter[1] + radius]
    )

    map.value.on('zoomchange', () => {
      let z = map.value.getZoom()
      if (z < 15) map.value.setZoom(15)
      else if (z > 19) map.value.setZoom(19)
    })

    map.value.setLimitBounds(bounds)
    map.value.on('moveend', () => {
      if (!bounds.contains(map.value.getCenter())) resetCenter()
    })

    handleAMapClick()
    map.value.on('rightclick', showContextMenuEvent)
    map.value.on('longpress', function (e) {
      // 长按添加标注（占位保留，UI 部分暂未实现）
    })

    console.log('高德地图 API 加载成功:', AMap)
    addCustomIcon()
  }

  // ==================== 地图点击监听 ====================

  function handleAMapClick() {
    map.value.on('click', function (e) {
      const lng = e.lnglat.getLng()
      const lat = e.lnglat.getLat()
      coordinates.value.lng = lng
      coordinates.value.lat = lat
      showCoordinates.value = true

      if (selectingLocation.value) {
        const loc = { lng, lat }
        if (selectingLocation.value === 'start') {
          if (typeof handleAMapClick._onStartSelect === 'function')
            handleAMapClick._onStartSelect(loc)
        } else if (selectingLocation.value === 'end') {
          if (typeof handleAMapClick._onEndSelect === 'function')
            handleAMapClick._onEndSelect(loc)
        }
        selectingLocation.value = null
      }
    })
  }

  // 让 route planning 注册回调
  function onMapClickSelect(type, callback) {
    if (type === 'start') handleAMapClick._onStartSelect = callback
    else if (type === 'end') handleAMapClick._onEndSelect = callback
  }

  // ==================== 右键/上下文菜单 ====================

  function showContextMenuEvent(e) {
    e.preventDefault()
    showContextMenu.value = true
    contextMenuPosition.value = { x: e.clientX, y: e.clientY }
    positioninfo.value = { lng: e.lnglat.getLng(), lat: e.lnglat.getLat() }
  }

  function closeContextMenu() { showContextMenu.value = false }

  // ==================== 自定义标记 ====================

  function _createMarker(position, id) {
    const AMap = window.AMap
    const marker = new AMap.Marker({
      position,
      title: '点击查看详细信息',
      icon: new AMap.Icon({
        size: new AMap.Size(12, 20),
        image: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        imageSize: new AMap.Size(12, 20)
      }),
      anchor: new AMap.Pixel(6, 20),
      offset: new AMap.Pixel(0, 0),
      extData: { id }
    })
    marker.on('click', handleMarkerClick)
    return marker
  }

  function addCustomIcon() {
    const AMap = window.AMap
    if (!AMap) return

    if (customMarkers.value.length > 0) {
      customMarkers.value.forEach(m => { if (map.value) map.value.remove(m) })
      customMarkers.value = []
    }

    apiGetLocationList().then(res => {
      if (res.code === 1 && res.data && res.data.length > 0) {
        res.data.forEach(item => {
          if (item.longitude && item.latitude) {
            const marker = _createMarker([item.longitude, item.latitude], item.id)
            map.value.add(marker)
            customMarkers.value.push(marker)
          }
        })
        if (customMarkers.value.length === 0) useDefaultMarkers()
      } else {
        useDefaultMarkers()
      }
    }).catch(() => useDefaultMarkers())
  }

  function useDefaultMarkers() {
    const AMap = window.AMap
    if (!AMap) return

    const markersData = [
      { position: [118.047711, 24.366820], id: 13 }, { position: [118.047727, 24.366038], id: 8 },
      { position: [118.048051, 24.365390], id: 7 }, { position: [118.047784, 24.367666], id: 14 },
      { position: [118.048140, 24.368295], id: 1 }, { position: [118.046590, 24.364827], id: 15 },
      { position: [118.045586, 24.368535], id: 16 }, { position: [118.045974, 24.369617], id: 17 },
      { position: [118.044702, 24.367506], id: 18 }, { position: [118.043331, 24.367355], id: 19 },
      { position: [118.046971, 24.375327], id: 20 }, { position: [118.046274, 24.375337], id: 21 },
      { position: [118.045841, 24.373859], id: 22 }, { position: [118.043479, 24.372686], id: 23 },
      { position: [118.047669, 24.375076], id: 24 }, { position: [118.045294, 24.370534], id: 25 },
      { position: [118.047914, 24.361845], id: 26 }, { position: [118.048112, 24.373254], id: 27 },
      { position: [118.047892, 24.374060], id: 28 }, { position: [118.046474, 24.370833], id: 29 },
      { position: [118.049037, 24.371581], id: 30 }, { position: [118.047021, 24.373289], id: 31 },
      { position: [118.047790, 24.371697], id: 32 }, { position: [118.048886, 24.361454], id: 33 },
      { position: [118.041409, 24.366549], id: 34 }, { position: [118.047093, 24.374297], id: 35 },
      { position: [118.042551, 24.364712], id: 36 }, { position: [118.049281, 24.366859], id: 37 },
    ]
    markersData.forEach(data => {
      const marker = _createMarker(data.position, data.id)
      map.value.add(marker)
      customMarkers.value.push(marker)
    })
  }

  // ==================== 地图操作 ====================

  function mapclear() {
    const alloverlays = map.value.getAllOverlays()
    alloverlays.forEach(overlay => {
      let isCustomMarker = false
      for (const marker of customMarkers.value) { if (overlay === marker) { isCustomMarker = true; break } }
      if (!isCustomMarker) map.value.remove(overlay)
    })
  }

  function clearRoute() {
    const AMap = window.AMap
    const alloverlays = map.value.getAllOverlays()
    alloverlays.forEach(overlay => {
      let isCustomMarker = false
      for (const marker of customMarkers.value) { if (overlay === marker) { isCustomMarker = true; break } }
      if (!isCustomMarker) map.value.remove(overlay)
    })
    routeLines.value = []
    movingMarkers.value = []
    if (customMarkers.value.length === 0 && AMap) addCustomIcon()
  }

  function locateMe(callback) {
    isLocating.value = true
    const AMap = window.AMap
    if (!AMap || !AMap.Geolocation) {
      uni.showToast({ title: '定位插件加载失败', icon: 'none' })
      isLocating.value = false
      return
    }

    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true, timeout: 15000, maximumAge: 0,
      convert: true, showButton: false, showMarker: false, showCircle: false,
      panToLocation: true, zoomToAccuracy: true, extension: 'all'
    })

    geolocation.getCurrentPosition(function (status, result) {
      isLocating.value = false
      if (status === 'complete') {
        const pos = result.position
        jing.value = pos.lng
        wei.value = pos.lat
        mapclear()

        if (AMap.SimpleMarker) {
          const marker = new AMap.SimpleMarker({
            position: [jing.value, wei.value],
            title: '我的位置',
            iconLabel: { innerHTML: '我', yOffset: -30 },
            iconStyle: 'green'
          })
          map.value.add(marker)
        } else {
          const marker = new AMap.Marker({
            position: [jing.value, wei.value],
            title: '我的位置',
            icon: new AMap.Icon({
              size: new AMap.Size(12, 20),
              image: '//webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
              imageSize: new AMap.Size(12, 20)
            })
          })
          map.value.add(marker)
        }

        map.value.setCenter([jing.value, wei.value])
        map.value.setZoom(18)

        if (typeof callback === 'function') callback(true, [jing.value, wei.value])
      } else {
        let msg = '定位失败，请检查定位权限'
        if (status === 'timeout') msg = '定位超时，请检查网络连接'
        else if (status === 'no_data') msg = '无法获取定位数据，请检查位置服务'
        uni.showToast({ title: msg, icon: 'none' })
        if (typeof callback === 'function') callback(false, null)
      }
    })
  }

  function resetCenter() {
    map.value.setCenter([118.045311, 24.366802])
    map.value.setZoom(16)
  }

  // ==================== 搜索辅助 ====================

  function highlightMarker(result) {
    const AMap = window.AMap
    if (!AMap) return

    if (selectedMarker.value) {
      selectedMarker.value.setIcon(new AMap.Icon({
        size: new AMap.Size(12, 20),
        image: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        imageSize: new AMap.Size(12, 20)
      }))
    }

    let targetMarker = null
    for (const marker of customMarkers.value) {
      if (marker.getExtData().id === result.id) { targetMarker = marker; break }
    }

    if (targetMarker) {
      targetMarker.setIcon(new AMap.Icon({
        size: new AMap.Size(16, 26),
        image: '//webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
        imageSize: new AMap.Size(16, 26)
      }))
      selectedMarker.value = targetMarker
      const event = { lnglat: new AMap.LngLat(result.longitude, result.latitude) }
      handleMarkerClick.call(targetMarker, event)
    } else {
      const event = { lnglat: new AMap.LngLat(result.longitude, result.latitude) }
      handleMarkerClick.call({
        getExtData: () => ({ id: result.id }),
        getPosition: () => [result.longitude, result.latitude]
      }, event)
    }
  }

  return {
    // 状态
    map, jing, wei, currentLocation, customMarkers, showPopup, selectedMarker,
    currentPosition, isLocating, routeLines, movingMarkers, selectingLocation,
    swiperCurrent, touchStartX, touchEndX,
    showCoordinates, coordinates, showContextMenu, contextMenuPosition,
    // 方法
    initMap, addCustomIcon, useDefaultMarkers,
    handleMarkerClick, handleAMapClick, onMapClickSelect,
    showLocationInfo, hidePopup,
    mapclear, clearRoute, locateMe, resetCenter,
    handleImageError,
    showContextMenuEvent, closeContextMenu,
    touchStart, touchMove, touchEnd, nextSlide, prevSlide, setSwiperCurrent,
    highlightMarker,
    // 回调注册
    loadAllComments,
  }
}
