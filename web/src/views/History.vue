<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTasks } from '@/api/modules/tasks'
import type { Task } from '@/api/modules/tasks'
import { ElMessageBox } from 'element-plus'

const viewMode = ref<'table' | 'card'>('card')
const tasks = ref<Task[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

async function fetchTasks() {
  loading.value = true
  try {
    const res = await getTasks({ page: page.value, limit: 12 })
    tasks.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger',
  }
  return map[status] || 'info'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '排队中',
    processing: '生成中',
    completed: '已完成',
    failed: '失败',
  }
  return map[status] || status
}

async function handleDelete(task: Task) {
  await ElMessageBox.confirm('确定删除该任务？', '提示')
}

onMounted(fetchTasks)
</script>

<template>
  <div class="history-page">
    <div class="history-header">
      <h2>历史记录</h2>
      <el-radio-group v-model="viewMode">
        <el-radio-button value="card">卡片</el-radio-button>
        <el-radio-button value="table">表格</el-radio-button>
      </el-radio-group>
    </div>

    <el-table v-if="viewMode === 'table'" :data="tasks" v-loading="loading" stripe>
      <el-table-column label="缩略图" width="100">
        <template #default="{ row }">
          <el-image :src="row.images?.[0]" style="width: 60px; height: 60px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="scenes" label="场景">
        <template #default="{ row }">
          <el-tag v-for="s in row.scenes" :key="s" size="small">{{ s }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="180" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary">查看</el-button>
          <el-button link type="primary">下载</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="card-grid" v-loading="loading">
      <el-card v-for="task in tasks" :key="task.id" class="task-card" shadow="hover">
        <el-image :src="task.results?.[0] || task.images?.[0]" fit="cover" class="task-thumb" />
        <div class="task-info">
          <div class="task-scenes">
            <el-tag v-for="s in task.scenes" :key="s" size="small">{{ s }}</el-tag>
          </div>
          <el-tag :type="getStatusType(task.status)" size="small">{{ getStatusLabel(task.status) }}</el-tag>
          <span class="task-time">{{ task.createdAt }}</span>
        </div>
        <div class="task-actions">
          <el-button link type="primary" size="small">查看</el-button>
          <el-button link type="primary" size="small">下载</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(task)">删除</el-button>
        </div>
      </el-card>
    </div>

    <el-pagination
      v-model:current-page="page"
      :total="total"
      :page-size="12"
      layout="prev, pager, next"
      @current-change="fetchTasks"
    />
  </div>
</template>

<style scoped>
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.task-card {
  border-radius: 12px;
}
.task-thumb {
  width: 100%;
  height: 180px;
  border-radius: 8px;
}
.task-info {
  padding: 12px 0 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.task-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}
.task-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
</style>
