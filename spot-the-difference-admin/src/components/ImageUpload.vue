<template>
  <div class="image-upload">
    <el-upload
      :action="uploadUrl"
      :headers="uploadHeaders"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      accept="image/*"
    >
      <div v-if="modelValue" class="image-preview">
        <img :src="modelValue" class="preview-img" />
        <div class="image-overlay">
          <el-icon :size="24"><Refresh /></el-icon>
          <span>更换图片</span>
        </div>
      </div>
      <div v-else class="upload-placeholder">
        <el-icon :size="32"><Plus /></el-icon>
        <p>{{ placeholder }}</p>
      </div>
    </el-upload>
    <div v-if="modelValue" class="image-actions">
      <el-button type="danger" link size="small" @click.stop="handleRemove">
        删除图片
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '点击上传图片' }
})

const emit = defineEmits(['update:modelValue'])

const uploadUrl = '/api/admin/upload/image'
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

function onSuccess(response) {
  const url = response.data?.url || response.data || response.url
  emit('update:modelValue', url)
  ElMessage.success('上传成功')
}

function onError() {
  ElMessage.error('上传失败')
}

function handleRemove() {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.image-upload :deep(.el-upload) {
  width: 100%;
  border: 2px dashed rgba(0, 245, 255, 0.15);
  border-radius: 8px;
  background: rgba(15, 19, 32, 0.4);
  transition: border-color 0.3s;
  overflow: hidden;
}

.image-upload :deep(.el-upload:hover) {
  border-color: rgba(0, 245, 255, 0.35);
}

.upload-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  gap: 8px;
}

.upload-placeholder p {
  margin: 0;
  font-size: 13px;
}

.image-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.3);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #00F5FF;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 13px;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  margin-top: 8px;
  text-align: center;
}
</style>
