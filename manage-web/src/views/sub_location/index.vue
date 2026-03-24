<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="子地点名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入子地点名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="父地点名称" prop="locationName">
        <el-input
          v-model="queryParams.locationName"
          placeholder="请输入父地点名称"
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

    <el-table v-loading="loading" :data="locationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" /> 
      <el-table-column label="父地点名称" align="center" prop="locationName" /> 
      <el-table-column label="子地点名称" align="center" prop="name" /> 
      <el-table-column label="介绍" align="center" prop="introduction" />
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
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改子地点对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="父地点" prop="locationId">
          <el-select v-model="form.locationId" placeholder="请选择父地点" filterable clearable>
            <el-option
              v-for="location in parentLocations"
              :key="location.id"
              :label="location.name"
              :value="location.id"
            ></el-option>
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

    <!-- 子地点图片展示对话框 -->
    <el-dialog :title="'子地点图片 - ' + currentSubLocationName" v-model="imagesDialogVisible" width="800px" append-to-body>
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
import { listLocation, getLocation, delLocation, addLocation, updateLocation, getSubLocationImages, addImages, deleteImages, uploadImage } from "@/api/system/sub_location"
import { getLocationList } from "@/api/system/location_info"
import { Warning, Plus, Delete, UploadFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"

export default {
  name: "SubLocation",
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
      locationList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: null,
        locationName: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        locationId: [
          { required: true, message: "请选择父地点", trigger: "change" }
        ],
        name: [
          { required: true, message: "请输入子地点名称", trigger: "blur" }
        ],
      },
      // 图片相关
      imagesDialogVisible: false,
      imagesList: [],
      currentSubLocationId: null,
      currentSubLocationName: null, // 当前子地点名称
      selectedImages: [], // 选中的图片索引数组
      showUploader: false, // 是否显示上传区域
      fileList: [], // 上传文件列表
      uploadedImages: [], // 已上传图片列表
      // 父地点相关
      parentLocations: [], // 父地点列表，用于下拉选择
      loadingParentLocations: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询子地点列表 */
    getList() {
      this.loading = true
      listLocation(this.queryParams).then(response => {
        this.locationList = response.records
        this.total = response.total
        this.loading = false
      })
    },
    
    /** 获取父地点列表 */
    getParentLocations() {
      this.loadingParentLocations = true
      return getLocationList().then(data => {
        this.parentLocations = data || []
        this.loadingParentLocations = false
      }).catch(error => {
        this.parentLocations = []
        this.loadingParentLocations = false
        console.error('获取父地点列表失败：', error)
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        locationId: null,
        name: null,
        introduction: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      // 手动重置查询参数
      this.queryParams.page = 1
      this.queryParams.name = null
      this.queryParams.locationName = null
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
      this.reset()
      // 点击新增时获取父地点列表
      this.getParentLocations()
      this.open = true
      this.title = "添加子地点"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      // 点击修改时获取父地点列表
      this.getParentLocations().then(() => {
        const id = row.id || (Array.isArray(this.ids) ? this.ids[0] : this.ids)
        getLocation(id).then(response => {
          // 适配不同的响应格式
          const responseData = response.data || response
          // 创建一个新的formData对象，避免直接修改响应数据
          const formData = { ...responseData }
          
          // 确保formData包含locationId，而不是locationName
          if (formData.locationName && !formData.locationId) {
            // 查找对应的locationId
            const location = this.parentLocations.find(loc => loc.name === formData.locationName)
            formData.locationId = location ? location.id : null
            // 删除locationName，只保留locationId
            delete formData.locationName
          }
          
          // 如果formData已经包含locationId，确保没有locationName
          if (formData.locationId) {
            delete formData.locationName
          }
          
          this.form = formData
          this.open = true
          this.title = "修改子地点"
          console.log('修改表单数据：', this.form)
        }).catch(error => {
          ElMessage.error('获取子地点详情失败：' + (error.message || '未知错误'))
          console.error('getLocation error:', error)
        })
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateLocation(this.form).then(() => {
              ElMessage.success("修改成功")
              this.open = false
              this.getList()
            }).catch(error => {
              ElMessage.error("修改失败：" + (error.message || "未知错误"))
            })
          } else {
            addLocation(this.form).then(() => {
              ElMessage.success("新增成功")
              this.open = false
              this.getList()
            }).catch(error => {
              ElMessage.error("新增失败：" + (error.message || "未知错误"))
            })
          }
        }
      })
    },
    /** 查看图片按钮操作 */
    handleViewImages(row) {
      this.currentSubLocationId = row.id
      this.currentSubLocationName = row.name // 保存子地点名称
      this.loading = true
      getSubLocationImages(row.id).then(response => {
        // 直接使用后端返回的包含id和url的对象数组
        const images = response.data || response || []
        this.imagesList = images.map(img => ({
          id: img.id, // 使用后端返回的真实id
          url: img.url
        }))
        this.selectedImages = Array(this.imagesList.length).fill(false)
        this.showUploader = false
        this.fileList = []
        this.uploadedImages = []
        this.imagesDialogVisible = true
        this.loading = false
      }).catch(error => {
        this.imagesList = []
        this.selectedImages = []
        this.imagesDialogVisible = true
        ElMessage.error('查看图片失败：' + (error.message || '未知错误'))
        this.loading = false
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      ElMessageBox.confirm('此操作将删除该子地点及其图片，确定要删除吗？').then(() => {
        return delLocation(ids)
      }).then(() => {
        this.getList()
        ElMessage.success("删除成功")
      }).catch(error => {
        if (error !== 'cancel') {
          ElMessage.error('删除失败：' + (error.message || '未知错误'))
        }
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
        return addImages(this.currentSubLocationId, imageUrl)
      }).then(() => {
        // 保存成功后刷新图片列表
        return getSubLocationImages(this.currentSubLocationId)
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
        return getSubLocationImages(this.currentSubLocationId)
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
    }
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
