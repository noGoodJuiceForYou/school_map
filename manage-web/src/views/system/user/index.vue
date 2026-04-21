<template>
  <div class="app-container">

    <el-card shadow="never" class="data-card">
      <el-table v-loading="loading" :data="userList">
        <el-table-column prop="id" label="用户ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" align="center" />
        <el-table-column label="身份" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.identity === 1 ? 'success' : 'info'">
              {{ scope.row.identity === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              size="mini"
              type="text"
              @click="handleUpdateIdentity(scope.row)"
              :disabled="scope.row.identity === 1"
            >
              {{ scope.row.identity === 1 ? '已为管理员' : '设为管理员' }}
            </el-button>
            <el-button
              size="mini"
              type="text"
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

    <!-- 身份更新对话框 -->
    <el-dialog
      v-model="updateDialogVisible"
      title="更新用户身份"
      width="400px"
    >
      <el-form :model="updateForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="updateForm.username" disabled />
        </el-form-item>
        <el-form-item label="当前身份">
          <el-tag :type="updateForm.identity === 1 ? 'success' : 'info'">
            {{ updateForm.identity === 1 ? '管理员' : '普通用户' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新身份">
          <el-radio-group v-model="updateForm.newIdentity">
            <el-radio label="0">普通用户</el-radio>
            <el-radio label="1">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpdateIdentity">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import { listUsers, deleteUser, updateUserIdentity } from '@/api/system/user'

const loading = ref(false)
const userList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const updateDialogVisible = ref(false)
const updateForm = ref({
  id: '',
  username: '',
  identity: '',
  newIdentity: ''
})

// 加载用户列表
function loadUserList() {
  loading.value = true
  listUsers()
    .then(response => {
      // 由于响应拦截器只返回了data部分，所以直接使用response作为用户列表
      userList.value = response
      total.value = response.length
    })
    .catch(error => {
      console.error('获取用户列表失败:', error)
      ElMessage.error('网络错误，获取用户列表失败')
    })
    .finally(() => {
      loading.value = false
    })
}

// 处理删除用户
function handleDelete(id) {
  ElMessageBox.confirm('确定要删除该用户吗？', '删除用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(() => {
    deleteUser(id)
      .then(() => {
        // 由于响应拦截器只返回了data部分，删除成功时会返回undefined
        ElMessage.success('删除成功')
        loadUserList()
      })
      .catch(error => {
        console.error('删除用户失败:', error)
        ElMessage.error('网络错误，删除失败')
      })
  })
  .catch(() => {
    // 取消删除
  })
}

// 处理更新用户身份
function handleUpdateIdentity(user) {
  updateForm.value = {
    id: user.id,
    username: user.username,
    identity: user.identity,
    newIdentity: user.identity === 1 ? 0 : 1
  }
  updateDialogVisible.value = true
}

// 提交更新用户身份
function submitUpdateIdentity() {
  updateUserIdentity(updateForm.value.id, updateForm.value.newIdentity)
    .then(() => {
      // 由于响应拦截器只返回了data部分，更新成功时会返回undefined
      ElMessage.success('更新成功')
      updateDialogVisible.value = false
      loadUserList()
    })
    .catch(error => {
      console.error('更新用户身份失败:', error)
      ElMessage.error('网络错误，更新失败')
    })
}

// 处理新增用户
function handleAdd() {
  // 这里可以添加新增用户的逻辑
  ElMessage.info('新增用户功能暂未实现')
}

// 处理页码变化
function handleSizeChange(size) {
  pageSize.value = size
  loadUserList()
}

// 处理页数变化
function handleCurrentChange(current) {
  currentPage.value = current
  loadUserList()
}

// 页面加载时获取用户列表
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
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