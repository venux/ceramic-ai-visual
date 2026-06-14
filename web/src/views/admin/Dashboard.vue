<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #ecf5ff; color: #409eff">
            <el-icon :size="28"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #fdf6ec; color: #e6a23c">
            <el-icon :size="28"><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayNewUsers }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f0f9eb; color: #67c23a">
            <el-icon :size="28"><List /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalTasks }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #fef0f0; color: #f56c6c">
            <el-icon :size="28"><Picture /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalImages }}</div>
            <div class="stat-label">总生成图片</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图 -->
    <el-card class="chart-card" shadow="hover">
      <template #header>
        <span>最近7天任务趋势</span>
      </template>
      <div class="bar-chart">
        <div class="bar-chart-inner">
          <div
            v-for="item in stats.trend"
            :key="item.date"
            class="bar-item"
          >
            <div class="bar-value">{{ item.count }}</div>
            <div
              class="bar"
              :style="{ height: getBarHeight(item.count) + 'px' }"
            ></div>
            <div class="bar-label">{{ formatDate(item.date) }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 最近任务 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <span>最近10条任务</span>
      </template>
      <el-table :data="stats.recentTasks" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="180" show-overflow-tooltip />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, UserFilled, List, Picture } from '@element-plus/icons-vue'
import type { AdminDashboard } from '@/api/modules/admin'
import { getDashboard } from '@/api/modules/admin'

const stats = ref<AdminDashboard>({
  totalUsers: 0,
  todayNewUsers: 0,
  totalTasks: 0,
  totalImages: 0,
  trend: [],
  recentTasks: [],
})

const maxCount = ref(1)

const getBarHeight = (count: number) => {
  if (maxCount.value === 0) return 0
  return Math.max((count / maxCount.value) * 180, 4)
}

const formatDate = (date: string) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

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

onMounted(async () => {
  try {
    const res = await getDashboard()
    stats.value = res
    maxCount.value = Math.max(...res.trend.map((t) => t.count), 1)
  } catch {
    // 使用mock数据
    stats.value = {
      totalUsers: 128,
      todayNewUsers: 5,
      totalTasks: 356,
      totalImages: 1024,
      trend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
        count: Math.floor(Math.random() * 50) + 10,
      })),
      recentTasks: Array.from({ length: 10 }, (_, i) => ({
        id: `task_${String(i + 1).padStart(4, '0')}`,
        userId: `user_${i}`,
        userName: `用户${i + 1}`,
        type: '产品图生成',
        status: (['completed', 'processing', 'failed', 'pending'] as const)[i % 4],
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      })),
    }
    maxCount.value = Math.max(...stats.value.trend.map((t) => t.count), 1)
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-cards {
  margin-bottom: 0;
}

.stat-card {
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-card {
  min-height: 300px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 240px;
  padding: 20px 0;
}

.bar-chart-inner {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  height: 100%;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-value {
  font-size: 12px;
  color: #606266;
  font-weight: 600;
}

.bar {
  width: 40px;
  background: linear-gradient(180deg, #409eff, #79bbff);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 4px;
}

.bar-label {
  font-size: 12px;
  color: #909399;
}
</style>
