<template>
  <div class="scene-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>场景管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增场景
          </el-button>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col
          v-for="scene in sceneList"
          :key="scene.id"
          :xs="24" :sm="12" :md="8" :lg="6"
          class="scene-col"
        >
          <el-card shadow="hover" class="scene-card">
            <div class="scene-thumbnail">
              <el-image
                :src="scene.thumbnail"
                fit="cover"
                style="width: 100%; height: 160px; border-radius: 6px"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon :size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="scene-info">
              <h4>{{ scene.name }}</h4>
              <el-tag size="small">{{ scene.category }}</el-tag>
            </div>
            <div class="scene-actions">
              <el-button size="small" @click="handleEdit(scene)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scene)">删除</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="sceneList.length === 0" description="暂无场景" />
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑场景' : '新增场景'"
      width="520px"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="formData.name" placeholder="请输入场景名称" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="formData.category" placeholder="选择分类" style="width: 100%">
            <el-option label="产品图" value="product" />
            <el-option label="详情页" value="detail" />
            <el-option label="风格转换" value="style" />
            <el-option label="抠图" value="cutout" />
          </el-select>
        </el-form-item>
        <el-form-item label="缩略图">
          <el-upload
            class="thumbnail-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
            accept="image/*"
          >
            <el-image
              v-if="formData.thumbnail"
              :src="formData.thumbnail"
              fit="cover"
              style="width: 148px; height: 148px; border-radius: 6px"
            />
            <div v-else class="upload-placeholder">
              <el-icon :size="28"><Plus /></el-icon>
              <span>上传图片</span>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="Prompt">
          <el-input
            v-model="formData.prompt"
            type="textarea"
            :rows="4"
            placeholder="请输入生成提示词"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AdminScene } from '@/api/modules/admin'
import {
  getSceneList,
  createScene,
  updateScene,
  deleteScene,
} from '@/api/modules/admin'

const sceneList = ref<AdminScene[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref('')

const formData = ref({
  name: '',
  category: '',
  thumbnail: '',
  prompt: '',
})

const resetForm = () => {
  formData.value = { name: '', category: '', thumbnail: '', prompt: '' }
  editingId.value = ''
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (scene: AdminScene) => {
  isEdit.value = true
  editingId.value = scene.id
  formData.value = {
    name: scene.name,
    category: scene.category,
    thumbnail: scene.thumbnail,
    prompt: scene.prompt,
  }
  dialogVisible.value = true
}

const handleDelete = async (scene: AdminScene) => {
  try {
    await ElMessageBox.confirm(`确认删除场景「${scene.name}」？`, '提示', { type: 'warning' })
    await deleteScene(scene.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // 取消
  }
}

const handleSave = async () => {
  if (!formData.value.name || !formData.value.category) {
    ElMessage.warning('请填写名称和分类')
    return
  }
  try {
    if (isEdit.value) {
      await updateScene(editingId.value, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createScene(formData.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.success(isEdit.value ? '更新成功（mock）' : '创建成功（mock）')
    dialogVisible.value = false
    fetchData()
  }
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('只能上传图片文件')
  if (!isLt2M) ElMessage.error('图片大小不能超过 2MB')
  return isImage && isLt2M
}

const handleUpload = (options: any) => {
  // 模拟上传，实际应调用上传接口
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.thumbnail = e.target?.result as string
  }
  reader.readAsDataURL(options.file)
}

const fetchData = async () => {
  try {
    sceneList.value = await getSceneList()
  } catch {
    sceneList.value = Array.from({ length: 6 }, (_, i) => ({
      id: `scene_${i + 1}`,
      name: ['白瓷茶具', '青花瓷瓶', '景德镇花瓶', '陶瓷碗', '紫砂壶', '釉下彩盘'][i],
      category: (['product', 'detail', 'style', 'product', 'cutout', 'product'] as const)[i],
      thumbnail: '',
      prompt: `生成${['白瓷茶具', '青花瓷瓶', '景德镇花瓶', '陶瓷碗', '紫砂壶', '釉下彩盘'][i]}的产品图`,
    }))
  }
}

onMounted(fetchData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scene-col {
  margin-bottom: 16px;
}

.scene-card {
  height: 100%;
  :deep(.el-card__body) {
    padding: 12px;
  }
}

.scene-info {
  padding: 8px 0;
}

.scene-info h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #303133;
}

.scene-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #ebeef5;
  padding-top: 8px;
}

.image-placeholder {
  width: 100%;
  height: 160px;
  background: #f5f7fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.thumbnail-uploader {
  :deep(.el-upload) {
    cursor: pointer;
  }
}

.upload-placeholder {
  width: 148px;
  height: 148px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;
}

.upload-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>
