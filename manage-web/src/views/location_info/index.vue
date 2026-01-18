<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="地点名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入地点名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="地点名称" align="center" prop="name" />
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="详细信息" align="center" prop="information" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="Picture"
            @click="handleViewImages(scope.row)"
          >查看图片</el-button>
          <el-button
            size="mini"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"

          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"

          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改地点信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="地点名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入地点名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="详细信息" prop="information">
          <el-input v-model="form.information" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 地点图片展示对话框 -->
    <el-dialog :title="'地点图片 - ' + currentLocationName" v-model="imagesDialogVisible" width="800px" append-to-body>
      <!-- 工具栏 -->
      <div class="dialog-toolbar mb20">
        <el-button type="primary" size="small" @click="handleAddImages">
          <el-icon><Plus /></el-icon>添加图片
        </el-button>
        <el-button type="danger" size="small" :disabled="selectedImages.length === 0" @click="handleBatchDeleteImages">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>
      
      <!-- 图片上传区域 -->
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
            <div class="el-upload__tip">
              支持.jpg .jpeg .png .gif格式，单张不超过5MB
            </div>
          </template>
        </el-upload>
        <div class="uploader-footer">
          <el-button size="small" @click="cancelUpload">取消</el-button>
          <el-button type="primary" size="small" @click="uploadFiles">提交</el-button>
        </div>
      </div>
      
      <!-- 图片展示区域 -->
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
          <el-button @click="imagesDialogVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
    
    
  </div>
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo, getImages, addImages, deleteImages, uploadImage } from "@/api/system/location_info"
import { Warning, Plus, Delete, UploadFilled } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from "element-plus"

export default {
  name: "LocationInfo",
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
      // 【请填写功能名称】表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "请输入地点名称", trigger: "blur" }
        ],
      },
      // 图片相关
      imagesDialogVisible: false,
      imagesList: [], // 图片列表，每个元素包含id和url
      currentLocationId: null,
      currentLocationName: null, // 当前地点名称
      initialImages: [], // 初始图片列表，用于比较哪些图片被删除
      // 图片上传相关
      showUploader: false,
      fileList: [],
      selectedImages: [], // 选中的图片索引数组
      uploadedImages: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true
      listInfo(this.queryParams).then(data => {
        this.infoList = data.records || []
        this.total = data.total || 0
        this.loading = false
      }).catch(error => {
        this.infoList = []
        this.total = 0
        this.loading = false
        ElMessage.error('查询失败：' + (error.message || '未知错误'))
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      // 先调用resetFields重置表单状态
      if (this.$refs["form"] && typeof this.$refs["form"].resetFields === "function") {
        this.$refs["form"].resetFields()
      }
      // 再重置表单数据
      this.form = {
        id: null,
        name: null,
        description: null,
        information: null
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      // 检查是否存在resetForm方法
      if (this.$refs["queryForm"] && typeof this.$refs["queryForm"].resetFields === "function") {
        this.$refs["queryForm"].resetFields()
      }
      // 手动重置分页参数
      this.queryParams.page = 1
      this.getList()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      console.log('handleAdd called');
      // 简化新增功能，直接显示弹窗
      this.form = {
        id: null,
        name: null,
        description: null,
        information: null
      }
      console.log('setting open to true');
      this.open = true
      this.title = "添加地点信息"
      console.log('open is now:', this.open);
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      console.log('handleUpdate called with row:', row);
      // 确保只传递单个ID
      const id = row.id || (Array.isArray(this.ids) ? this.ids[0] : this.ids)
      console.log('getting info for id:', id);
      
      // 先显示加载状态
      this.loading = true
      getInfo(id).then(response => {
        console.log('got info data:', response);
        // 适配不同的响应格式
        const data = response.data || response
        this.form = data || {}
        this.open = true
        this.title = "修改地点信息"
        console.log('open is now:', this.open);
        console.log('form data:', this.form);
      }).catch(error => {
        ElMessage.error('获取地点详情失败：' + (error.message || '未知错误'))
        console.error('getInfo error:', error);
      }).finally(() => {
        this.loading = false
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateInfo(this.form).then(() => {
              ElMessage.success("修改成功")
              this.open = false
              this.getList()
            }).catch(error => {
              ElMessage.error("修改失败：" + (error.response?.data?.msg || error.message || "未知错误"))
            })
          } else {
            addInfo(this.form).then(() => {
              ElMessage.success("新增成功")
              this.open = false
              this.getList()
            }).catch(error => {
              ElMessage.error("新增失败：" + (error.response?.data?.msg || error.message || "未知错误"))
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      console.log('handleDelete called with row:', row);
      // 确保传递的是数组
      const ids = row.id ? [row.id] : this.ids
      console.log('deleting with ids:', ids);
      ElMessageBox.confirm('此操作将一并删除该地点下的子地点及图片，确定要删除吗？').then(() => {
        return delInfo(ids)
      }).then(() => {
        console.log('delete successful, refreshing list');
        this.getList()
        ElMessage.success("删除成功")
      }).catch(error => {
        console.log('delete failed:', error);
        if (error !== 'cancel') {
          ElMessage.error('删除失败：' + (error.message || '未知错误'))
        }
      })
    },
    /** 图片加载错误处理 */
    handleImageError(index) {
      // 图片加载失败处理
    },
    /** 查看图片按钮操作 */
    handleViewImages(row) {
      this.currentLocationId = row.id
      this.currentLocationName = row.name // 保存地点名称
      this.loading = true
      getImages(row.id).then(response => {
        // 直接使用后端返回的包含id和url的对象数组
        const images = response.data || response || []
        this.imagesList = images.map(img => ({
          id: img.id, // 使用后端返回的真实id
          url: img.url
        }))
        this.initialImages = [...this.imagesList] // 保存初始图片列表
        this.selectedImages = Array(this.imagesList.length).fill(false)
        this.showUploader = false
        this.fileList = []
        this.uploadedImages = []
        this.imagesDialogVisible = true
        this.loading = false
      }).catch(error => {
        this.imagesList = []
        this.initialImages = []
        this.selectedImages = []
        this.imagesDialogVisible = true
        ElMessage.error('查看图片失败：' + (error.message || '未知错误'))
        this.loading = false
      })
    },
    
    /** 添加图片按钮操作 */
    handleAddImages() {
      this.showUploader = true
    },
    
    /** 文件选择处理 */
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    
    /** 上传文件到OSS并保存到数据库 */
    uploadFiles() {
      if (this.fileList.length === 0) {
        ElMessage.warning('请选择要上传的图片')
        return
      }
      
      const file = this.fileList[0].raw
      
      this.loading = true
      uploadImage(file).then(imageUrl => {
        // 上传成功后直接保存到数据库
        return addImages(this.currentLocationId, imageUrl)
      }).then(() => {
        // 保存成功后刷新图片列表
        return getImages(this.currentLocationId)
      }).then(data => {
        this.imagesList = data || []
        this.selectedImages = Array(this.imagesList.length).fill(false)
        this.fileList = []
        this.showUploader = false
        this.uploadedImages = []
        ElMessage.success('图片提交成功')
      }).catch(error => {
        ElMessage.error('提交失败：' + (error.message || '未知错误'))
      }).finally(() => {
        this.loading = false
      })
    },
    
    /** 取消上传 */
    cancelUpload() {
      this.showUploader = false
      this.fileList = []
    },
    
    /** 批量删除图片 */
    handleBatchDeleteImages() {
      const selectedImages = this.imagesList.filter((_, index) => this.selectedImages[index])
      
      if (selectedImages.length === 0) {
        ElMessage.warning('请选择要删除的图片')
        return
      }
      
      const ids = selectedImages.map(image => image.id)
      
      ElMessageBox.confirm(`确定要删除选中的 ${selectedImages.length} 张图片吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        return deleteImages(ids)
      }).then(() => {
        // 删除成功后刷新图片列表
        return getImages(this.currentLocationId)
      }).then(data => {
        this.imagesList = data || []
        this.selectedImages = Array(this.imagesList.length).fill(false)
        ElMessage.success('删除成功')
      }).catch(error => {
        if (error !== 'cancel') {
          ElMessage.error('删除失败：' + (error.message || '未知错误'))
        }
      }).finally(() => {
        this.loading = false
      })
    },
    
    /** 关闭图片对话框 */
    handleSaveImages() {
      this.imagesDialogVisible = false
      ElMessage.success('操作完成')
    },
    
  }
}
</script>

<style scoped>
.dialog-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.mb20 {
  margin-bottom: 20px;
}

.uploader-container {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  padding: 20px;
  background-color: #fafafa;
}

.uploader-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px 0;
}

.image-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
}

.image-checkbox {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
}

.image-item {
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: 1px solid #eee;
  border-radius: 4px;
  object-fit: contain;
  background-color: #f5f7fa;
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.no-images {
  text-align: center;
  padding: 50px 0;
}
</style>
