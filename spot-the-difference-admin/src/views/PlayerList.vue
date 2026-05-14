<template>
  <div class="player-list-page">
    <div class="page-header">
      <h2 class="page-title">玩家管理</h2>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名/昵称"
        clearable
        style="width: 260px"
        @clear="loadPlayers"
        @keyup.enter="loadPlayers"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button @click="loadPlayers">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <el-table
      :data="players"
      v-loading="loading"
      class="player-table"
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column prop="nickname" label="昵称" width="140" />
      <el-table-column prop="level" label="等级" width="80" align="center">
        <template #default="{ row }">
          <span class="player-level">Lv.{{ row.level || 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="elo" label="ELO" width="100" align="center">
        <template #default="{ row }">
          <span class="player-elo">{{ row.elo || 1000 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'BANNED' ? 'danger' : 'success'" size="small" effect="dark">
            {{ row.status === 'BANNED' ? '已封禁' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginAt" label="最后登录" width="180">
        <template #default="{ row }">
          {{ formatTime(row.lastLoginAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="totalGames" label="总对局" width="90" align="center" />
      <el-table-column prop="winRate" label="胜率" width="90" align="center">
        <template #default="{ row }">
          {{ row.winRate != null ? row.winRate + '%' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleViewDetail(row)">
            详情
          </el-button>
          <el-button
            v-if="row.status !== 'BANNED'"
            type="danger"
            link
            size="small"
            @click="handleBan(row)"
          >
            封禁
          </el-button>
          <el-button
            v-else
            type="success"
            link
            size="small"
            @click="handleUnban(row)"
          >
            解封
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadPlayers"
        @current-change="loadPlayers"
      />
    </div>

    <el-dialog
      v-model="detailVisible"
      title="玩家详情"
      width="500px"
      class="detail-dialog"
    >
      <el-descriptions :column="2" border v-if="currentPlayer">
        <el-descriptions-item label="ID">{{ currentPlayer.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentPlayer.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentPlayer.nickname }}</el-descriptions-item>
        <el-descriptions-item label="等级">Lv.{{ currentPlayer.level || 1 }}</el-descriptions-item>
        <el-descriptions-item label="ELO">{{ currentPlayer.elo || 1000 }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentPlayer.status === 'BANNED' ? 'danger' : 'success'" size="small">
            {{ currentPlayer.status === 'BANNED' ? '已封禁' : '正常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总对局">{{ currentPlayer.totalGames || 0 }}</el-descriptions-item>
        <el-descriptions-item label="胜率">{{ currentPlayer.winRate != null ? currentPlayer.winRate + '%' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">{{ formatTime(currentPlayer.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="最后登录" :span="2">{{ formatTime(currentPlayer.lastLoginAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getPlayerList, banPlayer, unbanPlayer } from '../api/player'

const loading = ref(false)
const players = ref([])
const searchKeyword = ref('')
const detailVisible = ref(false)
const currentPlayer = ref(null)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  loadPlayers()
})

async function loadPlayers() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    if (searchKeyword.value) params.keyword = searchKeyword.value

    const res = await getPlayerList(params)
    const data = res.data || res
    players.value = data.records || data.list || data.content || []
    pagination.total = data.total || data.totalElements || 0
  } catch (e) {
    console.error('加载玩家列表失败', e)
  } finally {
    loading.value = false
  }
}

function formatTime(time) {
  if (!time) return '-'
  const d = new Date(time)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleViewDetail(row) {
  currentPlayer.value = row
  detailVisible.value = true
}

async function handleBan(row) {
  try {
    await ElMessageBox.confirm(
      `确定要封禁玩家「${row.username}」吗？封禁后该玩家将无法登录游戏。`,
      '确认封禁',
      {
        confirmButtonText: '封禁',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await banPlayer(row.id)
    ElMessage.success('已封禁')
    loadPlayers()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('封禁失败')
    }
  }
}

async function handleUnban(row) {
  try {
    await ElMessageBox.confirm(
      `确定要解封玩家「${row.username}」吗？`,
      '确认解封',
      {
        confirmButtonText: '解封',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    await unbanPlayer(row.id)
    ElMessage.success('已解封')
    loadPlayers()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('解封失败')
    }
  }
}
</script>

<style scoped>
.player-list-page {
  color: #e0e0e0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.player-table {
  --el-table-bg-color: rgba(15, 19, 32, 0.6);
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 245, 255, 0.04);
  --el-table-row-hover-bg-color: rgba(0, 245, 255, 0.04);
  --el-table-border-color: rgba(0, 245, 255, 0.06);
  --el-table-text-color: rgba(255, 255, 255, 0.75);
  --el-table-header-text-color: rgba(255, 255, 255, 0.55);
}

.player-level {
  color: #00F5FF;
  font-weight: 600;
}

.player-elo {
  color: #7b61ff;
  font-weight: 600;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
