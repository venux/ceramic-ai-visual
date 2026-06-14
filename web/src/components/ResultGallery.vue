<script setup lang="ts">
import { ref } from 'vue'
import { Download, ZoomIn } from '@element-plus/icons-vue'

defineProps<{
  images: string[]
}>()

const showViewer = ref(false)
const currentIndex = ref(0)

function openViewer(index: number) {
  currentIndex.value = index
  showViewer.value = true
}

function downloadImage(url: string, index: number) {
  const link = document.createElement('a')
  link.href = url
  link.download = `陶瓷产品图_${index + 1}.jpg`
  link.click()
}
</script>

<template>
  <div class="result-gallery">
    <div class="gallery-grid">
      <div v-for="(img, index) in images" :key="index" class="gallery-item">
        <el-image :src="img" fit="cover" class="gallery-img" />
        <div class="gallery-overlay">
          <el-button :icon="ZoomIn" circle @click="openViewer(index)" />
          <el-button :icon="Download" circle @click="downloadImage(img, index)" />
        </div>
      </div>
    </div>

    <el-image-viewer
      v-if="showViewer"
      :url-list="images"
      :initial-index="currentIndex"
      @close="showViewer = false"
    />
  </div>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
}
.gallery-img {
  width: 100%;
  height: 100%;
}
.gallery-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}
.gallery-item:hover .gallery-overlay {
  opacity: 1;
}
</style>
