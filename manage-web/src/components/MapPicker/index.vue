<template>
  <el-dialog title="选择位置" v-model="visible" width="800px" height="600px" append-to-body @close="handleClose">
    <div id="mapContainer" class="map-container"></div>
    <div class="coordinates-info" v-if="lng !== null && lat !== null">
      <p>经度: {{ lng }}</p>
      <p>纬度: {{ lat }}</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection" :disabled="lng === null || lat === null">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currentLng: { type: Number, default: null },
  currentLat: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const lng = ref(null)
const lat = ref(null)
const mapInstance = ref(null)

watch(visible, (val) => {
  if (val) {
    lng.value = props.currentLng
    lat.value = props.currentLat
    setTimeout(() => initMap(), 100)
  }
})

function initMap() {
  const AMap = window.AMap
  if (!AMap) { console.error('高德地图 API 加载失败'); return }

  const defaultCenter = [118.045311, 24.366802]
  const center = lng.value && lat.value ? [lng.value, lat.value] : defaultCenter

  mapInstance.value = new AMap.Map('mapContainer', {
    zoom: 16,
    center,
    viewMode: '3D'
  })

  if (lng.value && lat.value) {
    new AMap.Marker({ position: [lng.value, lat.value], map: mapInstance.value })
  }

  mapInstance.value.on('click', (e) => {
    lng.value = e.lnglat.getLng()
    lat.value = e.lnglat.getLat()
    mapInstance.value.clearMap()
    new AMap.Marker({ position: [lng.value, lat.value], map: mapInstance.value })
  })

  loadExistingMarkers()
}

function loadExistingMarkers() {
  const AMap = window.AMap
  if (!AMap || !mapInstance.value) return

  import('@/api/system/location_info').then(({ getLocationList }) => {
    getLocationList().then(res => {
      const data = res.data || res
      if (data && data.length > 0) {
        data.forEach(item => {
          if (item.longitude && item.latitude) {
            new AMap.Marker({
              position: [item.longitude, item.latitude],
              map: mapInstance.value,
              title: item.name,
              icon: new AMap.Icon({
                size: new AMap.Size(12, 20),
                image: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                imageSize: new AMap.Size(12, 20)
              })
            })
          }
        })
      }
    })
  })
}

function confirmSelection() {
  emit('confirm', { lng: lng.value, lat: lat.value })
  visible.value = false
}

function handleClose() {
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
}
</script>

<style scoped>
.map-container { width: 100%; height: 400px; }
.coordinates-info { margin-top: 10px; }
.coordinates-info p { margin: 5px 0; }
</style>
