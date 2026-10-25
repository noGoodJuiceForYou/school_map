<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="子地点名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入子地点名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="父地点名称" prop="locationName">
        <el-input v-model="queryParams.locationName" placeholder="请输入父地点名称" clearable @keyup.enter="handleQuery" />
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

    <el-table v-loading="loading" :data="locationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="父地点名称" align="center" prop="locationName" />
      <el-table-column label="子地点名称" align="center" prop="name" />
      <el-table-column label="介绍" align="center" prop="introduction" />
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

    <!-- CRUD 表单 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="父地点" prop="locationId">
          <el-select v-model="form.locationId" placeholder="请选择父地点" filterable clearable>
            <el-option v-for="loc in parentLocations" :key="loc.id" :label="loc.name" :value="loc.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="子地点名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入子地点名称" />
        </el-form-item>
        <el-form-item label="介绍" prop="introduction">
          <el-input v-model="form.introduction" type="textarea" placeholder="请输入内容" />
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
      :entityId="currentSubLocationId"
      :entityName="currentSubLocationName"
      :fetchImagesFn="getSubLocationImages"
      :addImagesFn="addImages"
      :deleteImagesFn="deleteImages"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listLocation, getLocation, delLocation, addLocation, updateLocation, getSubLocationImages, addImages, deleteImages } from '@/api/system/sub_location'
import { getLocationList } from '@/api/system/location_info'
import ImageGallery from '@/components/ImageGallery/index.vue'

defineOptions({ name: 'SubLocation' })

// --- 表格 ---
const loading = ref(false)
const total = ref(0)
const locationList = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)

const queryParams = reactive({ page: 1, pageSize: 10, name: null, locationName: null })
const queryFormRef = ref(null)

// --- CRUD ---
const open = ref(false)
const title = ref('')
const formRef = ref(null)
const form = reactive({ id: null, locationId: null, name: null, introduction: null })
const rules = {
  locationId: [{ required: true, message: '请选择父地点', trigger: 'change' }],
  name: [{ required: true, message: '请输入子地点名称', trigger: 'blur' }],
}

// --- 图片 ---
const imagesDialogVisible = ref(false)
const currentSubLocationId = ref(null)
const currentSubLocationName = ref('')

// --- 父地点 ---
const parentLocations = ref([])

// ==================== 列表 ====================
function getList() {
  loading.value = true
  listLocation(queryParams).then(response => {
    locationList.value = response.records
    total.value = response.total
    loading.value = false
  })
}

function handleQuery() { queryParams.page = 1; getList() }

function resetQuery() {
  queryFormRef.value?.resetFields()
  queryParams.page = 1
  queryParams.name = null
  queryParams.locationName = null
  getList()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// ==================== CRUD ====================
function fetchParentLocations() {
  getLocationList().then(data => {
    parentLocations.value = data || []
  }).catch(() => { parentLocations.value = [] })
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, { id: null, locationId: null, name: null, introduction: null })
}

function handleAdd() {
  resetForm()
  fetchParentLocations()
  open.value = true
  title.value = '添加子地点'
}

function handleUpdate(row) {
  resetForm()
  const id = row.id || (Array.isArray(ids.value) ? ids.value[0] : ids.value)
  fetchParentLocations()
  getLocation(id).then(response => {
    const data = response.data || response
    const formData = { ...data }
    if (formData.locationName && !formData.locationId) {
      const loc = parentLocations.value.find(l => l.name === formData.locationName)
      formData.locationId = loc ? loc.id : null
      delete formData.locationName
    }
    if (formData.locationId) delete formData.locationName
    Object.assign(form, formData)
    open.value = true
    title.value = '修改子地点'
  }).catch(error => {
    ElMessage.error('获取子地点详情失败：' + (error.message || '未知错误'))
  })
}

function submitForm() {
  formRef.value?.validate(valid => {
    if (valid) {
      const api = form.id != null ? updateLocation : addLocation
      api(form).then(() => {
        ElMessage.success(form.id != null ? '修改成功' : '新增成功')
        open.value = false
        getList()
      }).catch(error => {
        ElMessage.error('操作失败：' + (error.message || '未知错误'))
      })
    }
  })
}

function cancel() { open.value = false; resetForm() }

function handleDelete(row) {
  const delIds = row?.id ? [row.id] : ids.value
  ElMessageBox.confirm('此操作将删除该子地点及其图片，确定要删除吗？').then(() => {
    return delLocation(delIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(error => {
    if (error !== 'cancel') ElMessage.error('删除失败：' + (error.message || '未知错误'))
  })
}

// ==================== 图片 ====================
function handleViewImages(row) {
  currentSubLocationId.value = row.id
  currentSubLocationName.value = row.name
  imagesDialogVisible.value = true
}

// ==================== Init ====================
onMounted(() => { getList() })
</script>
