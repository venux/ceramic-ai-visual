<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { createTask } from '@/api/modules/tasks'
import { getScenes } from '@/api/modules/scenes'
import type { Scene } from '@/api/modules/scenes'
import ImageUploader from '@/components/ImageUploader.vue'
import SceneCard from '@/components/SceneCard.vue'
import ResultGallery from '@/components/ResultGallery.vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const uploadedFiles = ref<File[]>([])
const scenes = ref<Scene[]>([])
const selectedScenes = ref<string[]>([])
const selectedPlatforms = ref<string[]>([])
const generating = ref(false)
const progress = ref(0)
const resultImages = ref<string[]>([])
const showResults = ref(false)

const platforms = [
  { id: 'taobao', name: '淘宝', color: '#ff5000' },
  { id: 'pdd', name: '拼多多', color: '#e02e24' },
  { id: 'douyin', name: '抖音', color: '#161823' },
  { id: '1688', name: '1688', color: '#ff6a00' },
]

const costCredits = computed(() => {
  return selectedScenes.value.length * selectedPlatforms.value.length * 2
})

const canGenerate = computed(() => {
  return uploadedFiles.value.length > 0
    && selectedScenes.value.length > 0
    && selectedPlatforms.value.length > 0
    && !generating.value
    && userStore.credits >= costCredits.value
})

async function fetchScenes() {
  try {
    scenes.value = await getScenes()
  } catch {
    scenes.value = [
      { id: 'white', name: '白底', category: 'basic', thumbnail: '' },
      { id: 'wood', name: '木桌', category: 'life', thumbnail: '' },
      { id: 'tea', name: '茶席', category: 'life', thumbnail: '' },
      { id: 'showroom', name: '展厅', category: 'pro', thumbnail: '' },
      { id: 'life', name: '生活', category: 'life', thumbnail: '' },
      { id: 'festival', name: '节日', category: 'season', thumbnail: '' },
    ]
  }
}

function toggleScene(id: string) {
  const index = selectedScenes.value.indexOf(id)
  if (index >= 0) {
    selectedScenes.value.splice(index, 1)
  } else {
    selectedScenes.value.push(id)
  }
}

function togglePlatform(id: string) {
  const index = selectedPlatforms.value.indexOf(id)
  if (index >= 0) {
    selectedPlatforms.value.splice(index, 1)
  } else {
    selectedPlatforms.value.push(id)
  }
}

async function handleGenerate() {
  if (!canGenerate.value) return

  generating.value = true
  progress.value = 0
  showResults.value = false

  const timer = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15
    }
  }, 500)

  try {
    const result = await createTask({
      images: uploadedFiles.value,
      scenes: selectedScenes.value,
      platforms: selectedPlatforms.value,
    })

    clearInterval(timer)
    progress.value = 100

    setTimeout(() => {
      resultImages.value = result.results || []
      showResults.value = true
      generating.value = false
      userStore.fetchUser()
    }, 500)
  } catch {
    clearInterval(timer)
    generating.value = false
    progress.value = 0
  }
}

function downloadAll() {
  resultImages.value.forEach((url, i) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `陶瓷产品图_${i + 1}.jpg`
    link.click()
  })
}

onMounted(() => {
  userStore.fetchUser()
  fetchScenes()
})
</script>

<template>
  <div class="home-page">
    <!-- 用户信息栏 -->
    <div class="user-bar card">
      <div class="user-bar-left">
        <el-avatar :size="40" :src="userStore.user?.avatar">
          {{ userStore.user?.nickname?.[0] || '用' }}
        </el-avatar>
        <div class="user-detail">
          <span class="nickname">{{ userStore.user?.nickname || '用户' }}</span>
          <span class="plan-tag">{{ userStore.plan }}</span>
        </div>
      </div>
      <div class="user-bar-right">
        <span class="credits-label">剩余额度</span>
        <span class="credits-value">{{ userStore.credits }}</span>
      </div>
    </div>

    <!-- 主区域 -->
    <div class="main-area">
      <!-- 左侧上传区 -->
      <div class="left-section card">
        <h3 class="section-title">上传产品图</h3>
        <p class="section-desc">上传实物照片，AI 自动生成多场景产品图（最多3张）</p>
        <ImageUploader v-model="uploadedFiles" :max-count="3" />
      </div>

      <!-- 右侧场景选择 -->
      <div class="right-section card">
        <h3 class="section-title">选择场景</h3>
        <p class="section-desc">选择产品图的展示场景</p>
        <div class="scene-grid">
          <SceneCard
            v-for="scene in scenes"
            :key="scene.id"
            :scene="scene"
            :selected="selectedScenes.includes(scene.id)"
            @select="toggleScene"
          />
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar card">
      <div class="platform-select">
        <span class="label">目标平台：</span>
        <el-check-tag
          v-for="p in platforms"
          :key="p.id"
          :checked="selectedPlatforms.includes(p.id)"
          @change="togglePlatform(p.id)"
          class="platform-tag"
        >
          {{ p.name }}
        </el-check-tag>
      </div>

      <div class="action-right">
        <span v-if="costCredits > 0" class="cost-info">
          消耗额度：<strong>{{ costCredits }}</strong>
        </span>
        <el-button
          type="primary"
          size="large"
          :disabled="!canGenerate"
          :loading="generating"
          @click="handleGenerate"
        >
          {{ generating ? '生成中...' : '开始生成' }}
        </el-button>
      </div>
    </div>

    <!-- 生成进度 -->
    <div v-if="generating" class="progress-section card">
      <el-progress :percentage="Math.min(Math.round(progress), 100)" :stroke-width="12" />
      <p class="progress-text">AI 正在为您生成产品图，请稍候...</p>
    </div>

    <!-- 结果区域 -->
    <div v-if="showResults && resultImages.length > 0" class="result-section card">
      <div class="result-header">
        <h3>生成结果</h3>
        <div class="result-actions">
          <el-button @click="downloadAll">批量下载</el-button>
          <el-button @click="showResults = false">收起</el-button>
        </div>
      </div>
      <ResultGallery :images="resultImages" />
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.user-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nickname {
  font-weight: 600;
  color: #303133;
}

.plan-tag {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.user-bar-right {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.credits-label {
  color: #909399;
  font-size: 14px;
}

.credits-value {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
}

.main-area {
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.section-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 16px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.platform-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-select .label {
  color: #606266;
  font-size: 14px;
}

.platform-tag {
  cursor: pointer;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cost-info {
  color: #909399;
  font-size: 14px;
}

.cost-info strong {
  color: #e6a23c;
  font-size: 18px;
}

.progress-section {
  margin-bottom: 20px;
  text-align: center;
}

.progress-text {
  margin-top: 12px;
  color: #909399;
  font-size: 14px;
}

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
}

.result-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .main-area {
    grid-template-columns: 1fr;
  }

  .scene-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .action-right {
    justify-content: space-between;
  }
}
</style>
