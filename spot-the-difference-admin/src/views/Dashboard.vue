<template>
  <div class="dashboard-page">
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-icon online">
          <el-icon :size="28"><Monitor /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.onlinePlayers || 0 }}</div>
          <div class="stat-label">在线玩家</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <el-icon :size="28"><UserFilled /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.todayActive || 0 }}</div>
          <div class="stat-label">今日活跃</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon games">
          <el-icon :size="28"><Trophy /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalGames || 0 }}</div>
          <div class="stat-label">总对局数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rate">
          <el-icon :size="28"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.completionRate || '0%' }}</div>
          <div class="stat-label">完成率</div>
        </div>
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-card">
        <div class="chart-title">DAU趋势（近7天）</div>
        <div ref="dauChartRef" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">关卡完成率</div>
        <div ref="levelChartRef" class="chart-container"></div>
      </div>
    </div>

    <div class="chart-row">
      <div class="chart-card full">
        <div class="chart-title">玩家ELO分布</div>
        <div ref="eloChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { Monitor, UserFilled, Trophy, CircleCheck } from '@element-plus/icons-vue'
import { getDashboardStats, getDauTrend, getLevelCompletionRate, getEloDistribution } from '../api/dashboard'

const stats = ref({})
const dauChartRef = ref(null)
const levelChartRef = ref(null)
const eloChartRef = ref(null)

let dauChart = null
let levelChart = null
let eloChart = null

onMounted(async () => {
  await loadStats()
  initCharts()
  await loadChartData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  dauChart?.dispose()
  levelChart?.dispose()
  eloChart?.dispose()
})

async function loadStats() {
  try {
    const res = await getDashboardStats()
    stats.value = res.data || res
  } catch (e) {
    console.error('加载统计数据失败', e)
  }
}

function initCharts() {
  if (dauChartRef.value) {
    dauChart = echarts.init(dauChartRef.value, 'dark')
  }
  if (levelChartRef.value) {
    levelChart = echarts.init(levelChartRef.value, 'dark')
  }
  if (eloChartRef.value) {
    eloChart = echarts.init(eloChartRef.value, 'dark')
  }
}

async function loadChartData() {
  try {
    const [dauRes, levelRes, eloRes] = await Promise.allSettled([
      getDauTrend(),
      getLevelCompletionRate(),
      getEloDistribution()
    ])

    if (dauRes.status === 'fulfilled') {
      renderDauChart(dauRes.value.data || dauRes.value)
    } else {
      renderDauChart(getMockDauData())
    }

    if (levelRes.status === 'fulfilled') {
      renderLevelChart(levelRes.value.data || levelRes.value)
    } else {
      renderLevelChart(getMockLevelData())
    }

    if (eloRes.status === 'fulfilled') {
      renderEloChart(eloRes.value.data || eloRes.value)
    } else {
      renderEloChart(getMockEloData())
    }
  } catch (e) {
    console.error('加载图表数据失败', e)
    renderDauChart(getMockDauData())
    renderLevelChart(getMockLevelData())
    renderEloChart(getMockEloData())
  }
}

function getMockDauData() {
  const days = []
  const values = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${d.getMonth() + 1}/${d.getDate()}`)
    values.push(Math.floor(Math.random() * 500 + 200))
  }
  return { days, values }
}

function getMockLevelData() {
  return {
    levels: ['关卡1', '关卡2', '关卡3', '关卡4', '关卡5', '关卡6'],
    rates: [85, 72, 63, 51, 38, 25]
  }
}

function getMockEloData() {
  return [
    { name: '0-800', value: 120 },
    { name: '800-1000', value: 280 },
    { name: '1000-1200', value: 450 },
    { name: '1200-1500', value: 320 },
    { name: '1500-1800', value: 150 },
    { name: '1800+', value: 50 }
  ]
}

function renderDauChart(data) {
  if (!dauChart) return
  dauChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,19,32,0.9)',
      borderColor: 'rgba(0,245,255,0.2)',
      textStyle: { color: '#e0e0e0' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.days,
      axisLine: { lineStyle: { color: 'rgba(0,245,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0,245,255,0.15)' } },
      splitLine: { lineStyle: { color: 'rgba(0,245,255,0.06)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)' }
    },
    series: [{
      data: data.values,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#00F5FF', width: 3 },
      itemStyle: { color: '#00F5FF', borderWidth: 2, borderColor: '#0f1320' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,245,255,0.25)' },
          { offset: 1, color: 'rgba(0,245,255,0.02)' }
        ])
      }
    }]
  })
}

function renderLevelChart(data) {
  if (!levelChart) return
  levelChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,19,32,0.9)',
      borderColor: 'rgba(0,245,255,0.2)',
      textStyle: { color: '#e0e0e0' },
      formatter: '{b}: {c}%'
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.levels,
      axisLine: { lineStyle: { color: 'rgba(0,245,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)' }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: 'rgba(0,245,255,0.15)' } },
      splitLine: { lineStyle: { color: 'rgba(0,245,255,0.06)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', formatter: '{value}%' }
    },
    series: [{
      data: data.rates,
      type: 'bar',
      barWidth: '50%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#00F5FF' },
          { offset: 1, color: 'rgba(0,200,255,0.3)' }
        ])
      }
    }]
  })
}

function renderEloChart(data) {
  if (!eloChart) return
  const colors = ['#00F5FF', '#00c8ff', '#0096ff', '#7b61ff', '#b44dff', '#ff6b9d']
  eloChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,19,32,0.9)',
      borderColor: 'rgba(0,245,255,0.2)',
      textStyle: { color: '#e0e0e0' },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: 'rgba(255,255,255,0.65)' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#0f1320',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#e0e0e0' }
      },
      data: data.map((item, index) => ({
        ...item,
        itemStyle: { color: colors[index % colors.length] }
      }))
    }]
  })
}

function handleResize() {
  dauChart?.resize()
  levelChart?.resize()
  eloChart?.resize()
}
</script>

<style scoped>
.dashboard-page {
  color: #e0e0e0;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(15, 19, 32, 0.8);
  border: 1px solid rgba(0, 245, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: rgba(0, 245, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.05);
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.online {
  background: rgba(0, 245, 255, 0.12);
  color: #00F5FF;
}

.stat-icon.active {
  background: rgba(0, 200, 255, 0.12);
  color: #00c8ff;
}

.stat-icon.games {
  background: rgba(123, 97, 255, 0.12);
  color: #7b61ff;
}

.stat-icon.rate {
  background: rgba(0, 230, 118, 0.12);
  color: #00e676;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 4px;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: rgba(15, 19, 32, 0.8);
  border: 1px solid rgba(0, 245, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
}

.chart-card.full {
  grid-column: 1 / -1;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12px;
}

.chart-container {
  height: 320px;
  width: 100%;
}

@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>
