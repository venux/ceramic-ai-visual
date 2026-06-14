<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  maxCount?: number
  modelValue: File[]
}>()

const emit = defineEmits<{
  'update:modelValue': [files: File[]]
}>()

const previewUrls = ref<string[]>([])

function handleUpload(file: File) {
  if (props.modelValue.length >= (props.maxCount ?? 3)) {
    ElMessage.warning(`最多上传 ${props.maxCount ?? 3} 张图片`)
    return false
  }

  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 10MB')
    return false
  }

  compressImage(file).then((compressed) => {
    const files = [...props.modelValue, compressed]
    emit('update:modelValue', files)
    previewUrls.value.push(URL.createObjectURL(compressed))
  })

  return false
}

async function compressImage(file: File): Promise<File> {
  if (file.size <= 2 * 1024 * 1024) return file

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      const maxW = 2048
      const maxH = 2048
      let { width, height } = img

      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.85,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

function removeImage(index: number) {
  URL.revokeObjectURL(previewUrls.value[index])
  const files = props.modelValue.filter((_, i) => i !== index)
  previewUrls.value = previewUrls.value.filter((_, i) => i !== index)
  emit('update:modelValue', files)
}
</script>

<template>
  <div class="image-uploader">
    <div class="preview-list">
      <div v-for="(url, index) in previewUrls" :key="index" class="preview-item">
        <el-image :src="url" fit="cover" class="preview-img" />
        <el-button
          :icon="Delete"
          circle
          size="small"
          class="delete-btn"
          @click="removeImage(index)"
        />
      </div>
    </div>

    <el-upload
      v-if="modelValue.length < (maxCount ?? 3)"
      :before-upload="handleUpload"
      :show-file-list="false"
      accept="image/*"
      drag
      class="upload-area"
    >
      <div class="upload-content">
        <el-icon :size="40" class="upload-icon"><Plus /></el-icon>
        <p>拖拽或点击上传</p>
        <p class="upload-hint">支持 JPG/PNG，单张最大 10MB</p>
      </div>
    </el-upload>
  </div>
</template>

<style scoped>
.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.preview-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.preview-item {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
}
.preview-img {
  width: 100%;
  height: 100%;
}
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
.upload-area {
  width: 160px;
  height: 160px;
}
.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 2px dashed #dcdfe6;
  transition: border-color 0.3s;
}
.upload-area :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}
.upload-content {
  text-align: center;
}
.upload-icon {
  color: #c0c4cc;
}
.upload-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}
</style>
