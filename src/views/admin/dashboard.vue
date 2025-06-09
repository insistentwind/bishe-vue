<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h2>系统控制台</h2>
      <div class="header-right">
        <span class="time-display">{{ currentTime }}</span>
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="admin-info">
            <el-avatar :size="32" :src="adminInfo.avatar" />
            <span class="admin-name">{{ adminInfo.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item command="password">修改密码</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 数据概览卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card user-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="card-data">
                <div class="card-value">{{ stats.userCount }}</div>
                <div class="card-title">系统用户</div>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend up">
                <el-icon><ArrowUp /></el-icon> {{ stats.userGrowth }}%
              </span>
              <span class="period">较上周</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card college-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><School /></el-icon>
              </div>
              <div class="card-data">
                <div class="card-value">{{ stats.collegeCount }}</div>
                <div class="card-title">学院数量</div>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend steady">
                <el-icon><PriceTag /></el-icon> 稳定
              </span>
              <span class="period">较上月</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card class-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><OfficeBuilding /></el-icon>
              </div>
              <div class="card-data">
                <div class="card-value">{{ stats.classCount }}</div>
                <div class="card-title">班级总数</div>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend up">
                <el-icon><ArrowUp /></el-icon> {{ stats.classGrowth }}%
              </span>
              <span class="period">较上月</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card activity-card">
            <div class="card-content">
              <div class="card-icon">
                <el-icon><Histogram /></el-icon>
              </div>
              <div class="card-data">
                <div class="card-value">{{ stats.activityCount }}</div>
                <div class="card-title">活跃用户</div>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend up">
                <el-icon><ArrowUp /></el-icon> {{ stats.activityGrowth }}%
              </span>
              <span class="period">今日</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表和列表区域 -->
    <div class="data-section">
      <el-row :gutter="20">
        <!-- 用户分布图表 -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>用户分布</span>
                <el-radio-group v-model="userChartType" size="small">
                  <el-radio-button label="role">角色</el-radio-button>
                  <el-radio-button label="college">学院</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="userChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <!-- 系统访问趋势图表 -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>系统访问趋势</span>
                <el-radio-group v-model="visitChartType" size="small">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="visitChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 快捷入口区域 -->
    <div class="quick-entry">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        <div class="entry-grid">
          <div class="entry-item" @click="navigate('/admin/user')">
            <el-icon class="entry-icon"><UserFilled /></el-icon>
            <div class="entry-text">用户管理</div>
          </div>
          <div class="entry-item" @click="navigate('/admin/college')">
            <el-icon class="entry-icon"><School /></el-icon>
            <div class="entry-text">学院管理</div>
          </div>
          <div class="entry-item" @click="navigate('/admin/class')">
            <el-icon class="entry-icon"><OfficeBuilding /></el-icon>
            <div class="entry-text">班级管理</div>
          </div>
          <div class="entry-item" @click="navigate('/admin/teacher')">
            <el-icon class="entry-icon"><Avatar /></el-icon>
            <div class="entry-text">教师管理</div>
          </div>
          <div class="entry-item" @click="navigate('/admin/student')">
            <el-icon class="entry-icon"><User /></el-icon>
            <div class="entry-text">学生管理</div>
          </div>
          <div class="entry-item" @click="navigate('/admin/course')">
            <el-icon class="entry-icon"><Reading /></el-icon>
            <div class="entry-text">课程管理</div>
          </div>
          <div class="entry-item" @click="navigate('/admin/exam')">
            <el-icon class="entry-icon"><Document /></el-icon>
            <div class="entry-text">考试管理</div>
          </div>
          <div class="entry-item" @click="navigate('/admin/system')">
            <el-icon class="entry-icon"><Setting /></el-icon>
            <div class="entry-text">系统设置</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 最近活动区域 -->
    <div class="recent-activity">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>最近系统活动</span>
            <el-button type="primary" link>查看全部</el-button>
          </div>
        </template>
        <div class="activity-list">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in recentActivities"
              :key="index"
              :type="activity.type"
              :color="activity.color"
              :timestamp="activity.time"
              :hollow="activity.hollow"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  User, UserFilled, School, OfficeBuilding, Histogram, ArrowUp, ArrowDown, 
  Setting, PriceTag, Reading, Document, Avatar
} from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()
const currentTime = ref(new Date().toLocaleString())
const userChartRef = ref<HTMLElement>()
const visitChartRef = ref<HTMLElement>()
let userChart: echarts.ECharts | null = null
let visitChart: echarts.ECharts | null = null
const userChartType = ref('role')
const visitChartType = ref('week')

// 管理员信息
const adminInfo = reactive({
  id: localStorage.getItem('admin_id') || '',
  name: localStorage.getItem('admin_name') || '管理员',
  avatar: localStorage.getItem('admin_avatar') || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  role: localStorage.getItem('admin_role') || 'ADMIN'
})

// 系统统计数据
const stats = reactive({
  userCount: 2453,
  userGrowth: 8.2,
  collegeCount: 12,
  collegeGrowth: 0,
  classCount: 82,
  classGrowth: 5.6,
  activityCount: 589,
  activityGrowth: 12.4
})

// 最近活动数据
const recentActivities = ref([
  {
    content: '系统管理员更新了系统配置',
    time: '2025-05-03 20:46',
    type: 'primary',
    color: '#409EFF',
    hollow: false
  },
  {
    content: '添加了新学院：人工智能学院',
    time: '2025-05-03 18:30',
    type: 'success',
    color: '#67C23A',
    hollow: false
  },
  {
    content: '导入了100名新学生账号',
    time: '2025-05-03 15:20',
    type: 'info',
    color: '#909399',
    hollow: false
  },
  {
    content: '系统完成了每日数据备份',
    time: '2025-05-03 03:00',
    type: 'warning',
    color: '#E6A23C',
    hollow: true
  },
  {
    content: '系统升级维护完成',
    time: '2025-05-02 23:30',
    type: 'danger',
    color: '#F56C6C',
    hollow: true
  }
])

// 定时器更新时间
let timer: any = null
const startTimer = () => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'settings':
      router.push('/admin/settings')
      break
    case 'password':
      router.push('/admin/password')
      break
    case 'logout':
      ElMessageBox.confirm(
        '确定要退出系统吗?',
        '退出提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 清除管理员数据
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_id')
        localStorage.removeItem('admin_name')
        localStorage.removeItem('admin_avatar')
        localStorage.removeItem('admin_role')
        
        // 清除Store数据
        adminStore.clearAdminInfo()
        
        ElMessage.success('已安全退出系统')
        router.push('/admin/login')
      }).catch(() => {
        // 取消退出
      })
      break
  }
}

// 导航到指定页面
const navigate = (path: string) => {
  router.push(path)
}

// 初始化用户分布图表
const initUserChart = () => {
  if (userChartRef.value) {
    userChart = echarts.init(userChartRef.value)
    
    // 根据类型显示不同数据
    if (userChartType.value === 'role') {
      userChart.setOption({
        title: {
          text: '用户角色分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['学生', '教师', '管理员', '其他']
        },
        series: [
          {
            name: '用户角色',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 1850, name: '学生' },
              { value: 420, name: '教师' },
              { value: 25, name: '管理员' },
              { value: 158, name: '其他' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    } else {
      userChart.setOption({
        title: {
          text: '学院用户分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['计算机学院', '信息工程学院', '机械学院', '电气学院', '外国语学院', '其他']
        },
        series: [
          {
            name: '用户数量',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 620, name: '计算机学院' },
              { value: 535, name: '信息工程学院' },
              { value: 410, name: '机械学院' },
              { value: 385, name: '电气学院' },
              { value: 300, name: '外国语学院' },
              { value: 203, name: '其他' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
    }
  }
}

// 初始化访问趋势图表
const initVisitChart = () => {
  if (visitChartRef.value) {
    visitChart = echarts.init(visitChartRef.value)
    
    // 根据类型显示不同数据
    if (visitChartType.value === 'week') {
      visitChart.setOption({
        title: {
          text: '本周系统访问量',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '访问量',
            type: 'line',
            data: [820, 932, 901, 934, 1290, 530, 320],
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          }
        ]
      })
    } else {
      visitChart.setOption({
        title: {
          text: '本月系统访问量',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['第1周', '第2周', '第3周', '第4周']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '访问量',
            type: 'bar',
            data: [3200, 4500, 5800, 6200],
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          }
        ]
      })
    }
  }
}

// 监听图表类型变化
watch(userChartType, () => {
  nextTick(() => {
    initUserChart()
  })
})

watch(visitChartType, () => {
  nextTick(() => {
    initVisitChart()
  })
})

// 组件挂载时
onMounted(() => {
  startTimer()
  
  // 初始化图表
  nextTick(() => {
    initUserChart()
    initVisitChart()
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
  })
})

// 组件卸载时
onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer)
  }
  
  // 清除图表实例
  if (userChart) {
    userChart.dispose()
  }
  if (visitChart) {
    visitChart.dispose()
  }
  
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
})

// 处理窗口大小变化
const handleResize = () => {
  if (userChart) {
    userChart.resize()
  }
  if (visitChart) {
    visitChart.resize()
  }
}
</script>

<style lang="scss" scoped>
.admin-dashboard {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    
    .time-display {
      margin-right: 20px;
      color: #606266;
      font-size: 14px;
    }
    
    .admin-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      .admin-name {
        margin: 0 5px 0 10px;
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

.stat-cards {
  margin-bottom: 20px;
  
  .stat-card {
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    .card-content {
      display: flex;
      align-items: center;
    }
    
    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      
      .el-icon {
        font-size: 28px;
        color: #fff;
      }
    }
    
    .card-data {
      flex: 1;
      
      .card-value {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 5px;
      }
      
      .card-title {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .card-footer {
      margin-top: 20px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .trend {
        display: flex;
        align-items: center;
        
        .el-icon {
          margin-right: 4px;
        }
        
        &.up {
          color: #67C23A;
        }
        
        &.down {
          color: #F56C6C;
        }
        
        &.steady {
          color: #E6A23C;
        }
      }
      
      .period {
        color: #909399;
      }
    }
  }
  
  .user-card .card-icon {
    background-color: #409EFF;
  }
  
  .college-card .card-icon {
    background-color: #67C23A;
  }
  
  .class-card .card-icon {
    background-color: #E6A23C;
  }
  
  .activity-card .card-icon {
    background-color: #F56C6C;
  }
}

.data-section {
  margin-bottom: 20px;
  
  .chart-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chart-container {
      height: 300px;
    }
  }
}

.quick-entry {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .entry-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    
    .entry-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      padding: 15px;
      border-radius: 4px;
      
      &:hover {
        background-color: #f5f7fa;
        transform: scale(1.05);
      }
      
      .entry-icon {
        font-size: 32px;
        color: #409EFF;
        margin-bottom: 10px;
      }
      
      .entry-text {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

.recent-activity {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .activity-list {
    max-height: 300px;
    overflow-y: auto;
  }
}

@media screen and (max-width: 992px) {
  .quick-entry .entry-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .stat-cards {
    .el-col {
      margin-bottom: 20px;
    }
  }
}
</style> 