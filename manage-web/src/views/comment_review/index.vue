<template>
  <div class="app-container">
  
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
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
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

<script>
import { listReview, deleteReview } from "@/api/system/comment_review"
import { ElMessageBox, ElMessage } from "element-plus"

export default {
  name: "CommentReview",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 评论审核列表
      reviewList: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        content: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询评论审核列表 */
    getList() {
      this.loading = true
      listReview(this.queryParams).then(data => {
        this.reviewList = data.records || []
        this.total = data.total || 0
        this.loading = false
      }).catch(error => {
        this.reviewList = []
        this.total = 0
        this.loading = false
        ElMessage.error('查询失败：' + (error.message || '未知错误'))
      })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      // 确保传递的是数组
      const ids = row.id ? [row.id] : this.ids
      ElMessageBox.confirm('确定要删除这条评论吗？').then(() => {
        return deleteReview(ids)
      }).then(() => {
        this.getList()
        ElMessage.success("删除成功")
      }).catch(error => {
        if (error !== 'cancel') {
          ElMessage.error('删除失败：' + (error.message || '未知错误'))
        }
      })
    }
  }
}
</script>

<style scoped>
</style>