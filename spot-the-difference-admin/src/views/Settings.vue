<template>
  <div class="settings-page">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
    </div>

    <div class="settings-grid">
      <div class="settings-card">
        <h3 class="card-title">游戏参数</h3>
        <el-descriptions :column="2" border class="settings-desc">
          <el-descriptions-item label="默认时间限制">{{ gameConfig.defaultTimeLimit }} 秒</el-descriptions-item>
          <el-descriptions-item label="默认差异半径">{{ gameConfig.defaultDiffRadius }} px</el-descriptions-item>
          <el-descriptions-item label="最大差异数">{{ gameConfig.maxDiffCount }}</el-descriptions-item>
          <el-descriptions-item label="最小差异数">{{ gameConfig.minDiffCount }}</el-descriptions-item>
          <el-descriptions-item label="ELO初始值">{{ gameConfig.initialElo }}</el-descriptions-item>
          <el-descriptions-item label="ELO K因子">{{ gameConfig.eloKFactor }}</el-descriptions-item>
          <el-descriptions-item label="匹配超时">{{ gameConfig.matchTimeout }} 秒</el-descriptions-item>
          <el-descriptions-item label="最大房间人数">{{ gameConfig.maxRoomSize }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="settings-card">
        <h3 class="card-title">系统信息</h3>
        <el-descriptions :column="1" border class="settings-desc">
          <el-descriptions-item label="系统名称">找不同 - 游戏管理后台</el-descriptions-item>
          <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
          <el-descriptions-item label="后端框架">Spring Boot</el-descriptions-item>
          <el-descriptions-item label="前端框架">Vue 3 + Element Plus</el-descriptions-item>
          <el-descriptions-item label="API地址">/api → http://localhost:8080</el-descriptions-item>
          <el-descriptions-item label="服务器时间">{{ serverTime }}</el-descriptions-item>
          <el-descriptions-item label="运行环境">{{ runtimeEnv }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <div class="settings-card full-card">
      <h3 class="card-title">关于</h3>
      <div class="about-content">
        <div class="about-logo">
          <el-icon :size="48" color="#00F5FF"><View /></el-icon>
        </div>
        <div class="about-info">
          <h4>找不同 - 多人对战游戏</h4>
          <p>一款基于WebSocket实时通信的多人找不同对战游戏，支持ELO匹配、实时对战、关卡管理等功能。</p>
          <p class="about-tech">技术栈：Spring Boot · Vue 3 · WebSocket · Redis · MySQL</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { View } from '@element-plus/icons-vue'

const gameConfig = reactive({
  defaultTimeLimit: 120,
  defaultDiffRadius: 30,
  maxDiffCount: 10,
  minDiffCount: 3,
  initialElo: 1000,
  eloKFactor: 32,
  matchTimeout: 30,
  maxRoomSize: 2
})

const serverTime = ref('')
const runtimeEnv = ref(import.meta.env.MODE || 'development')

let timer = null

onMounted(() => {
  updateServerTime()
  timer = setInterval(updateServerTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})

function updateServerTime() {
  serverTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.settings-page {
  color: #e0e0e0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.settings-card {
  background: rgba(15, 19, 32, 0.6);
  border: 1px solid rgba(0, 245, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
}

.full-card {
  grid-column: 1 / -1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 16px;
}

.settings-desc :deep(.el-descriptions__label) {
  color: rgba(255, 255, 255, 0.55);
  background: rgba(0, 245, 255, 0.03);
}

.settings-desc :deep(.el-descriptions__content) {
  color: rgba(255, 255, 255, 0.85);
  background: transparent;
}

.settings-desc :deep(.el-descriptions__cell) {
  border-color: rgba(0, 245, 255, 0.06);
}

.about-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.about-logo {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 245, 255, 0.08);
  border: 1px solid rgba(0, 245, 255, 0.15);
  border-radius: 16px;
  flex-shrink: 0;
}

.about-info h4 {
  font-size: 18px;
  color: #fff;
  margin: 0 0 8px;
}

.about-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 6px;
  line-height: 1.6;
}

.about-tech {
  color: rgba(0, 245, 255, 0.6) !important;
  font-size: 13px !important;
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
