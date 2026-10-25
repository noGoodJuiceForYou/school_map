<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete()">删除</el-button>
      </el-col>
      <right-toolbar></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reviewList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户" align="center" prop="username" />
      <el-table-column label="评论内容" align="center" prop="content" />
      <el-table-column label="时间" align="center" prop="time" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listReview, deleteReview } from '@/api/system/comment_review'

defineOptions({ name: 'CommentReview' })

const loading = ref(true)
const total = ref(0)
const reviewList = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

const queryParams = reactive({ page: 1, pageSize: 10, content: null })

function getList() {
  loading.value = true
  listReview(queryParams).then(data => {
    reviewList.value = data.records || []
    total.value = data.total || 0
    loading.value = false
  }).catch(error => {
    reviewList.value = []
    total.value = 0
    loading.value = false
    ElMessage.error('查询失败：' + (error.message || '未知错误'))
  })
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleDelete(row) {
  const delIds = row?.id ? [row.id] : ids.value
  ElMessageBox.confirm('确定要删除这条评论吗？').then(() => {
    return deleteReview(delIds)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(error => {
    if (error !== 'cancel') ElMessage.error('删除失败：' + (error.message || '未知错误'))
  })
}

onMounted(() => { getList() })
</script>
