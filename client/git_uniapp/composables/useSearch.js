import { ref } from 'vue'
import { apiGetLocationList } from '@/api/apis.js'

/**
 * 地点搜索
 * 接收 mapRef 和 customMarkers
 */
export function useSearch(mapRef, customMarkers) {
  const searchKeyword = ref('')
  const searchResults = ref([])
  const showSearchResults = ref(false)

  function handleSearchInput() {
    if (searchKeyword.value.length > 0) {
      handleSearch()
    } else {
      searchResults.value = []
      showSearchResults.value = false
    }
  }

  function handleSearch() {
    if (!searchKeyword.value.trim()) {
      showSearchResults.value = false
      return
    }

    apiGetLocationList().then(res => {
      if (res.code === 1 && res.data && res.data.length > 0) {
        searchResults.value = res.data.filter(item =>
          item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
        showSearchResults.value = searchResults.value.length > 0
      } else {
        searchResults.value = []
        showSearchResults.value = false
      }
    }).catch(() => {
      searchResults.value = []
      showSearchResults.value = false
    })
  }

  function clearSearch() {
    searchKeyword.value = ''
    searchResults.value = []
    showSearchResults.value = false
  }

  function handleSearchResultClick(result) {
    const AMap = window.AMap
    showSearchResults.value = false
    searchKeyword.value = ''

    if (!result.longitude || !result.latitude || !AMap || !mapRef.value) return

    const position = [result.longitude, result.latitude]
    mapRef.value.setCenter(position)
    mapRef.value.setZoom(18)

    // 清除搜索标记
    const allOverlays = mapRef.value.getAllOverlays()
    allOverlays.forEach(overlay => {
      if (overlay._isSearchMarker) mapRef.value.remove(overlay)
    })

    // 找到匹配的标注
    let targetMarker = null
    for (const marker of customMarkers.value) {
      if (marker.getExtData().id === result.id) { targetMarker = marker; break }
    }

    if (targetMarker) {
      // 恢复之前选中的
      if (handleSearchResultClick._selectedMarker && handleSearchResultClick._selectedMarker.value) {
        handleSearchResultClick._selectedMarker.value.setIcon(new AMap.Icon({
          size: new AMap.Size(12, 20),
          image: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
          imageSize: new AMap.Size(12, 20)
        }))
      }

      targetMarker.setIcon(new AMap.Icon({
        size: new AMap.Size(16, 26),
        image: '//webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
        imageSize: new AMap.Size(16, 26)
      }))

      if (handleSearchResultClick._selectedMarker) {
        handleSearchResultClick._selectedMarker.value = targetMarker
      }

      // 调用 handleMarkerClick
      const event = { lnglat: new AMap.LngLat(result.longitude, result.latitude) }
      if (typeof handleSearchResultClick._handleMarkerClick === 'function') {
        handleSearchResultClick._handleMarkerClick.call(targetMarker, event)
      }
    }
  }

  return {
    searchKeyword, searchResults, showSearchResults,
    handleSearchInput, handleSearch, clearSearch, handleSearchResultClick,
  }
}
