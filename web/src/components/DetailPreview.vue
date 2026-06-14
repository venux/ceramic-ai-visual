<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  htmlContent: string
}>()

const isFullscreen = ref(false)
const previewRef = ref<HTMLElement>()

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    nextTick(() => {
      previewRef.value?.requestFullscreen?.()
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    })
  }
}

function handleFullscreenChange() {
  if (!document.fullscreenElement) {
    isFullscreen.value = false
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }
}
</script>

<template>
  <div
    ref="previewRef"
    class="detail-preview"
    :class="{ 'is-fullscreen': isFullscreen }"
  >
    <div class="preview-toolbar">
      <span class="preview-label">详情页预览</span>
      <el-button text size="small" @click="toggleFullscreen">
        <el-icon :size="16">
          <svg v-if="!isFullscreen" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M160 96h192q14 0 23 9t9 23v50q0 14-9 23t-23 9H160q-14 0-23-9t-9-23V128q0-14 9-23t23-9zM672 96h192q14 0 23 9t9 23v192q0 14-9 23t-23 9h-50q-14 0-23-9t-9-23V160q0-14-9-23t-23-9h-56q-14 0-23-9t-9-23V96zM160 608h50q14 0 23 9t9 23v192q0 14 9 23t23 9h56q14 0 23 9t9 23v50q0 14-9 23t-23 9H160q-14 0-23-9t-9-23V640q0-14 9-23t23-9zM864 608h50q14 0 23 9t9 23v192q0 14-9 23t-23 9H672q-14 0-23-9t-9-23v-50q0-14 9-23t23-9h192q14 0 23-9t9-23V640q0-14-9-23t-23-9z"/>
          </svg>
          <svg v-else viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M352 96q-14 0-23 9t-9 23v50q0 14 9 23t23 9h192q14 0 23 9t9 23v128q0 14-9 23t-23 9h-50q-14 0-23-9t-9-23V228q0-14-9-23t-23-9H352zM352 712h192q14 0 23-9t9-23V552q0-14 9-23t23-9h50q14 0 23 9t9 23v192q0 14-9 23t-23 9H352q-14 0-23-9t-9-23v-50q0-14 9-23t23-9z"/>
          </svg>
        </el-icon>
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </el-button>
    </div>
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="phone-content" v-html="htmlContent"></div>
    </div>
  </div>
</template>

<style scoped>
.detail-preview {
  position: relative;
  background: #f0f2f5;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s;
}

.detail-preview.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  border-radius: 0;
  padding: 24px;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.preview-label {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.is-fullscreen .preview-label {
  color: #e0e0e0;
}

.phone-frame {
  width: 750px;
  max-width: 100%;
  margin: 0 auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.is-fullscreen .phone-frame {
  flex: 1;
  max-height: 100%;
  overflow-y: auto;
  border-radius: 16px;
}

.phone-notch {
  width: 120px;
  height: 24px;
  background: #1a1a2e;
  border-radius: 0 0 16px 16px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.is-fullscreen .phone-notch {
  background: #2a2a4e;
}

.phone-content {
  width: 750px;
  max-width: 100%;
  min-height: 600px;
  overflow-x: hidden;
}

.phone-content :deep(img) {
  max-width: 100%;
  display: block;
}

.phone-content :deep(*) {
  max-width: 100%;
  box-sizing: border-box;
}
</style>
