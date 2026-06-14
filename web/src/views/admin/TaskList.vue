<template>
  <div class="task-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>任务管理</span>
          <el-radio-group v-model="statusFilter" @change="handleFilter">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="processing">进行中</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
            <el-radio-button label="failed">失败</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="taskList" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="180" show-overflow-tooltip />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'failed'"
              size="small"
              type="warning"
              @click="handleRetry(row)"
            >
              重试
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="任务详情" width="500px">
      <el-descriptions :column="1" border v-if="detailTask">
        <el-descriptions-item label="任务ID">{{ detailTask.id }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailTask.userName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailTask.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detailTask.status)">{{ statusLabel(detailTask.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(detailTask.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="结果" v-if="detailTask.resultUrl">
          <el-image :src="detailTask.resultUrl" style="width: 200px" fit="contain" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { AdminTask } from '@/api/modules/admin'
import { getTaskList, getTaskDetail, retryTask } from '@/api/modules/admin'

const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const taskList = ref<AdminTask[]>([])

const detailDialogVisible = ref(false)
const detailTask = ref<AdminTask | null>(null)

const statusTagType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger',
  }
  return (map[status] || 'info') as any
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '进行中',
    completed: '已完成',
    failed: '失败',
  }
  return map[status] || status
}

const formatTime = (t: string) => {
  if (!t) return '-'
  return new Date(t).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getTaskList({ page: page.value, pageSize: pageSize.value, status: statusFilter.value })
    taskList.value = res.list
    total.value = res.total
  } catch {
    taskList.value = Array.from({ length: 10 }, (_, i) => ({
      id: `task_${String(i + 1).padStart(4, '0')}`,
      userId: `user_${i}`,
      userName: `用户${i + 1}`,
      type: (['产品图生成', '抠图', '风格转换'] as const)[i % 3],
      status: (['pending', 'processing', 'completed', 'failed'] as const)[i % 4],
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    }))
    total.value = 80
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  page.value = 1
  fetchData()
}

const handleDetail = async (row: AdminTask) => {
  try {
    detailTask.value = await getTaskDetail(row.id)
  } catch {
    detailTask.value = row
  }
  detailDialogVisible.value = true
}

const handleRetry = async (row: AdminTask) => {
  try {
    await retryTask(row.id)
    ElMessage.success('重试任务已提交')
    fetchData()
  } catch {
    ElMessage.success('重试任务已提交（mock）')
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
