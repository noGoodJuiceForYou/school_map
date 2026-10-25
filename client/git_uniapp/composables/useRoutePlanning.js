import { ref } from 'vue'

/**
 * 路线规划 — 步行路径规划 + 动画
 * 需要从 useMap 传入 mapRef、clearRoute、locateMe、selectingLocation
 */
export function useRoutePlanning(mapRef, { clearRoute, locateMe, selectingLocation }) {
  const showRouteDialog = ref(false)
  const startLocation = ref(null)
  const endLocation = ref(null)
  const selectedTransport = ref('walking')

  // ==================== 路线动画 ====================

  function drawroute(pathPoints, mode = 'walking') {
    const AMap = window.AMap
    if (!AMap || !mapRef.value) return

    const strokeColor = '#1890ff'
    const routeline = new AMap.Polyline({
      path: [pathPoints[0]],
      strokeColor, strokeWeight: 3, strokeOpacity: 0.8, strokeStyle: 'solid'
    })
    mapRef.value.add(routeline)

    mapRef.value.setCenter(pathPoints[0])
    mapRef.value.setZoom(18)
    mapRef.value.setPitch(40)

    const movingMarker = new AMap.Marker({
      position: pathPoints[0],
      icon: new AMap.Icon({
        size: new AMap.Size(20, 20),
        image: '/static/walk.png',
        imageSize: new AMap.Size(20, 20)
      }),
      offset: new AMap.Pixel(-10, -10)
    })
    mapRef.value.add(movingMarker)

    let currentIndex = 0
    const totalPoints = pathPoints.length
    const animationDuration = 5000
    const interval = animationDuration / totalPoints

    const animate = () => {
      if (currentIndex < totalPoints) {
        movingMarker.setPosition(pathPoints[currentIndex])
        mapRef.value.setCenter(pathPoints[currentIndex])
        routeline.setPath(pathPoints.slice(0, currentIndex + 1))
        currentIndex++
        setTimeout(animate, interval)
      }
    }
    animate()
  }

  // ==================== 路径规划 ====================

  function planroute(origin, destination, destName, mode = 'walking') {
    if (!Array.isArray(origin) || origin.length !== 2 || !Array.isArray(destination) || destination.length !== 2) {
      uni.showToast({ title: '路径规划参数错误', icon: 'none' })
      return
    }
    if (typeof origin[0] !== 'number' || typeof origin[1] !== 'number' ||
        typeof destination[0] !== 'number' || typeof destination[1] !== 'number') {
      uni.showToast({ title: '路径规划参数错误: 坐标值必须是数字', icon: 'none' })
      return
    }
    directRoutePlanning(origin, destination, destName, mode)
  }

  function directRoutePlanning(origin, destination, destName, mode) {
    const AMap = window.AMap
    if (!AMap) {
      uni.showToast({ title: '地图加载失败', icon: 'none' })
      return
    }
    AMap.plugin(['AMap.Walking'], function () {
      const PlannerClass = AMap.Walking
      if (!PlannerClass) {
        uni.showToast({ title: '路径规划插件加载失败', icon: 'none' })
        return
      }
      try {
        const routePlanner = new PlannerClass({ map: mapRef.value })
        routePlanner.search(
          new AMap.LngLat(origin[0], origin[1]),
          new AMap.LngLat(destination[0], destination[1]),
          function (status, result) {
            if (status === 'complete' && result.routes && result.routes.length > 0) {
              const steps = result.routes[0].steps
              let pathPoints = []
              if (steps && steps.length > 0) {
                steps.forEach(step => { if (step.path) pathPoints = pathPoints.concat(step.path) })
              }
              if (pathPoints.length > 0) {
                drawroute(pathPoints, mode)
              }
              uni.showToast({ title: '路径规划成功', icon: 'success' })
            } else {
              uni.showToast({ title: '路径规划失败: ' + (result.info || '未知错误'), icon: 'none' })
            }
          }
        )
      } catch (e) {
        uni.showToast({ title: '路径规划服务初始化失败', icon: 'none' })
      }
    })
  }

  // ==================== 对话框 ====================

  function openRouteDialog() { showRouteDialog.value = true }

  function closeRouteDialog() {
    showRouteDialog.value = false
    startLocation.value = null
    endLocation.value = null
    if (selectingLocation) selectingLocation.value = null
  }

  function paintpath() { openRouteDialog() }

  function selectStartFromMap() {
    if (selectingLocation) selectingLocation.value = 'start'
    showRouteDialog.value = false
    uni.showToast({ title: '请点击地图选择起点', icon: 'none' })
  }

  function selectEndFromMap() {
    if (selectingLocation) selectingLocation.value = 'end'
    showRouteDialog.value = false
    uni.showToast({ title: '请点击地图选择终点', icon: 'none' })
  }

  function useMyLocationAsStart() {
    if (typeof locateMe === 'function') {
      locateMe(function (success, position) {
        if (success && position) {
          startLocation.value = { lng: position[0], lat: position[1] }
          showRouteDialog.value = true
        }
      })
    }
  }

  function confirmRoute() {
    if (!startLocation.value || !endLocation.value) return
    const origin = [startLocation.value.lng, startLocation.value.lat]
    const dest = [endLocation.value.lng, endLocation.value.lat]
    if (typeof clearRoute === 'function') clearRoute()
    planroute(origin, dest, endLocation.value.name || '', selectedTransport.value)
    closeRouteDialog()
  }

  function navigateToHere(currentLocation) {
    if (typeof locateMe === 'function') {
      locateMe(function (success, position) {
        if (success && position && currentLocation && currentLocation.position) {
          let destPos
          const pos = currentLocation.position
          if (typeof pos.getLng === 'function' && typeof pos.getLat === 'function') {
            destPos = [pos.getLng(), pos.getLat()]
          } else if (Array.isArray(pos) && pos.length === 2) {
            destPos = pos
          } else if (pos && pos.lng !== undefined && pos.lat !== undefined) {
            destPos = [pos.lng, pos.lat]
          }
          if (destPos) planroute(position, destPos, currentLocation.name || '', selectedTransport.value)
        }
      })
    }
  }

  return {
    showRouteDialog, startLocation, endLocation, selectedTransport,
    planroute, directRoutePlanning, drawroute, paintpath,
    openRouteDialog, closeRouteDialog, confirmRoute, navigateToHere,
    selectStartFromMap, useMyLocationAsStart, selectEndFromMap,
  }
}
