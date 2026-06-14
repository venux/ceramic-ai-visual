<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUser()
})
</script>

<template>
  <div class="user-page">
    <el-row :gutter="24">
      <el-col :span="8">
        <el-card class="user-card" shadow="hover">
          <div class="user-avatar">
            <el-avatar :size="80" :src="userStore.user?.avatar">
              {{ userStore.user?.nickname?.[0] || '用' }}
            </el-avatar>
          </div>
          <h3>{{ userStore.user?.nickname || '用户' }}</h3>
          <el-tag>{{ userStore.plan }}</el-tag>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>套餐信息</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="当前套餐">{{ userStore.plan }}</el-descriptions-item>
            <el-descriptions-item label="剩余额度">
              <span class="credits">{{ userStore.credits }}</span> 次
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="hover" style="margin-top: 16px">
          <template #header>使用统计</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-statistic title="本月生成次数" :value="0" />
            </el-col>
            <el-col :span="12">
              <el-statistic title="本月下载次数" :value="0" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.user-page {
  max-width: 800px;
}
.user-card {
  text-align: center;
  padding: 20px 0;
}
.user-avatar {
  margin-bottom: 16px;
}
.credits {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}
</style>
