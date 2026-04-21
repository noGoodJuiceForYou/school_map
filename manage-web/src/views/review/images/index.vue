<template>
  <div class="app-container">
    <el-card shadow="never" class="data-card">
      <el-table v-loading="loading" :data="pendingImages">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="图片" align="center" width="120">
          <template #default="scope">
            <el-image
              :src="scope.row.url"
              fit="cover"
              style="width: 80px; height: 80px;"
              @click="previewImage(scope.row.url)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="locationName" label="地点名称" align="center" />
        <el-table-column prop="subLocationName" label="子地点名称" align="center" />
        <el-table-column prop="username" label="上传用户" align="center" />
        <el-table-column prop="time" label="上传时间" align="center" width="180">
          <template #default="scope">
            <span>{{ formatTime(scope.row.time) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleMove(scope.row.id)"
            >
              审核通过
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="图片预览"
      width="80%"
    >
      <el-image
        :src="previewImageUrl"
        fit="contain"
        style="width: 100%; max-height: 70vh;"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listPendingReviewImages, movePendingReviewImage, deletePendingReviewImage } from '@/api/system/pending_review_images'

const loading = ref(false)
const pendingImages = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const previewDialogVisible = ref(false)
const previewImageUrl = ref('')

// 加载待审核图片列表
function loadPendingImages() {
  loading.value = true
  listPendingReviewImages()
    .then(response => {
      console.log('获取待审核图片列表响应:', response)
      pendingImages.value = response
      total.value = response.length
    })
    .catch(error => {
      console.error('获取待审核图片列表失败:', error)
      ElMessage.error('网络错误，获取待审核图片列表失败')
    })
    .finally(() => {
      loading.value = false
    })
}

// 处理审核通过
function handleMove(id) {
  ElMessageBox.confirm('确定要审核通过这张图片吗？', '审核通过', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  })
  .then(() => {
    movePendingReviewImage(id)
      .then(() => {
        ElMessage.success('审核通过成功')
        loadPendingImages()
      })
      .catch(error => {
        console.error('审核通过失败:', error)
        ElMessage.error('网络错误，审核通过失败')
      })
  })
  .catch(() => {
    // 取消审核
  })
}

// 处理删除
function handleDelete(id) {
  ElMessageBox.confirm('确定要删除这张待审核图片吗？', '删除图片', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(() => {
    deletePendingReviewImage(id)
      .then(() => {
        ElMessage.success('删除成功')
        loadPendingImages()
      })
      .catch(error => {
        console.error('删除待审核图片失败:', error)
        ElMessage.error('网络错误，删除失败')
      })
  })
  .catch(() => {
    // 取消删除
  })
}

// 预览图片
function previewImage(imageUrl) {
  previewImageUrl.value = imageUrl
  previewDialogVisible.value = true
}

// 处理页码变化
function handleSizeChange(size) {
  pageSize.value = size
  loadPendingImages()
}

// 处理页数变化
function handleCurrentChange(current) {
  currentPage.value = current
  loadPendingImages()
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 页面加载时获取待审核图片列表
onMounted(() => {
  loadPendingImages()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.data-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>