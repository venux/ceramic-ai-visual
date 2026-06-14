<script setup lang="ts">
defineProps<{
  scene: {
    id: string
    name: string
    thumbnail: string
    category?: string
  }
  selected?: boolean
}>()

defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div
    class="scene-card"
    :class="{ selected }"
    @click="$emit('select', scene.id)"
  >
    <el-image :src="scene.thumbnail" fit="cover" class="scene-thumb">
      <template #error>
        <div class="thumb-placeholder">
          <el-icon :size="32"><Picture /></el-icon>
        </div>
      </template>
    </el-image>
    <div class="scene-name">{{ scene.name }}</div>
    <el-icon v-if="selected" class="check-icon"><CircleCheck /></el-icon>
  </div>
</template>

<style scoped>
.scene-card {
  position: relative;
  width: 200px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}
.scene-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.scene-card.selected {
  border: 2px solid #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}
.scene-thumb {
  width: 200px;
  height: 150px;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}
.scene-name {
  padding: 8px 12px;
  font-size: 14px;
  text-align: center;
  color: #303133;
}
.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #409eff;
  font-size: 24px;
}
</style>
