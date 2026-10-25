<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="地点名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入地点名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete()">删除</el-button>
      </el-col>
      <right-toolbar></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="地点名称" align="center" prop="name" />
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="详细信息" align="center" prop="information" />
      <el-table-column label="经度" align="center" prop="longitude" width="120" />
      <el-table-column label="纬度" align="center" prop="latitude" width="120" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="mini" type="text" icon="Picture" @click="handleViewImages(scope.row)">查看图片</el-button>
          <el-button size="mini" type="text" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- CRUD 表单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="地点名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入地点名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="详细信息" prop="information">
          <el-input v-model="form.information" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model="form.longitude" placeholder="请输入经度" />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model="form.latitude" placeholder="请输入纬度" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openMapDialog">在地图上选择位置</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片展示 -->
    <ImageGallery
      v-model="imagesDialogVisible"
      :entityId="currentLocationId"
      :entityName="currentLocationName"
      :fetchImagesFn="getImages"
      :addImagesFn="addImages"
      :deleteImagesFn="deleteImages"
    />

    <!-- 地图选择 -->
    <MapPicker
      v-model="mapDialogVisible"
      :currentLng="mapLng"
      :currentLat="mapLat"
      @confirm="onMapConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listInfo, getInfo, delInfo, addInfo, updateInfo, getImages, addImages, deleteImages } from '@/api/system/location_info'
import ImageGallery from '@/components/ImageGallery/index.vue'
import MapPicker from '@/components/MapPicker/index.vue'

defineOptions({ name: 'LocationInfo' })

// --- 表格状态 ---
const loading = ref(false)
const total = ref(0)
const infoList = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)

const queryParams = reactive({ page: 1, pageSize: 10, name: null })
const queryFormRef = ref(null)

// --- CRUD 表单 ---
const open = ref(false)
const title = ref('')
const formRef = ref(null)
const form = reactive({ id: null, name: null, description: null, information: null, longitude: null, latitude: null })
const rules = { name: [{ required: true, message: '请输入地点名称', trigger: 'blur' }] }

// --- 图片 ---
const imagesDialogVisible = ref(false)
const currentLocationId = ref(null)
const currentLocationName = ref('')

// --- 地图 ---
const mapDialogVisible = ref(false)
const mapLng = ref(null)
const mapLat = ref(null)

// ==================== 列表 ====================
function getList() {
  loading.value = true
  listInfo(queryParams).then(data => {
    infoList.value = data.records || []
    total.value = data.total || 0
    loading.value = false
  }).catch(error => {
    infoList.value = []
    total.value = 0
    loading.value = false
    ElMessage.error('查询失败：' + (error.message || '未知错误'))
  })
}

function handleQuery() { queryParams.page = 1; getList() }

function resetQuery() {
  queryFormRef.value?.resetFields()
  queryParams.page = 1
  getList()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// ==================== CRUD ====================
function handleAdd() {
  Object.assign(form, { id: null, name: null, description: null, information: null, longitude: null, latitude: null })
  open.value = true
  title.value = '添加地点信息'
}

function handleUpdate(row) {
  const id = row.id || (Array.isArray(ids.value) ? ids.value[0] : ids.value)
  loading.value = true
  getInfo(id).then(data => {
    Object.assign(form, data || {})
    mapLng.value = form.longitude
    mapLat.value = form.latitude
    open.value = true
    title.value = '修改地点信息'
  }).catch(error => {
    ElMessage.error('获取地点详情失败：' + (error.message || '未知错误'))
  }).finally(() => { loading.value = false })
}

function submitForm() {
  formRef.value?.validate(valid => {
    if (valid) {
      const api = form.id != null ? updateInfo : addInfo
      api(form).then(() => {
        ElMessage.success(form.id != null ? '修改成功' : '新增成功')
        open.value = false
        getList()
      }).catch(error => {
        ElMessage.error('操作失败：' + (error.response?.data?.msg || error.message || '未知错误'))
      })
    }
  })
}

function cancel() { open.value = false; resetForm() }

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, { id: null, name: null, description: null, information: null, longitude: null, latitude: null })
}

function handleDelete(row) {
  const delIds = row?.id ? [row.id] : ids.value
  ElMessageBox.confirm('此操作将一并删除该地点下的子地点及图片，确定要删除吗？').then(() => {
    return delInfo(delIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(error => {
    if (error !== 'cancel') ElMessage.error('删除失败：' + (error.message || '未知错误'))
  })
}

// ==================== 图片 ====================
function handleViewImages(row) {
  currentLocationId.value = row.id
  currentLocationName.value = row.name
  imagesDialogVisible.value = true
}

// ==================== 地图 ====================
function openMapDialog() { mapDialogVisible.value = true }

function onMapConfirm({ lng, lat }) {
  form.longitude = lng
  form.latitude = lat
}

// ==================== Init ====================
onMounted(() => { getList() })
</script>

<style scoped>
.map-container { width: 100%; height: 400px; }
</style>
