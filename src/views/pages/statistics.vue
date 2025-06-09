<template>
  <div class="statistics-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card" shadow="hover">
          <div class="welcome-header">
            <div class="welcome-title">
              <h2>系统统计信息</h2>
              <div class="welcome-subtitle">实时掌握教学系统运行概况</div>
            </div>
            <div class="welcome-time">
              <div class="date">{{ currentDate }}</div>
              <div class="time">{{ currentTime }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
        <el-card class="stat-card" shadow="hover" :body-style="{ padding: '20px' }">
          <div class="stat-card-content">
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <el-icon :size="24"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
          <div class="stat-trend">
            <span :class="item.increase ? 'trend-up' : 'trend-down'">
              {{ item.increase ? '+' : '-' }}{{ item.changeRate }}%
            </span>
            <span class="trend-period">较上月</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>系统活跃度趋势</span>
              <el-radio-group v-model="activeTimeRange" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="activityChartRef"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>用户组成</span>
              <el-radio-group v-model="userChartType" size="small">
                <el-radio-button label="role">角色</el-radio-button>
                <el-radio-button label="college">学院</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="userChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程与考试信息 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :lg="12">
        <el-card class="data-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本周考试安排</span>
              <el-button type="primary" text>查看全部</el-button>
            </div>
          </template>
          <el-table :data="examSchedule" style="width: 100%" :max-height="350">
            <el-table-column prop="name" label="考试名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="course" label="课程" min-width="100" show-overflow-tooltip />
            <el-table-column prop="time" label="考试时间" min-width="160" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="data-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近登录记录</span>
              <el-button type="primary" text>查看全部</el-button>
            </div>
          </template>
          <el-table :data="loginRecords" style="width: 100%" :max-height="350">
            <el-table-column min-width="60">
              <template #default="scope">
                <el-avatar :size="40" :src="scope.row.avatar">{{ scope.row.name.charAt(0) }}</el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="用户名" min-width="100" show-overflow-tooltip />
            <el-table-column prop="role" label="角色" width="80">
              <template #default="scope">
                <el-tag size="small" :type="getRoleType(scope.row.role)">{{ scope.row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="登录时间" min-width="160" />
            <el-table-column prop="ip" label="IP地址" min-width="120" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
  User, School, Document, Calendar, PieChart, DataLine,
  Monitor, Trophy, Edit, Download
} from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import {
  BarChart, LineChart, PieChart as EChartPie,
} from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  BarChart, LineChart, EChartPie, CanvasRenderer
])

// 当前日期时间
const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}))
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN')
}
const timeInterval = setInterval(updateTime, 1000)
updateTime()

// 统计卡片数据
const statCards = ref([
  {
    icon: 'School',
    label: '学院总数',
    value: 8,
    color: '#409EFF',
    increase: true,
    changeRate: 12.5
  },
  {
    icon: 'User',
    label: '用户总数',
    value: 2568,
    color: '#67C23A',
    increase: true,
    changeRate: 5.2
  },
  {
    icon: 'Document',
    label: '课程总数',
    value: 126,
    color: '#E6A23C',
    increase: true,
    changeRate: 8.7
  },
  {
    icon: 'Calendar',
    label: '考试次数',
    value: 248,
    color: '#F56C6C',
    increase: false,
    changeRate: 3.1
  }
])

// 图表相关
const activityChartRef = ref<HTMLElement | null>(null)
const userChartRef = ref<HTMLElement | null>(null)
let activityChart: echarts.ECharts | null = null
let userChart: echarts.ECharts | null = null
const activeTimeRange = ref('month')
const userChartType = ref('role')

// 考试安排数据
const examSchedule = ref([
  {
    name: '2025年秋季Java程序设计期末考试',
    course: 'Java程序设计',
    time: '2025-12-25 14:00-16:00',
    status: '未开始'
  },
  {
    name: '数据结构与算法分析第三次测验',
    course: '数据结构',
    time: '2025-12-26 10:00-11:30',
    status: '未开始'
  },
  {
    name: '计算机网络原理在线测试',
    course: '计算机网络',
    time: '2025-12-27 19:30-21:00',
    status: '未开始'
  },
  {
    name: '数据库系统概论期中考试',
    course: '数据库系统',
    time: '2025-12-28 08:30-10:30',
    status: '未开始'
  },
  {
    name: '软件工程项目答辩',
    course: '软件工程',
    time: '2025-12-29 13:00-17:00',
    status: '未开始'
  }
])

// 登录记录数据
const loginRecords = ref([
  {
    avatar: '',
    name: '张教授',
    role: '教师',
    time: '2025-12-24 08:45:32',
    ip: '192.168.1.101'
  },
  {
    avatar: '',
    name: '李同学',
    role: '学生',
    time: '2025-12-24 09:12:05',
    ip: '192.168.1.102'
  },
  {
    avatar: '',
    name: '王主任',
    role: '管理员',
    time: '2025-12-24 09:30:18',
    ip: '192.168.1.103'
  },
  {
    avatar: '',
    name: '赵老师',
    role: '教师',
    time: '2025-12-24 10:05:47',
    ip: '192.168.1.104'
  },
  {
    avatar: '',
    name: '刘同学',
    role: '学生',
    time: '2025-12-24 10:15:33',
    ip: '192.168.1.105'
  }
])

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '已完成':
      return 'success'
    case '进行中':
      return 'warning'
    case '未开始':
      return 'info'
    default:
      return 'info'
  }
}

// 获取角色类型
const getRoleType = (role: string) => {
  switch (role) {
    case '管理员':
      return 'danger'
    case '教师':
      return 'primary'
    case '学生':
      return 'success'
    default:
      return 'info'
  }
}

// 渲染系统活跃度图表
const renderActivityChart = () => {
  if (!activityChartRef.value) return

  if (!activityChart) {
    activityChart = echarts.init(activityChartRef.value)
  }

  // 根据时间范围生成不同数据
  let xAxisData: string[] = []
  let userData: number[] = []
  let examData: number[] = []

  if (activeTimeRange.value === 'week') {
    xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    userData = [120, 132, 101, 134, 90, 50, 40]
    examData = [20, 32, 11, 34, 25, 0, 0]
  } else if (activeTimeRange.value === 'month') {
    xAxisData = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
    userData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 150) + 50)
    examData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 40))
  } else {
    xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    userData = [520, 432, 501, 534, 690, 230, 210, 320, 490, 530, 410, 680]
    examData = [120, 132, 101, 134, 90, 30, 10, 20, 90, 130, 110, 180]
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['活跃用户', '考试次数'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: [
      {
        type: 'value',
        name: '用户数',
        position: 'left'
      },
      {
        type: 'value',
        name: '考试次数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '活跃用户',
        type: 'line',
        smooth: true,
        data: userData,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '考试次数',
        type: 'bar',
        yAxisIndex: 1,
        data: examData,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }

  activityChart.setOption(option)
}

// 渲染用户组成图表
const renderUserChart = () => {
  if (!userChartRef.value) return

  if (!userChart) {
    userChart = echarts.init(userChartRef.value)
  }

  let data = []

  if (userChartType.value === 'role') {
    data = [
      { value: 320, name: '学生' },
      { value: 98, name: '教师' },
      { value: 28, name: '管理员' }
    ]
  } else {
    data = [
      { value: 220, name: '计算机学院' },
      { value: 180, name: '数学学院' },
      { value: 150, name: '物理学院' },
      { value: 120, name: '化学学院' },
      { value: 100, name: '生物学院' },
      { value: 80, name: '经济学院' },
      { value: 60, name: '医学院' },
      { value: 30, name: '艺术学院' }
    ]
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 0,
      data: data.map(item => item.name)
    },
    series: [
      {
        name: userChartType.value === 'role' ? '用户角色' : '学院分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }

  userChart.setOption(option)
}

// 监听时间范围变化
const watchTimeRange = () => {
  renderActivityChart()
}

// 监听用户图表类型变化
const watchUserChartType = () => {
  renderUserChart()
}

// 监听窗口大小变化
const handleResize = () => {
  activityChart?.resize()
  userChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    renderActivityChart()
    renderUserChart()

    // 监听选项变化
    watch(activeTimeRange, watchTimeRange)
    watch(userChartType, watchUserChartType)

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  clearInterval(timeInterval)
  window.removeEventListener('resize', handleResize)
  activityChart?.dispose()
  userChart?.dispose()
})

// watch函数定义
const watch = (ref: any, callback: () => void) => {
  let oldValue = ref.value
  setInterval(() => {
    if (oldValue !== ref.value) {
      oldValue = ref.value
      callback()
    }
  }, 100)
}
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.welcome-card {
  margin-bottom: 0;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.welcome-subtitle {
  margin-top: 5px;
  font-size: 14px;
  opacity: 0.8;
}

.welcome-time {
  text-align: right;
}

.date {
  font-size: 16px;
  margin-bottom: 5px;
}

.time {
  font-size: 24px;
  font-weight: bold;
}

.stat-card {
  height: 100%;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.stat-card-content {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.trend-up {
  color: #67C23A;
  margin-right: 5px;
}

.trend-down {
  color: #F56C6C;
  margin-right: 5px;
}

.trend-period {
  color: #909399;
}

.chart-card {
  margin-bottom: 0;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 350px;
}

.data-card {
  margin-bottom: 0;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .statistics-container {
    padding: 10px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .welcome-title h2 {
    font-size: 20px;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style> 