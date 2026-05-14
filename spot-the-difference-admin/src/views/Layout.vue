<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="sidebar-logo">
        <el-icon :size="28" color="#00F5FF"><View /></el-icon>
        <span v-show="!isCollapse" class="logo-text">找不同</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#0d1117"
        text-color="rgba(255,255,255,0.65)"
        active-text-color="#00F5FF"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>数据看板</template>
        </el-menu-item>
        <el-menu-item index="/levels">
          <el-icon><Grid /></el-icon>
          <template #title>关卡管理</template>
        </el-menu-item>
        <el-menu-item index="/players">
          <el-icon><User /></el-icon>
          <template #title>玩家管理</template>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            :size="20"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title && currentRoute.name !== 'Dashboard'">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="admin-info">
              <el-avatar :size="32" class="admin-avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="admin-name">{{ userStore.username || '管理员' }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  View, DataBoard, Grid, User, Setting,
  Fold, Expand, UserFilled, ArrowDown, SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/levels')) return '/levels'
  return path
})
const currentRoute = computed(() => route)

function handleCommand(command) {
  if (command === 'logout') {
    userStore.logout()
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background: #0a0e17;
}

.layout-aside {
  background: #0d1117;
  border-right: 1px solid rgba(0, 245, 255, 0.08);
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(0, 245, 255, 0.08);
  padding: 0 16px;
  white-space: nowrap;
  overflow: hidden;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #00F5FF;
  letter-spacing: 3px;
  text-shadow: 0 0 10px rgba(0, 245, 255, 0.3);
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item) {
  margin: 4px 8px;
  border-radius: 8px;
  height: 44px;
  line-height: 44px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(0, 245, 255, 0.08) !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: rgba(0, 245, 255, 0.12) !important;
  border: 1px solid rgba(0, 245, 255, 0.2);
}

.main-container {
  background: #0f1320;
}

.layout-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(15, 19, 32, 0.8);
  border-bottom: 1px solid rgba(0, 245, 255, 0.06);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #00F5FF;
}

.header-left :deep(.el-breadcrumb__inner) {
  color: rgba(255, 255, 255, 0.5);
}

.header-left :deep(.el-breadcrumb__inner.is-link) {
  color: rgba(255, 255, 255, 0.65);
}

.header-left :deep(.el-breadcrumb__separator) {
  color: rgba(255, 255, 255, 0.3);
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
}

.admin-avatar {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(0, 200, 255, 0.1));
  color: #00F5FF;
}

.admin-name {
  font-size: 14px;
}

.layout-main {
  padding: 24px;
  background: #0f1320;
  overflow-y: auto;
}
</style>
