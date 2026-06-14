<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createDetailTask, getDetailProgress, createDetailProgressSSE } from '@/api/modules/detail'
import type { DetailTaskParams, DetailTask } from '@/api/modules/detail'
import DetailPreview from '@/components/DetailPreview.vue'

const userStore = useUserStore()

// ---- 表单数据 ----
const productName = ref('')
const sellingPointsInput = ref('')
const productImages = ref<{ url: string; name: string }[]>([])
const selectedTemplate = ref<'modern' | 'chinese' | 'japanese' | 'european'>('modern')

// ---- 生成状态 ----
const generating = ref(false)
const progress = ref(0)
const statusText = ref('')
const resultTask = ref<DetailTask | null>(null)
let sseConnection: EventSource | null = null

// ---- 模板配置 ----
const templates = [
  {
    key: 'modern' as const,
    name: '现代简约',
    desc: '大留白、无衬线字体、极简排版',
    color: '#409eff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    key: 'chinese' as const,
    name: '中式古典',
    desc: '水墨纹理、竖排文字、传统纹样',
    color: '#c0392b',
    gradient: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
  },
  {
    key: 'japanese' as const,
    name: '日式侘寂',
    desc: '枯山水元素、素色、留白美学',
    color: '#7f8c8d',
    gradient: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
  },
  {
    key: 'european' as const,
    name: '欧式奢华',
    desc: '金属质感、衬线字体、华丽装饰',
    color: '#d4af37',
    gradient: 'linear-gradient(135deg, #d4af37 0%, #f1c40f 100%)',
  },
]

// ---- 卖点解析 ----
const sellingPoints = computed(() =>
  sellingPointsInput.value
    .split(/[,，、\n]+/)
    .map(s => s.trim())
    .filter(Boolean),
)

// ---- 模拟图片（实际应由 ImageUploader 组件提供） ----
const mockImages = ref([
  { url: '/ceramic/uploads/original/demo1.jpg', name: '青花瓷茶杯-正面' },
  { url: '/ceramic/uploads/original/demo2.jpg', name: '青花瓷茶杯-侧面' },
  { url: '/ceramic/uploads/original/demo3.jpg', name: '青花瓷茶杯-细节' },
])

const availableImages = computed(() => {
  return productImages.value.length > 0 ? productImages.value : mockImages.value
})

const selectedProductImage = ref('')

// ---- 校验 ----
const canGenerate = computed(() => {
  return productName.value.trim() !== ''
    && sellingPoints.value.length > 0
    && selectedProductImage.value !== ''
    && !generating.value
})

// ---- 生成 ----
async function handleGenerate() {
  if (!canGenerate.value) {
    ElMessage.warning('请填写完整的产品信息')
    return
  }

  generating.value = true
  progress.value = 0
  statusText.value = '正在提交任务...'
  resultTask.value = null

  const params: DetailTaskParams = {
    productName: productName.value.trim(),
    sellingPoints: sellingPoints.value,
    productImage: selectedProductImage.value,
    template: selectedTemplate.value,
  }

  try {
    const task = await createDetailTask(params)
    progress.value = 5
    statusText.value = '任务已提交，正在生成...'

    // 尝试 SSE 监听进度
    sseConnection = createDetailProgressSSE(
      task.id,
      (data) => {
        progress.value = data.progress || 0
        if (data.status === 'processing') {
          statusText.value = `生成中... ${progress.value}%`
        }
        if (data.status === 'completed') {
          progress.value = 100
          statusText.value = '生成完成'
          resultTask.value = data
          generating.value = false
          userStore.fetchUser()
          ElMessage.success('详情页生成成功！')
        }
        if (data.status === 'failed') {
          statusText.value = '生成失败'
          generating.value = false
          ElMessage.error(data.htmlContent || '详情页生成失败，请重试')
        }
      },
      () => {
        // SSE 连接失败时降级为轮询
        pollProgress(task.id)
      },
    )
  } catch (err: any) {
    generating.value = false
    progress.value = 0
    statusText.value = ''
    ElMessage.error(err?.message || '创建任务失败')
  }
}

// ---- 轮询降级 ----
let pollTimer: ReturnType<typeof setInterval> | null = null

function pollProgress(taskId: string) {
  pollTimer = setInterval(async () => {
    try {
      const data = await getDetailProgress(taskId)
      progress.value = data.progress || 0

      if (data.status === 'processing') {
        statusText.value = `生成中... ${progress.value}%`
      }
      if (data.status === 'completed') {
        clearInterval(pollTimer!)
        pollTimer = null
        progress.value = 100
        statusText.value = '生成完成'
        resultTask.value = data
        generating.value = false
        userStore.fetchUser()
        ElMessage.success('详情页生成成功！')
      }
      if (data.status === 'failed') {
        clearInterval(pollTimer!)
        pollTimer = null
        statusText.value = '生成失败'
        generating.value = false
        ElMessage.error('详情页生成失败，请重试')
      }
    } catch {
      // 网络异常时继续轮询
    }
  }, 2000)
}

// ---- 下载 ----
function handleDownload() {
  if (!resultTask.value?.htmlContent) return

  const blob = new Blob([resultTask.value.htmlContent], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${productName.value || '详情页'}_${selectedTemplate.value}.html`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('下载完成')
}

// ---- 清理 ----
onBeforeUnmount(() => {
  sseConnection?.close()
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="detail-page">
    <!-- 页面标题 -->
    <div class="page-header card">
      <h2 class="page-title">详情页生成</h2>
      <p class="page-desc">填写产品信息，选择模板风格，AI 一键生成电商详情页长图</p>
    </div>

    <!-- 主区域：左右布局 -->
    <div class="main-area">
      <!-- 左侧：产品信息表单 -->
      <div class="left-panel card">
        <h3 class="panel-title">
          <el-icon><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/><path d="M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-44.2 0-80 35.8-80 80v8h208v-8c0-44.2-35.8-80-80-80z"/></svg></el-icon>
          产品信息
        </h3>

        <el-form label-position="top" class="product-form">
          <!-- 产品名称 -->
          <el-form-item label="产品名称" required>
            <el-input
              v-model="productName"
              placeholder="例如：青花瓷功夫茶杯套装"
              maxlength="50"
              show-word-limit
              clearable
            />
          </el-form-item>

          <!-- 卖点关键词 -->
          <el-form-item label="卖点关键词" required>
            <el-input
              v-model="sellingPointsInput"
              type="textarea"
              :rows="3"
              placeholder="输入产品卖点，用逗号或换行分隔&#10;例如：手工绘制，高温烧制，釉下彩工艺"
              maxlength="200"
              show-word-limit
            />
            <div v-if="sellingPoints.length > 0" class="selling-point-tags">
              <el-tag
                v-for="(point, index) in sellingPoints"
                :key="index"
                type="info"
                size="small"
                effect="plain"
              >
                {{ point }}
              </el-tag>
            </div>
          </el-form-item>

          <!-- 选择产品图 -->
          <el-form-item label="选择产品图" required>
            <div class="image-selector">
              <div
                v-for="img in availableImages"
                :key="img.url"
                class="image-option"
                :class="{ active: selectedProductImage === img.url }"
                @click="selectedProductImage = img.url"
              >
                <div class="image-thumb">
                  <el-image
                    :src="img.url"
                    fit="cover"
                    style="width: 100%; height: 100%"
                  >
                    <template #error>
                      <div class="image-placeholder">
                        <el-icon :size="24"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zM400 688H192V576l136-170.1 117.3 146.6 56.6-70.8L640 576v112H400z"/></svg></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div v-if="selectedProductImage === img.url" class="image-check">
                    <el-icon><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M912 192H544l-64-128H128c-35.3 0-64 28.7-64 64v576c0 35.3 28.7 64 64 64h784c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64zM484 658l-80-80 29.6-29.6L484 598.7l158.4-158.4 29.6 29.6L484 658z"/></svg></el-icon>
                  </div>
                </div>
                <span class="image-name ellipsis">{{ img.name }}</span>
              </div>
            </div>
            <p v-if="availableImages.length === 0" class="no-image-tip">
              暂无可选图片，请先在「产品图生成」页面生成产品图
            </p>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：模板选择 -->
      <div class="right-panel card">
        <h3 class="panel-title">
          <el-icon><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M912 302.3L784 376V224c0-35.3-28.7-64-64-64H304c-35.3 0-64 28.7-64 64v152L112 302.3c-17.1-10.7-27.3-29.8-27.3-50.2V112c0-17.7 14.3-32 32-32h784c17.7 0 32 14.3 32 32v140.1c0 20.4-10.2 39.5-28.7 50.2zM680 224H344v-24h336v24zm200 448H144c-17.7 0-32 14.3-32 32v140.1c0 20.4 10.2 39.5 27.3 50.2L312 970.3V816h400v154.3l128-73.7c17.1-10.7 27.3-29.8 27.3-50.2V704c0-17.7-14.3-32-32-32zM544 816H480v-24h64v24z"/></svg></el-icon>
          选择模板风格
        </h3>
        <p class="panel-desc">不同风格会影响详情页的整体视觉效果</p>

        <div class="template-grid">
          <div
            v-for="tpl in templates"
            :key="tpl.key"
            class="template-card"
            :class="{ active: selectedTemplate === tpl.key }"
            @click="selectedTemplate = tpl.key"
          >
            <div class="template-preview" :style="{ background: tpl.gradient }">
              <div class="template-icon">{{ tpl.name[0] }}</div>
            </div>
            <div class="template-info">
              <span class="template-name">{{ tpl.name }}</span>
              <span class="template-desc">{{ tpl.desc }}</span>
            </div>
            <div v-if="selectedTemplate === tpl.key" class="template-check">
              <el-icon :size="20" color="#fff"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0.9L308.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3h39.6c6.5 0 10.3 7.4 6.5 12.7z"/></svg></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar card">
      <div class="action-left">
        <span class="cost-label">消耗额度：<strong>5</strong></span>
      </div>
      <div class="action-center">
        <el-button
          type="primary"
          size="large"
          :disabled="!canGenerate"
          :loading="generating"
          @click="handleGenerate"
        >
          <el-icon v-if="!generating"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm186.5 232.8L617.3 592.5c-2.8 5.3-10 8.5-16.5 8.5H423.6c-4.7 0-8.7-3.4-9.5-8.1L365.5 304.2c-1.1-6.5 4.2-12.2 10.8-12.2h25.3c4.2 0 7.9 2.6 9.3 6.6l39 117.1h147.5c6.2 0 11.3 5.2 11 11.4l-6 102.8c-.3 5.6 4.2 10.3 9.8 10.3h2.8c4.8 0 8.9-3.4 9.6-8.2l12-78.3 110.5-1.5c6.7-.1 12.1-5.7 12-12.4-.1-3.4-1.6-6.6-4.1-9l-85.4-80.2z"/></svg></el-icon>
          {{ generating ? '生成中...' : '开始生成详情页' }}
        </el-button>
      </div>
      <div class="action-right">
        <el-button
          v-if="resultTask?.htmlContent"
          type="success"
          size="large"
          @click="handleDownload"
        >
          <el-icon><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"/></svg></el-icon>
          下载详情页
        </el-button>
      </div>
    </div>

    <!-- 进度条 -->
    <div v-if="generating" class="progress-section card">
      <el-progress
        :percentage="Math.min(Math.round(progress), 100)"
        :stroke-width="14"
        :status="progress >= 100 ? 'success' : undefined"
        striped
        striped-flow
      />
      <p class="progress-text">{{ statusText || '正在处理中，请稍候...' }}</p>
    </div>

    <!-- 结果预览 -->
    <div v-if="resultTask?.htmlContent" class="result-section card">
      <div class="result-header">
        <h3>生成结果</h3>
        <div class="result-actions">
          <el-button type="primary" @click="handleDownload">
            <el-icon><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"/></svg></el-icon>
            下载 HTML 文件
          </el-button>
          <el-button @click="resultTask = null">收起</el-button>
        </div>
      </div>
      <DetailPreview :html-content="resultTask.htmlContent" />
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 6px;
}

.page-desc {
  font-size: 14px;
  color: #909399;
}

/* 主区域 */
.main-area {
  display: grid;
  grid-template-columns: 5fr 5fr;
  gap: 20px;
  margin-bottom: 20px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.panel-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 20px;
}

/* 左侧表单 */
.product-form {
  margin-top: 20px;
}

.selling-point-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

/* 图片选择器 */
.image-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-option {
  width: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.image-option:hover {
  transform: translateY(-2px);
}

.image-thumb {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e4e7ed;
  position: relative;
  transition: border-color 0.2s;
}

.image-option.active .image-thumb {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.image-check {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-name {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.no-image-tip {
  font-size: 13px;
  color: #909399;
  text-align: center;
  padding: 24px 0;
}

/* 模板选择 */
.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.template-card {
  cursor: pointer;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.template-card:hover {
  border-color: #c0c4cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.template-card.active {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.template-preview {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-icon {
  font-size: 36px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.template-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.template-desc {
  font-size: 12px;
  color: #909399;
}

.template-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

/* 底部操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.action-left .cost-label {
  font-size: 14px;
  color: #909399;
}

.action-left .cost-label strong {
  color: #e6a23c;
  font-size: 20px;
  font-weight: 700;
}

/* 进度条 */
.progress-section {
  margin-bottom: 20px;
  text-align: center;
}

.progress-text {
  margin-top: 12px;
  font-size: 14px;
  color: #909399;
}

/* 结果区域 */
.result-section {
  margin-bottom: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.result-actions {
  display: flex;
  gap: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-area {
    grid-template-columns: 1fr;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .action-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    text-align: center;
  }

  .action-right {
    justify-content: center;
  }
}
</style>
