<template>
  <div class="diff-marker">
    <div
      ref="containerRef"
      class="marker-container"
      @mousedown="onContainerMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <img
        v-if="imageUrl"
        ref="imageRef"
        :src="imageUrl"
        class="marker-image"
        @load="onImageLoad"
        draggable="false"
      />
      <div v-if="!imageUrl" class="no-image">
        <el-icon :size="48"><Picture /></el-icon>
        <p>请先上传图片A</p>
      </div>

      <div
        v-for="(marker, index) in markers"
        :key="marker.id"
        class="marker-point"
        :style="getMarkerStyle(marker)"
        @mousedown.stop="onMarkerMouseDown($event, index)"
      >
        <div class="marker-circle" :class="{ active: activeIndex === index }">
          <span class="marker-index">{{ index + 1 }}</span>
        </div>
        <div
          class="marker-resize"
          @mousedown.stop="onResizeMouseDown($event, index)"
        ></div>
        <button
          class="marker-delete"
          @mousedown.stop
          @click.stop="removeMarker(index)"
        >
          <el-icon :size="10"><Close /></el-icon>
        </button>
      </div>
    </div>

    <div class="marker-list">
      <div class="marker-list-header">
        <span class="marker-list-title">差异点列表 ({{ markers.length }})</span>
        <el-button type="primary" size="small" @click="addMarkerCenter">
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
      </div>
      <el-table :data="markers" size="small" class="marker-table" max-height="300">
        <el-table-column label="#" width="40" align="center">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="X" width="70" align="center">
          <template #default="{ row }">{{ Math.round(row.x) }}</template>
        </el-table-column>
        <el-table-column label="Y" width="70" align="center">
          <template #default="{ row }">{{ Math.round(row.y) }}</template>
        </el-table-column>
        <el-table-column label="半径" width="80" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.radius"
              :min="10"
              :max="100"
              size="small"
              controls-position="right"
              style="width: 70px"
            />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="140">
          <template #default="{ row }">
            <el-select v-model="row.type" size="small" style="width: 120px">
              <el-option label="颜色变化" value="COLOR_CHANGE" />
              <el-option label="物体移除" value="OBJECT_REMOVED" />
              <el-option label="物体添加" value="OBJECT_ADDED" />
              <el-option label="位置偏移" value="POSITION_SHIFT" />
              <el-option label="大小变化" value="SIZE_CHANGE" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.description" size="small" placeholder="描述" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center">
          <template #default="{ $index }">
            <el-button type="danger" link size="small" @click="removeMarker($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Picture, Close, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  imageUrl: { type: String, default: '' },
  diffRadius: { type: Number, default: 30 },
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
const imageRef = ref(null)
const markers = ref([...props.modelValue])
const activeIndex = ref(-1)
const imageDisplayWidth = ref(0)
const imageDisplayHeight = ref(0)
const IMAGE_BASE_WIDTH = 800
const IMAGE_BASE_HEIGHT = 600

let dragState = null

watch(() => props.modelValue, (val) => {
  markers.value = [...val]
}, { deep: true })

watch(markers, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

watch(() => props.diffRadius, (val) => {
  // no auto update existing markers
})

function onImageLoad() {
  nextTick(() => {
    if (imageRef.value) {
      imageDisplayWidth.value = imageRef.value.clientWidth
      imageDisplayHeight.value = imageRef.value.clientHeight
    }
  })
}

function getScaleX() {
  return imageDisplayWidth.value / IMAGE_BASE_WIDTH
}

function getScaleY() {
  return imageDisplayHeight.value / IMAGE_BASE_HEIGHT
}

function getMarkerStyle(marker) {
  const scaleX = getScaleX()
  const scaleY = getScaleY()
  const displayX = marker.x * scaleX
  const displayY = marker.y * scaleY
  const displayRadius = marker.radius * scaleX
  return {
    left: `${displayX}px`,
    top: `${displayY}px`,
    width: `${displayRadius * 2}px`,
    height: `${displayRadius * 2}px`,
    transform: 'translate(-50%, -50%)'
  }
}

function onContainerMouseDown(e) {
  if (!imageRef.value || !props.imageUrl) return
  const rect = imageRef.value.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  if (clickX < 0 || clickY < 0 || clickX > rect.width || clickY > rect.height) return

  const scaleX = getScaleX()
  const scaleY = getScaleY()
  const baseX = clickX / scaleX
  const baseY = clickY / scaleY

  const newMarker = {
    id: Date.now() + Math.random(),
    x: Math.round(baseX),
    y: Math.round(baseY),
    radius: props.diffRadius || 30,
    type: 'COLOR_CHANGE',
    description: ''
  }
  markers.value.push(newMarker)
  activeIndex.value = markers.value.length - 1
}

function onMarkerMouseDown(e, index) {
  e.preventDefault()
  activeIndex.value = index
  const marker = markers.value[index]
  const scaleX = getScaleX()
  const scaleY = getScaleY()

  dragState = {
    type: 'move',
    index,
    startX: e.clientX,
    startY: e.clientY,
    originX: marker.x,
    originY: marker.y,
    scaleX,
    scaleY
  }
}

function onResizeMouseDown(e, index) {
  e.preventDefault()
  e.stopPropagation()
  const marker = markers.value[index]
  const scaleX = getScaleX()

  dragState = {
    type: 'resize',
    index,
    startX: e.clientX,
    startY: e.clientY,
    originRadius: marker.radius,
    scaleX
  }
}

function onMouseMove(e) {
  if (!dragState) return

  const dx = e.clientX - dragState.startX
  const dy = e.clientY - dragState.startY

  if (dragState.type === 'move') {
    const deltaX = dx / dragState.scaleX
    const deltaY = dy / dragState.scaleY
    const marker = markers.value[dragState.index]
    marker.x = Math.max(0, Math.min(IMAGE_BASE_WIDTH, dragState.originX + deltaX))
    marker.y = Math.max(0, Math.min(IMAGE_BASE_HEIGHT, dragState.originY + deltaY))
  } else if (dragState.type === 'resize') {
    const deltaRadius = dx / dragState.scaleX
    const marker = markers.value[dragState.index]
    marker.radius = Math.max(10, Math.min(100, dragState.originRadius + deltaRadius))
  }
}

function onMouseUp() {
  dragState = null
}

function removeMarker(index) {
  markers.value.splice(index, 1)
  if (activeIndex.value === index) {
    activeIndex.value = -1
  } else if (activeIndex.value > index) {
    activeIndex.value--
  }
}

function addMarkerCenter() {
  const newMarker = {
    id: Date.now() + Math.random(),
    x: Math.round(IMAGE_BASE_WIDTH / 2),
    y: Math.round(IMAGE_BASE_HEIGHT / 2),
    radius: props.diffRadius || 30,
    type: 'COLOR_CHANGE',
    description: ''
  }
  markers.value.push(newMarker)
  activeIndex.value = markers.value.length - 1
}
</script>

<style scoped>
.diff-marker {
  width: 100%;
}

.marker-container {
  position: relative;
  display: inline-block;
  background: rgba(15, 19, 32, 0.6);
  border: 2px dashed rgba(0, 245, 255, 0.15);
  border-radius: 8px;
  overflow: hidden;
  cursor: crosshair;
  user-select: none;
  max-width: 100%;
}

.marker-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.no-image {
  width: 800px;
  max-width: 100%;
  height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.25);
  gap: 12px;
}

.marker-point {
  position: absolute;
  cursor: move;
  z-index: 10;
}

.marker-circle {
  width: 100%;
  height: 100%;
  border: 2px solid #00F5FF;
  border-radius: 50%;
  background: rgba(0, 245, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.marker-circle.active {
  background: rgba(0, 245, 255, 0.15);
  border-color: #00d4ff;
  box-shadow: 0 0 12px rgba(0, 245, 255, 0.3);
}

.marker-index {
  color: #00F5FF;
  font-size: 12px;
  font-weight: 700;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

.marker-resize {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 12px;
  height: 12px;
  background: #00F5FF;
  border-radius: 50%;
  cursor: se-resize;
  z-index: 11;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.marker-resize:hover {
  opacity: 1;
  transform: scale(1.2);
}

.marker-delete {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: #f56c6c;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  opacity: 0;
  transition: opacity 0.2s;
  padding: 0;
}

.marker-point:hover .marker-delete {
  opacity: 1;
}

.marker-delete:hover {
  background: #e6363a;
}

.marker-list {
  margin-top: 16px;
}

.marker-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.marker-list-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
}

.marker-table {
  --el-table-bg-color: rgba(15, 19, 32, 0.6);
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 245, 255, 0.04);
  --el-table-row-hover-bg-color: rgba(0, 245, 255, 0.04);
  --el-table-border-color: rgba(0, 245, 255, 0.06);
  --el-table-text-color: rgba(255, 255, 255, 0.75);
  --el-table-header-text-color: rgba(255, 255, 255, 0.55);
}
</style>
