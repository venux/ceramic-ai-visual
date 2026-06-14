<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const navItems = [
  { path: '/', label: '产品图生成', icon: 'Picture' },
  { path: '/detail', label: '详情页生成', icon: 'Document' },
  { path: '/assets', label: '素材库', icon: 'Files' },
  { path: '/history', label: '历史记录', icon: 'Clock' },
]
</script>

<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <div class="header-left" @click="router.push('/')">
        <img src="@/assets/logo.svg" alt="logo" class="logo" />
        <span class="title">陶瓷AI视觉工厂</span>
      </div>

      <el-menu
        :default-active="$route.path"
        mode="horizontal"
        :ellipsis="false"
        router
        class="nav-menu"
      >
        <el-menu-item v-for="item in navItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>

      <div class="header-right">
        <el-dropdown v-if="userStore.isLoggedIn">
          <div class="user-info">
            <el-avatar :size="32" :src="userStore.user?.avatar">
              {{ userStore.user?.nickname?.[0] || '用' }}
            </el-avatar>
            <span class="nickname">{{ userStore.user?.nickname || '用户' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/user')">个人中心</el-dropdown-item>
              <el-dropdown-item divided @click="userStore.logout()">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-else type="primary">登录</el-button>
      </div>
    </el-header>

    <el-main class="app-main">
      <slot />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.logo {
  width: 32px;
  height: 32px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.nav-menu {
  flex: 1;
  margin: 0 40px;
  border-bottom: none;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.nickname {
  font-size: 14px;
  color: #303133;
}
.app-main {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>
