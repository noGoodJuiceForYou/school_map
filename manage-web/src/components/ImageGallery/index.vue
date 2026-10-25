<template>
  <el-dialog :title="title" v-model="visible" width="800px" append-to-body @close="handleClose">
    <div class="dialog-toolbar mb20">
      <el-button type="primary" size="small" @click="showUploader = true">
        <el-icon><Plus /></el-icon>添加图片
      </el-button>
      <el-button type="danger" size="small" :disabled="selectedCount === 0" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
    </div>

    <div v-if="showUploader" class="uploader-container mb20">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :multiple="false"
        :limit="1"
        :file-list="fileList"
        accept="image/*"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽图片到此处或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持.jpg .jpeg .png .gif格式，单张不超过5MB</div>
        </template>
      </el-upload>
      <div class="uploader-footer">
        <el-button size="small" @click="cancelUpload">取消</el-button>
        <el-button type="primary" size="small" @click="uploadFiles">提交</el-button>
      </div>
    </div>

    <div v-if="imagesList.length === 0" class="no-images">
      <el-empty description="暂无图片" />
    </div>
    <div v-else class="images-container">
      <div v-for="(image, index) in imagesList" :key="image.id" class="image-wrapper">
        <el-checkbox v-model="selectedImages[index]" class="image-checkbox"></el-checkbox>
        <el-image
          :src="image.url"
          :preview-src-list="imagesList.map(img => img.url)"
          class="image-item"
          fit="contain"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Warning /></el-icon>
              <div class="image-error-text">加载失败</div>
            </div>
          </template>
        </el-image>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">关 闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Warning, Plus, Delete, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadImage as _uploadImage } from '@/api/common.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  entityId: { type: [Number, String], default: null },
  entityName: { type: String, default: '' },
  fetchImagesFn: { type: Function, required: true },
  addImagesFn: { type: Function, required: true },
  deleteImagesFn: { type: Function, required: true },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const title = computed(() => `地点图片 - ${props.entityName}`)

const imagesList = ref([])
const selectedImages = ref([])
const showUploader = ref(false)
const fileList = ref([])
const loading = ref(false)

const selectedCount = computed(() => selectedImages.value.filter(Boolean).length)

// Load images when dialog opens
watch(visible, (val) => {
  if (val) {
    loadImages()
    showUploader.value = false
    fileList.value = []
  }
})

function loadImages() {
  if (!props.entityId) return
  loading.value = true
  props.fetchImagesFn(props.entityId)
    .then(response => {
      const images = response.data || response || []
      imagesList.value = images.map(img => ({ id: img.id, url: img.url }))
      selectedImages.value = Array(imagesList.value.length).fill(false)
      loading.value = false
    })
    .catch(error => {
      imagesList.value = []
      selectedImages.value = []
      loading.value = false
      ElMessage.error('查看图片失败：' + (error.message || '未知错误'))
    })
}

function handleFileChange(file, fileListVal) {
  fileList.value = fileListVal
}

function uploadFiles() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的图片')
    return
  }
  const file = fileList.value[0].raw
  loading.value = true
  _uploadImage(file)
    .then(imageUrl => props.addImagesFn(props.entityId, imageUrl))
    .then(() => loadImages())
    .then(() => {
      fileList.value = []
      showUploader.value = false
      ElMessage.success('图片提交成功')
    })
    .catch(error => {
      ElMessage.error('提交失败：' + (error.message || '未知错误'))
    })
    .finally(() => { loading.value = false })
}

function cancelUpload() {
  showUploader.value = false
  fileList.value = []
}

function handleBatchDelete() {
  const toDelete = imagesList.value.filter((_, index) => selectedImages.value[index])
  if (toDelete.length === 0) {
    ElMessage.warning('请选择要删除的图片')
    return
  }
  const ids = toDelete.map(img => img.id)
  ElMessageBox.confirm(`确定要删除选中的 ${toDelete.length} 张图片吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    loading.value = true
    return props.deleteImagesFn(ids)
  }).then(() => loadImages())
    .then(() => ElMessage.success('删除成功'))
    .catch(error => {
      if (error !== 'cancel') ElMessage.error('删除失败：' + (error.message || '未知错误'))
    })
    .finally(() => { loading.value = false })
}

function handleClose() {
  showUploader.value = false
  fileList.value = []
}
</script>

<style scoped>
.dialog-toolbar { display: flex; gap: 10px; margin-bottom: 20px; }
.mb20 { margin-bottom: 20px; }
.uploader-container { border: 1px dashed #d9d9d9; border-radius: 6px; padding: 20px; background-color: #fafafa; }
.uploader-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
.images-container { display: flex; flex-wrap: wrap; gap: 15px; padding: 10px 0; }
.image-wrapper { position: relative; width: 200px; height: 200px; }
.image-checkbox { position: absolute; top: 5px; left: 5px; z-index: 10; background-color: rgba(255, 255, 255, 0.8); }
.image-item { width: 100%; height: 100%; cursor: pointer; border: 1px solid #eee; border-radius: 4px; object-fit: contain; background-color: #f5f7fa; }
.image-error { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: #f5f7fa; color: #909399; }
.no-images { padding: 40px 0; }
</style>
