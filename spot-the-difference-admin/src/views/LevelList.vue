<template>
  <div class="level-list-page">
    <div class="page-header">
      <h2 class="page-title">关卡管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建关卡
      </el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="searchName"
        placeholder="搜索关卡名称"
        clearable
        style="width: 240px"
        @clear="loadLevels"
        @keyup.enter="loadLevels"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px" @change="loadLevels">
        <el-option label="草稿" value="DRAFT" />
        <el-option label="已发布" value="PUBLISHED" />
        <el-option label="已下线" value="OFFLINE" />
      </el-select>
      <el-select v-model="filterDifficulty" placeholder="难度筛选" clearable style="width: 140px" @change="loadLevels">
        <el-option label="简单" value="EASY" />
        <el-option label="中等" value="MEDIUM" />
        <el-option label="困难" value="HARD" />
        <el-option label="地狱" value="HELL" />
      </el-select>
      <el-button @click="loadLevels">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <el-table
      :data="levels"
      v-loading="loading"
      class="level-table"
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="关卡名称" min-width="160">
        <template #default="{ row }">
          <span class="level-name" @click="handleEdit(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="theme" label="主题" width="120">
        <template #default="{ row }">
          {{ themeMap[row.theme] || row.theme }}
        </template>
      </el-table-column>
      <el-table-column prop="difficulty" label="难度" width="100">
        <template #default="{ row }">
          <el-tag :type="difficultyType(row.difficulty)" size="small" effect="dark">
            {{ difficultyMap[row.difficulty] || row.difficulty }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small" effect="dark">
            {{ statusMap[row.status] || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="diffCount" label="差异数" width="90" align="center">
        <template #default="{ row }">
          <span class="diff-count">{{ row.diffCount || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status === 'DRAFT' || row.status === 'OFFLINE'"
            type="success"
            link
            size="small"
            @click="handlePublish(row)"
          >
            发布
          </el-button>
          <el-button
            v-if="row.status === 'PUBLISHED'"
            type="warning"
            link
            size="small"
            @click="handleOffline(row)"
          >
            下线
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
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
        @size-change="loadLevels"
        @current-change="loadLevels"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getLevelList, deleteLevel, publishLevel, offlineLevel } from '../api/level'

const router = useRouter()

const loading = ref(false)
const levels = ref([])
const searchName = ref('')
const filterStatus = ref('')
const filterDifficulty = ref('')
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const statusMap = { DRAFT: '草稿', PUBLISHED: '已发布', OFFLINE: '已下线' }
const difficultyMap = { EASY: '简单', MEDIUM: '中等', HARD: '困难', HELL: '地狱' }
const themeMap = { CITY: '城市', FOREST: '森林', SPACE: '太空', OCEAN: '海洋', ANCIENT: '古迹', FUTURE: '未来' }

function statusType(status) {
  const map = { DRAFT: 'info', PUBLISHED: 'success', OFFLINE: 'danger' }
  return map[status] || 'info'
}

function difficultyType(difficulty) {
  const map = { EASY: 'success', MEDIUM: '', HARD: 'warning', HELL: 'danger' }
  return map[difficulty] || ''
}

onMounted(() => {
  loadLevels()
})

async function loadLevels() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    if (searchName.value) params.name = searchName.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterDifficulty.value) params.difficulty = filterDifficulty.value

    const res = await getLevelList(params)
    const data = res.data || res
    levels.value = data.records || data.list || data.content || []
    pagination.total = data.total || data.totalElements || 0
  } catch (e) {
    console.error('加载关卡列表失败', e)
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  router.push({ name: 'LevelCreate' })
}

function handleEdit(row) {
  router.push({ name: 'LevelEdit', params: { id: row.id } })
}

async function handlePublish(row) {
  try {
    await ElMessageBox.confirm(`确定要发布关卡「${row.name}」吗？`, '确认发布', {
      confirmButtonText: '发布',
      cancelButtonText: '取消',
      type: 'info'
    })
    await publishLevel(row.id)
    ElMessage.success('发布成功')
    loadLevels()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('发布失败')
    }
  }
}

async function handleOffline(row) {
  try {
    await ElMessageBox.confirm(`确定要下线关卡「${row.name}」吗？下线后玩家将无法访问此关卡。`, '确认下线', {
      confirmButtonText: '下线',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await offlineLevel(row.id)
    ElMessage.success('已下线')
    loadLevels()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('下线失败')
    }
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除关卡「${row.name}」吗？此操作不可恢复。`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'error'
    })
    await deleteLevel(row.id)
    ElMessage.success('删除成功')
    loadLevels()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.level-list-page {
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
  flex-wrap: wrap;
}

.level-table {
  --el-table-bg-color: rgba(15, 19, 32, 0.6);
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 245, 255, 0.04);
  --el-table-row-hover-bg-color: rgba(0, 245, 255, 0.04);
  --el-table-border-color: rgba(0, 245, 255, 0.06);
  --el-table-text-color: rgba(255, 255, 255, 0.75);
  --el-table-header-text-color: rgba(255, 255, 255, 0.55);
}

.level-name {
  color: #00F5FF;
  cursor: pointer;
  transition: opacity 0.2s;
}

.level-name:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.diff-count {
  color: #00F5FF;
  font-weight: 600;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
