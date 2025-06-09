<template>
  <div class="course-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="left">
        <h2>课程管理</h2>
        <p class="description">管理学校所有课程信息</p>
      </div>
      <div class="right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增课程
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="课程ID">
          <el-input v-model="queryForm.id" placeholder="输入课程ID" clearable />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="queryForm.lessonName" placeholder="输入课程名称" clearable />
        </el-form-item>
        <el-form-item label="学时">
          <el-input v-model="queryForm.hours" placeholder="输入学时" clearable />
        </el-form-item>
        <el-form-item label="学分">
          <el-input v-model="queryForm.score" placeholder="输入学分" clearable />
        </el-form-item>
        <el-form-item label="课程状态">
          <el-select v-model="queryForm.status" placeholder="选择课程状态" clearable>
            <el-option label="已结课" :value="0" />
            <el-option label="未结课" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新时间">
          <el-date-picker
            v-model="queryForm.updateTime"
            type="date"
            placeholder="选择更新日期"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadCourseList()">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="action-card">
      <div class="action-bar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新增课程</el-button>
          <el-button 
            type="danger" 
            :icon="Delete" 
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button 
            :icon="Check" 
            :disabled="selectedIds.length === 0"
            @click="handleBatchEnable"
          >
            批量开课
          </el-button>
          <el-button 
            :icon="Close" 
            :disabled="selectedIds.length === 0"
            @click="handleBatchDisable"
          >
            批量结课
          </el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据" placement="top">
            <el-button :icon="Refresh" circle @click="loadCourseList" />
          </el-tooltip>
        </div>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="courseList"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="lessonName" label="课程名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="teacherName" label="授课教师" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="row.teacherName || row.name" class="teacher-cell">
              <el-avatar 
                :size="28" 
                :src="row.avatar || '/avatar-default.png'" 
                class="teacher-avatar"
              />
              <div class="teacher-info">
                <div class="teacher-name">{{ row.teacherName || row.name }}</div>
                <div class="teacher-contact">{{ row.phone || row.email || '' }}</div>
              </div>
            </div>
            <span v-else class="no-teacher">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="hours" label="学时" width="80" align="center" />
        <el-table-column prop="score" label="学分" width="80" align="center" />
        <el-table-column prop="capacity" label="容量" width="80" align="center" />
        <el-table-column prop="classTime" label="上课时间" min-width="120" show-overflow-tooltip />
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '未结课' : '已结课' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="updateTime" label="更新时间" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button 
              type="primary" 
              link 
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              link 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '结课' : '开课' }}
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="课程详情"
      width="750px"
      top="5vh"
      :before-close="() => detailVisible = false"
      destroy-on-close
    >
      <div class="course-detail" v-if="currentCourse">
        <div class="detail-header">
          <h2>{{ currentCourse.lessonName }}</h2>
          <el-tag :type="currentCourse.status === 1 ? 'success' : 'info'">
            {{ currentCourse.status === 1 ? '未结课' : '已结课' }}
          </el-tag>
        </div>
        
        <div class="detail-tabs">
          <el-tabs type="border-card">
            <el-tab-pane label="基本信息">
              <div class="detail-info">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">课程ID:</span>
                    <span class="value">{{ currentCourse.id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">学时:</span>
                    <span class="value">{{ currentCourse.hours }} 小时</span>
                  </div>
                  <div class="info-item">
                    <span class="label">学分:</span>
                    <span class="value">{{ currentCourse.score }} 分</span>
                  </div>
                  <div class="info-item">
                    <span class="label">容量:</span>
                    <span class="value">{{ currentCourse.capacity }} 人</span>
                  </div>
                  <div class="info-item">
                    <span class="label">上课时间:</span>
                    <span class="value">{{ currentCourse.classTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">创建时间:</span>
                    <span class="value">{{ formatDate(currentCourse.createTime) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">更新时间:</span>
                    <span class="value">{{ formatDate(currentCourse.updateTime) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="description-section">
                <h3 class="section-title">
                  <el-icon><Document /></el-icon>
                  课程介绍
                </h3>
                <div class="description-content">
                  <span v-if="currentCourse.introduction">{{ currentCourse.introduction }}</span>
                  <el-empty v-else description="暂无课程介绍" :image-size="80"></el-empty>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="教师信息">
              <div v-if="currentCourse?.teacherId || currentCourse?.teacherName || currentCourse?.name" class="teacher-info">
                <div class="teacher-card">
                  <div class="teacher-avatar">
                    <el-avatar 
                      :size="100" 
                      :src="currentCourse?.avatar || '/avatar-default.png'" 
                      fit="cover"
                    />
                  </div>
                  <div class="teacher-detail">
                    <div class="teacher-name-row">
                      <span class="teacher-name">{{ currentCourse?.teacherName || currentCourse?.name || '未知' }}</span>
                      <el-tag size="small" type="success" v-if="currentCourse?.identity">{{ currentCourse?.identity }}</el-tag>
                    </div>
                    
                    <div class="teacher-contact-row">
                      <div class="contact-item" v-if="currentCourse?.phone">
                        <el-icon><Phone /></el-icon>
                        <span>{{ currentCourse?.phone }}</span>
                      </div>
                      <div class="contact-item" v-if="currentCourse?.email">
                        <el-icon><Message /></el-icon>
                        <span>{{ currentCourse?.email }}</span>
                      </div>
                    </div>
                    
                    <el-descriptions :column="2" border size="small" class="teacher-details-table">
                      <el-descriptions-item label="账号" v-if="currentCourse?.username">
                        {{ currentCourse?.username }}
                      </el-descriptions-item>
                      <el-descriptions-item label="性别" v-if="currentCourse?.sex">
                        {{ currentCourse?.sex === 1 ? '男' : currentCourse?.sex === 2 ? '女' : '未知' }}
                      </el-descriptions-item>
                      <el-descriptions-item label="身份证号" v-if="currentCourse?.IdCard">
                        {{ hideIdCard(currentCourse?.IdCard) }}
                      </el-descriptions-item>
                      <el-descriptions-item label="角色ID" v-if="currentCourse?.roleId">
                        {{ currentCourse?.roleId }}
                      </el-descriptions-item>
                    </el-descriptions>
                    
                    <div class="teacher-description" v-if="currentCourse?.description">
                      <h4>个人简介</h4>
                      <div class="description-content">
                        {{ currentCourse?.description }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="未分配教师" :image-size="100"></el-empty>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="currentCourse && handleEdit(currentCourse)">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Check, Close, Refresh, Document, Phone, Message } from '@element-plus/icons-vue'
import type { ApiResponse } from '@/request/admin'

// 课程类型定义
interface Course {
  id: number
  lessonName: string
  hours: string
  score: string
  classTime: string
  introduction: string
  teacherName?: string
  teacherId?: number
  capacity: number
  status: number
  createTime?: string
  updateTime?: string
  collegeId?: number
  // 教师相关信息
  name?: string
  username?: string
  phone?: string
  sex?: number
  avatar?: string
  password?: string
  roleId?: number
  description?: string
  IdCard?: string
  email?: string
  identity?: string
}

// 课程查询参数
interface CourseQuery {
  pageNum: number
  pageSize: number
  id?: number
  lessonName?: string
  hours?: string
  score?: string
  status?: number
  capacity?: number
  classTime?: string
  introduction?: string
  createTime?: string
  updateTime?: string
}

// 课程列表查询响应
interface CourseListResponse {
  total: number
  records: Course[]
}

// 导入API方法
import { 
  getCourseList,
  deleteCourse,
  batchDeleteCourse,
  enableCourse,
  disableCourse,
  batchEnableCourse,
  batchDisableCourse
} from '@/api/course'

import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const courseList = ref<Course[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const detailVisible = ref(false)
const currentCourse = ref<Course | null>(null)

// 查询表单
const queryForm = reactive<CourseQuery>({
  pageNum: 1,
  pageSize: 10,
  id: undefined,
  lessonName: undefined,
  hours: undefined,
  score: undefined,
  status: undefined,
  capacity: undefined,
  classTime: undefined,
  introduction: undefined,
  updateTime: undefined
})

// 表格多选
const handleSelectionChange = (selection: Course[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 加载课程列表
const loadCourseList = async () => {
  loading.value = true
  try {
    const res = await getCourseList(queryForm) as ApiResponse<CourseListResponse>
    if (res.code === 200) {
      courseList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取课程列表失败')
    }
  } catch (error) {
    console.error('加载课程列表失败:', error)
    ElMessage.error('获取课程列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  queryForm.pageSize = size
  loadCourseList()
}

const handleCurrentChange = (current: number) => {
  queryForm.pageNum = current
  loadCourseList()
}

// 重置查询条件
const resetQuery = () => {
  queryForm.id = undefined
  queryForm.lessonName = undefined
  queryForm.hours = undefined
  queryForm.score = undefined
  queryForm.status = undefined
  queryForm.capacity = undefined
  queryForm.classTime = undefined
  queryForm.introduction = undefined
  queryForm.updateTime = undefined
  loadCourseList()
}

// 查看课程详情
const handleView = (row: Course) => {
  currentCourse.value = { ...row }
  detailVisible.value = true
}

// 新增课程
const handleCreate = () => {
  router.push({ name: 'CourseForm' })
}

// 编辑课程
const handleEdit = (row: Course) => {
  detailVisible.value = false
  router.push({ 
    name: 'CourseForm', 
    query: { id: row.id.toString() } 
  })
}

// 切换课程状态
const handleToggleStatus = async (row: Course) => {
  try {
    if (row.status === 1) {
      // 结课
      await disableCourse(row.id)
      ElMessage.success('课程已结课')
    } else {
      // 开课
      await enableCourse(row.id)
      ElMessage.success('课程已开课')
    }
    loadCourseList()
  } catch (error) {
    console.error('修改课程状态失败:', error)
    ElMessage.error('修改课程状态失败，请稍后重试')
  }
}

// 删除课程
const handleDelete = (row: Course) => {
  ElMessageBox.confirm(`确定要删除课程「${row.lessonName}」吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCourse(row.id)
      ElMessage.success('删除成功')
      loadCourseList()
    } catch (error) {
      console.error('删除课程失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的课程')
    return
  }
  
  ElMessageBox.confirm(`确定要删除已选中的 ${selectedIds.value.length} 个课程吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await batchDeleteCourse(selectedIds.value)
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      loadCourseList()
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败，请稍后重试')
    }
  }).catch(() => {})
}

// 批量开课
const handleBatchEnable = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要开课的课程')
    return
  }
  
  ElMessageBox.confirm(`确定要将已选中的 ${selectedIds.value.length} 个课程开课吗？`, '批量开课', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await batchEnableCourse(selectedIds.value)
      ElMessage.success('批量开课成功')
      loadCourseList()
    } catch (error) {
      console.error('批量开课失败:', error)
      ElMessage.error('批量开课失败，请稍后重试')
    }
  }).catch(() => {})
}

// 批量结课
const handleBatchDisable = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要结课的课程')
    return
  }
  
  ElMessageBox.confirm(`确定要将已选中的 ${selectedIds.value.length} 个课程结课吗？`, '批量结课', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await batchDisableCourse(selectedIds.value)
      ElMessage.success('批量结课成功')
      loadCourseList()
    } catch (error) {
      console.error('批量结课失败:', error)
      ElMessage.error('批量结课失败，请稍后重试')
    }
  }).catch(() => {})
}

// 日期格式化
const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 隐藏身份证号码中间部分
const hideIdCard = (idCard?: string) => {
  if (!idCard) return '未提供';
  if (idCard.length < 8) return idCard;
  
  const start = idCard.substring(0, 4);
  const end = idCard.substring(idCard.length - 4);
  return `${start}********${end}`;
}

// 监听路由变化，刷新列表
watch(() => router.currentRoute.value.query, () => {
  loadCourseList()
})

onMounted(() => {
  loadCourseList()
})
</script>

<style lang="scss" scoped>
.course-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .left {
      h2 {
        margin: 0;
        font-size: 22px;
        color: #303133;
      }
      
      .description {
        margin: 8px 0 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .search-card,
  .action-card,
  .table-card {
    margin-bottom: 20px;
  }
  
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .course-detail {
    .detail-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      
      h2 {
        margin: 0 10px 0 0;
        font-size: 22px;
        color: #303133;
      }
    }
    
    .detail-tabs {
      margin-top: 20px;
    }
    
    .detail-info {
      margin-bottom: 20px;
      
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .info-item {
        display: flex;
        align-items: center;
        
        .label {
          width: 80px;
          color: #606266;
          font-weight: bold;
        }
        
        .value {
          flex: 1;
          color: #303133;
        }
      }
    }
    
    .section-title {
      display: flex;
      align-items: center;
      margin-top: 0;
      margin-bottom: 15px;
      padding-bottom: 10px;
      font-size: 16px;
      color: #303133;
      border-bottom: 1px solid #EBEEF5;
      
      .el-icon {
        margin-right: 8px;
        color: #409EFF;
      }
    }
    
    .description-section {
      margin-top: 20px;
      
      .description-content {
        padding: 15px;
        background-color: #f5f7fa;
        border-radius: 4px;
        color: #303133;
        line-height: 1.8;
        min-height: 120px;
      }
    }
    
    .teacher-info {
      .teacher-card {
        display: flex;
        gap: 20px;
        
        .teacher-avatar {
          flex-shrink: 0;
        }
        
        .teacher-detail {
          flex: 1;
          
          .teacher-name-row {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            
            .teacher-name {
              font-size: 18px;
              font-weight: bold;
              color: #303133;
              margin-right: 10px;
            }
          }
          
          .teacher-contact-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            
            .contact-item {
              display: flex;
              align-items: center;
              color: #606266;
              
              .el-icon {
                margin-right: 5px;
                color: #409EFF;
              }
            }
          }
          
          .teacher-details-table {
            margin-bottom: 15px;
          }
          
          .teacher-description {
            h4 {
              margin-top: 15px;
              margin-bottom: 10px;
              font-size: 15px;
              color: #303133;
            }
            
            .description-content {
              padding: 10px;
              background-color: #f5f7fa;
              border-radius: 4px;
              color: #606266;
              line-height: 1.6;
            }
          }
        }
      }
    }
  }
}

.teacher-cell {
  display: flex;
  align-items: center;
}

.teacher-avatar {
  margin-right: 8px;
}

.teacher-info {
  display: flex;
  flex-direction: column;
}

.teacher-name {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
}

.teacher-contact {
  font-size: 12px;
  color: #909399;
}

.no-teacher {
  color: #909399;
  font-style: italic;
}
</style> 