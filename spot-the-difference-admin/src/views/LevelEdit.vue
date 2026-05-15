<template>
  <div class="level-edit-page">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑关卡' : '创建关卡' }}</h2>
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <div class="edit-content">
      <div class="form-section">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="level-form"
        >
          <el-form-item label="关卡名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入关卡名称" maxlength="50" show-word-limit />
          </el-form-item>

          <el-form-item label="关卡描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              placeholder="请输入关卡描述"
              :rows="3"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <div class="form-row">
            <el-form-item label="主题" prop="theme">
              <el-select v-model="form.theme" placeholder="选择主题" style="width: 100%">
                <el-option label="城市" value="CITY" />
                <el-option label="森林" value="FOREST" />
                <el-option label="太空" value="SPACE" />
                <el-option label="海洋" value="OCEAN" />
                <el-option label="古迹" value="ANCIENT" />
                <el-option label="未来" value="FUTURE" />
              </el-select>
            </el-form-item>

            <el-form-item label="章节" prop="chapter">
              <el-select v-model="form.chapter" placeholder="选择章节" style="width: 100%">
                <el-option v-for="i in 10" :key="i" :label="`第${i}章`" :value="i" />
              </el-select>
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="form.difficulty" placeholder="选择难度" style="width: 100%">
                <el-option label="简单" value="EASY" />
                <el-option label="中等" value="MEDIUM" />
                <el-option label="困难" value="HARD" />
                <el-option label="地狱" value="HELL" />
              </el-select>
            </el-form-item>

            <el-form-item label="时间限制" prop="timeLimit">
              <el-input-number
                v-model="form.timeLimit"
                :min="30"
                :max="600"
                :step="10"
                style="width: 100%"
              />
              <span class="form-unit">秒</span>
            </el-form-item>
          </div>

          <el-form-item label="差异半径" prop="diffRadius">
            <el-slider
              v-model="form.diffRadius"
              :min="15"
              :max="80"
              :step="5"
              show-stops
              :marks="{ 15: '15', 30: '30', 50: '50', 80: '80' }"
              style="max-width: 400px"
            />
          </el-form-item>
        </el-form>
      </div>

      <div class="image-section">
        <h3 class="section-title">图片上传</h3>
        <div class="image-upload-row">
          <div class="image-upload-item">
            <div class="image-label">图片 A（原图）</div>
            <ImageUpload v-model="form.imageA" placeholder="上传原图" />
          </div>
          <div class="image-upload-item">
            <div class="image-label">图片 B（差异图）</div>
            <ImageUpload v-model="form.imageB" placeholder="上传差异图" />
          </div>
        </div>
      </div>

      <div v-if="form.imageA" class="diff-section">
        <h3 class="section-title">差异点标记</h3>
        <p class="section-desc">在图片A上点击添加差异标记点，拖拽移动位置，右下角手柄调整大小</p>
        <DiffMarker
          v-model="diffMarkers"
          :image-url="form.imageA"
          :diff-radius="form.diffRadius"
        />
        <div class="diff-save-bar">
          <el-button type="primary" :loading="savingDiffs" @click="saveDiffs">
            <el-icon><Check /></el-icon>
            保存差异点
          </el-button>
          <span class="diff-count-info">共 {{ diffMarkers.length }} 个差异点</span>
        </div>
      </div>

      <div class="action-bar">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
        <el-button type="success" :loading="saving" @click="handlePublish">
          保存并发布
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import {
  getLevelDetail, createLevel, updateLevel,
  publishLevel, getLevelDiffs, saveLevelDiffs
} from '../api/level'
import ImageUpload from '../components/ImageUpload.vue'
import DiffMarker from '../components/DiffMarker.vue'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const saving = ref(false)
const savingDiffs = ref(false)
const levelId = computed(() => route.params.id)
const isEdit = computed(() => !!levelId.value)

const form = reactive({
  name: '',
  description: '',
  theme: '',
  chapter: 1,
  difficulty: 'EASY',
  timeLimit: 120,
  diffRadius: 30,
  imageA: '',
  imageB: ''
})

const diffMarkers = ref([])

const rules = {
  name: [{ required: true, message: '请输入关卡名称', trigger: 'blur' }],
  theme: [{ required: true, message: '请选择主题', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  timeLimit: [{ required: true, message: '请设置时间限制', trigger: 'change' }]
}

onMounted(async () => {
  if (isEdit.value) {
    await loadLevel()
    await loadDiffs()
  }
})

async function loadLevel() {
  try {
    const res = await getLevelDetail(levelId.value)
    const data = res.data || res
    Object.assign(form, {
      name: data.name || '',
      description: data.description || '',
      theme: data.themeId || data.theme || '',
      chapter: data.chapterId || data.chapter || 1,
      difficulty: data.difficulty || 'EASY',
      timeLimit: data.timeLimit || 120,
      diffRadius: data.diffRadius || 30,
      imageA: data.imageAUrl || data.imageA || '',
      imageB: data.imageBUrl || data.imageB || ''
    })
  } catch (e) {
    ElMessage.error('加载关卡信息失败')
  }
}

async function loadDiffs() {
  try {
    const res = await getLevelDiffs(levelId.value)
    const data = res.data || res
    diffMarkers.value = (Array.isArray(data) ? data : []).map(d => ({
      id: d.id || Date.now() + Math.random(),
      x: d.x || d.diffX || 0,
      y: d.y || d.diffY || 0,
      radius: d.radius || form.diffRadius,
      type: d.type || 'COLOR_CHANGE',
      description: d.description || ''
    }))
  } catch (e) {
    console.error('加载差异点失败', e)
  }
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      themeId: form.theme,
      chapterId: form.chapter,
      difficulty: form.difficulty,
      timeLimit: form.timeLimit,
      diffRadius: form.diffRadius,
      diffCount: diffMarkers.value.length || undefined,
      imageAUrl: form.imageA,
      imageBUrl: form.imageB
    }
    if (isEdit.value) {
      await updateLevel(levelId.value, payload)
      ElMessage.success('保存成功')
    } else {
      const res = await createLevel(payload)
      const data = res.data || res
      ElMessage.success('创建成功')
      router.replace({ name: 'LevelEdit', params: { id: data.id || data } })
    }
  } catch (e) {
    ElMessage.error(isEdit.value ? '保存失败' : '创建失败')
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      themeId: form.theme,
      chapterId: form.chapter,
      difficulty: form.difficulty,
      timeLimit: form.timeLimit,
      diffRadius: form.diffRadius,
      diffCount: diffMarkers.value.length || undefined,
      imageAUrl: form.imageA,
      imageBUrl: form.imageB
    }
    let currentId = levelId.value
    if (!isEdit.value) {
      const res = await createLevel(payload)
      const data = res.data || res
      currentId = data.id || data
    } else {
      await updateLevel(levelId.value, payload)
    }

    if (diffMarkers.value.length > 0 && currentId) {
      await saveLevelDiffs(currentId, diffMarkers.value)
    }

    await publishLevel(currentId)
    ElMessage.success('发布成功')
    router.push({ name: 'LevelList' })
  } catch (e) {
    ElMessage.error('发布失败')
  } finally {
    saving.value = false
  }
}

async function saveDiffs() {
  if (!isEdit.value) {
    ElMessage.warning('请先保存关卡后再标记差异点')
    return
  }
  savingDiffs.value = true
  try {
    await saveLevelDiffs(levelId.value, diffMarkers.value)
    ElMessage.success('差异点保存成功')
  } catch (e) {
    ElMessage.error('保存差异点失败')
  } finally {
    savingDiffs.value = false
  }
}

function goBack() {
  router.push({ name: 'LevelList' })
}
</script>

<style scoped>
.level-edit-page {
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

.edit-content {
  max-width: 1200px;
}

.form-section {
  background: rgba(15, 19, 32, 0.6);
  border: 1px solid rgba(0, 245, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

.form-unit {
  margin-left: 8px;
  color: rgba(255, 255, 255, 0.45);
}

.image-section,
.diff-section {
  background: rgba(15, 19, 32, 0.6);
  border: 1px solid rgba(0, 245, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 16px;
}

.section-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: -8px 0 16px;
}

.image-upload-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.image-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 8px;
  font-weight: 500;
}

.diff-save-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 245, 255, 0.08);
}

.diff-count-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 0;
}

.level-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.65);
}

.level-form :deep(.el-input__wrapper),
.level-form :deep(.el-textarea__inner) {
  background: rgba(0, 245, 255, 0.04);
  border: 1px solid rgba(0, 245, 255, 0.12);
  box-shadow: none;
}

.level-form :deep(.el-input__wrapper:hover),
.level-form :deep(.el-input__wrapper.is-focus),
.level-form :deep(.el-textarea__inner:hover),
.level-form :deep(.el-textarea__inner:focus) {
  border-color: rgba(0, 245, 255, 0.3);
}

.level-form :deep(.el-input__inner),
.level-form :deep(.el-textarea__inner) {
  color: #e0e0e0;
}

.level-form :deep(.el-select .el-input__wrapper) {
  background: rgba(0, 245, 255, 0.04);
}

.level-form :deep(.el-slider__runway) {
  background: rgba(0, 245, 255, 0.1);
}

.level-form :deep(.el-slider__bar) {
  background: #00F5FF;
}

.level-form :deep(.el-slider__button) {
  border-color: #00F5FF;
}
</style>
