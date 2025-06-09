<template>
  <div class="class-management">
    <el-card class="class-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>班级管理</span>
          <el-button type="primary" @click="handleAdd">添加班级</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="班级名称">
            <el-input v-model="searchForm.className" placeholder="搜索班级名称" clearable @clear="handleSearch" />
          </el-form-item>
          <el-form-item label="所属专业">
            <el-select v-model="searchForm.majorId" placeholder="选择专业" clearable>
              <el-option 
                v-for="major in majorList" 
                :key="major.id" 
                :label="major.majorName" 
                :value="major.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属学院">
            <el-select v-model="searchForm.collegeId" placeholder="选择学院" clearable>
              <el-option 
                v-for="college in collegeList" 
                :key="college.id" 
                :label="college.collegeName" 
                :value="college.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="入学年份">
            <el-date-picker
              v-model="searchForm.entranceYear"
              type="year"
              placeholder="选择年份"
              value-format="YYYY"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table
        :data="classList"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
        element-loading-text="加载中..."
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="className" label="班级名称" align="left" min-width="120" />
        <el-table-column prop="majorName" label="所属专业" align="center" min-width="120" />
        <el-table-column prop="collegeName" label="所属学院" align="center" min-width="120" />
        <el-table-column prop="entranceYear" label="入学年份" align="center" width="100" />
        <el-table-column prop="headTeacherName" label="班主任" align="center" width="100" />
        <el-table-column prop="studentCount" label="学生人数" align="center" width="90" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '在读' : '已毕业' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
              :icon="Edit"
              circle
              title="编辑"
            />
            <el-button
              size="small"
              type="success"
              @click="handleStudents(scope.row)"
              :icon="User"
              circle
              title="学生列表"
            />
            <el-button
              size="small"
              type="info"
              @click="viewDetail(scope.row)"
              :icon="InfoFilled"
              circle
              title="详情"
            />
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
              :icon="Delete"
              circle
              title="删除"
            />
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchForm.pageNum"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑班级对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑班级' : '添加班级'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="classFormRef"
        :model="classForm"
        :rules="classRules"
        label-width="100px"
      >
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="classForm.className" placeholder="请输入班级名称" />
        </el-form-item>
        
        <el-form-item label="所属学院" prop="collegeId">
          <el-select v-model="classForm.collegeId" placeholder="请选择学院" style="width: 100%" @change="handleCollegeChange">
            <el-option 
              v-for="college in collegeList" 
              :key="college.id" 
              :label="college.collegeName" 
              :value="college.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="所属专业" prop="majorId">
          <el-select v-model="classForm.majorId" placeholder="请选择专业" style="width: 100%">
            <el-option 
              v-for="major in filteredMajorList" 
              :key="major.id" 
              :label="major.majorName" 
              :value="major.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="入学年份" prop="entranceYear">
          <el-date-picker
            v-model="classForm.entranceYear"
            type="year"
            placeholder="选择入学年份"
            value-format="YYYY"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="班主任" prop="headTeacherId">
          <el-select v-model="classForm.headTeacherId" placeholder="请选择教师" style="width: 100%">
            <el-option 
              v-for="teacher in teacherList" 
              :key="teacher.id" 
              :label="teacher.name" 
              :value="teacher.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="班级状态" prop="status">
          <el-radio-group v-model="classForm.status">
            <el-radio :label="1">在读</el-radio>
            <el-radio :label="0">已毕业</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="班级描述" prop="description">
          <el-input 
            v-model="classForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入班级描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="班级详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="currentClass">
        <el-descriptions-item label="班级ID">{{ currentClass.id }}</el-descriptions-item>
        <el-descriptions-item label="班级名称">{{ currentClass.className }}</el-descriptions-item>
        <el-descriptions-item label="所属专业">{{ currentClass.majorName }}</el-descriptions-item>
        <el-descriptions-item label="所属学院">{{ currentClass.collegeName }}</el-descriptions-item>
        <el-descriptions-item label="入学年份">{{ currentClass.entranceYear }}</el-descriptions-item>
        <el-descriptions-item label="班主任">{{ currentClass.headTeacherName || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="学生人数">{{ currentClass.studentCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentClass.status === 1 ? 'success' : 'danger'">
            {{ currentClass.status === 1 ? '在读' : '已毕业' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentClass.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(currentClass.updateTime) }}</el-descriptions-item>
        
        <el-descriptions-item label="班级描述" :span="2">
          {{ currentClass.description || '暂无描述' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, InfoFilled, User } from '@element-plus/icons-vue'

// 定义班级信息接口
interface ClassInfo {
  id?: number;
  className: string;
  majorId?: number;
  majorName?: string;
  collegeId?: number;
  collegeName?: string;
  entranceYear?: string;
  headTeacherId?: number;
  headTeacherName?: string;
  studentCount?: number;
  status: number;
  description?: string;
  createTime?: string;
  updateTime?: string;
}

// 定义专业信息接口
interface MajorInfo {
  id: number;
  majorName: string;
  collegeId: number;
}

// 定义学院信息接口
interface CollegeInfo {
  id: number;
  collegeName: string;
}

// 定义教师信息接口
interface TeacherInfo {
  id: number;
  name: string;
}

// 搜索表单数据
const searchForm = reactive({
  pageNum: 1,
  pageSize: 10,
  className: '',
  majorId: undefined as number | undefined,
  collegeId: undefined as number | undefined,
  entranceYear: undefined as string | undefined
})

// 班级表单数据
const classForm = reactive<ClassInfo>({
  className: '',
  majorId: undefined,
  collegeId: undefined,
  entranceYear: undefined,
  headTeacherId: undefined,
  status: 1,
  description: ''
})

// 校验规则
const classRules = {
  className: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  collegeId: [
    { required: true, message: '请选择所属学院', trigger: 'change' }
  ],
  majorId: [
    { required: true, message: '请选择所属专业', trigger: 'change' }
  ],
  entranceYear: [
    { required: true, message: '请选择入学年份', trigger: 'change' }
  ],
  headTeacherId: [
    { required: true, message: '请选择班主任', trigger: 'change' }
  ]
}

// 列表数据
const loading = ref(false)
const submitting = ref(false)
const classList = ref<ClassInfo[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const currentClass = ref<ClassInfo | null>(null)
const classFormRef = ref()

// 选项数据
const collegeList = ref<CollegeInfo[]>([])
const majorList = ref<MajorInfo[]>([])
const teacherList = ref<TeacherInfo[]>([])

// 根据选择的学院过滤专业列表
const filteredMajorList = computed(() => {
  if (!classForm.collegeId) {
    return majorList.value
  }
  return majorList.value.filter(major => major.collegeId === classForm.collegeId)
})

// 学院选择变化
const handleCollegeChange = () => {
  // 清空专业选择
  classForm.majorId = undefined
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '-'
  try {
    // 使用原生JavaScript方法格式化日期
    const dateObj = new Date(date)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    const seconds = String(dateObj.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (e) {
    return date
  }
}

// 初始化函数
onMounted(() => {
  // 加载数据
  loadColleges()
  loadMajors()
  loadTeachers()
  getClassListData()
})

// 获取学院列表
const loadColleges = () => {
  // 模拟数据
  collegeList.value = [
    { id: 1, collegeName: '计算机学院' },
    { id: 2, collegeName: '数学学院' },
    { id: 3, collegeName: '物理学院' },
    { id: 4, collegeName: '外国语学院' }
  ]
}

// 获取专业列表
const loadMajors = () => {
  // 模拟数据
  majorList.value = [
    { id: 1, majorName: '软件工程', collegeId: 1 },
    { id: 2, majorName: '计算机科学与技术', collegeId: 1 },
    { id: 3, majorName: '人工智能', collegeId: 1 },
    { id: 4, majorName: '数学与应用数学', collegeId: 2 },
    { id: 5, majorName: '统计学', collegeId: 2 },
    { id: 6, majorName: '物理学', collegeId: 3 },
    { id: 7, majorName: '英语', collegeId: 4 }
  ]
}

// 获取教师列表
const loadTeachers = () => {
  // 模拟数据
  teacherList.value = [
    { id: 1, name: '齐佳宁' },
    { id: 2, name: '齐佳宁' },
    { id: 3, name: '齐佳宁' },
    { id: 4, name: '齐佳宁' }
  ]
}

// 获取班级列表数据
const getClassListData = async () => {
  loading.value = true
  try {
    // 模拟后端返回的数据
    setTimeout(() => {
      // 假数据
      const mockData = {
        code: 200,
        msg: '操作成功',
        data: {
          total: 15,
          records: [
            {
              id: 1,
              className: '软件2025-1班',
              majorId: 1,
              majorName: '软件工程',
              collegeId: 1,
              collegeName: '计算机学院',
              entranceYear: '2025',
              headTeacherId: 1,
              headTeacherName: '齐佳宁',
              studentCount: 38,
              status: 1,
              description: '这是一个优秀的班级',
              createTime: '2025-09-01 08:00:00',
              updateTime: '2025-06-15 14:30:00'
            },
            {
              id: 2,
              className: '软件2025-2班',
              majorId: 1,
              majorName: '软件工程',
              collegeId: 1,
              collegeName: '计算机学院',
              entranceYear: '2025',
              headTeacherId: 2,
              headTeacherName: '齐佳宁',
              studentCount: 40,
              status: 1,
              description: '这是软件工程专业的第二个班级',
              createTime: '2025-09-01 08:30:00',
              updateTime: '2025-06-15 14:35:00'
            },
            {
              id: 3,
              className: '计科2025-1班',
              majorId: 2,
              majorName: '计算机科学与技术',
              collegeId: 1,
              collegeName: '计算机学院',
              entranceYear: '2025',
              headTeacherId: 3,
              headTeacherName: '齐佳宁',
              studentCount: 42,
              status: 1,
              description: '计算机科学与技术专业1班',
              createTime: '2025-09-01 09:00:00',
              updateTime: '2025-06-16 10:20:00'
            },
            {
              id: 4,
              className: '数学2025-1班',
              majorId: 4,
              majorName: '数学与应用数学',
              collegeId: 2,
              collegeName: '数学学院',
              entranceYear: '2025',
              headTeacherId: 4,
              headTeacherName: '齐佳宁',
              studentCount: 35,
              status: 1,
              description: '数学与应用数学专业班级',
              createTime: '2025-09-01 09:30:00',
              updateTime: '2025-06-17 11:15:00'
            },
            {
              id: 5,
              className: '英语2025-1班',
              majorId: 7,
              majorName: '英语',
              collegeId: 4,
              collegeName: '外国语学院',
              entranceYear: '2025',
              headTeacherId: 1,
              headTeacherName: '齐佳宁',
              studentCount: 45,
              status: 1,
              description: '英语专业班级',
              createTime: '2025-09-01 10:00:00',  
              updateTime: '2025-06-18 14:00:00'
            },
            {
              id: 6,
              className: '物理2025-1班',
              majorId: 6,
              majorName: '物理学',
              collegeId: 3,
              collegeName: '物理学院',
              entranceYear: '2025',
              headTeacherId: 2,
              headTeacherName: '齐佳宁',
              studentCount: 32,
              status: 0,
              description: '物理学专业2025级班级，即将毕业',
              createTime: '2025-09-01 08:00:00',
              updateTime: '2025-05-20 15:30:00'
            }
          ]
        }
      }
      
      const { total: totalCount, records } = mockData.data
      classList.value = records
      total.value = totalCount
      loading.value = false
    }, 500)
  } catch (error: any) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败: ' + (error.message || '未知错误'))
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  searchForm.pageNum = 1
  getClassListData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.className = ''
  searchForm.majorId = undefined
  searchForm.collegeId = undefined
  searchForm.entranceYear = undefined
  searchForm.pageNum = 1
  getClassListData()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  searchForm.pageSize = size
  getClassListData()
}

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  searchForm.pageNum = page
  getClassListData()
}

// 处理添加班级
const handleAdd = () => {
  isEdit.value = false
  resetClassForm()
  dialogVisible.value = true
}

// 重置班级表单
const resetClassForm = () => {
  Object.assign(classForm, {
    className: '',
    majorId: undefined,
    collegeId: undefined,
    entranceYear: undefined,
    headTeacherId: undefined,
    status: 1,
    description: ''
  })
}

// 处理编辑班级
const handleEdit = (row: ClassInfo) => {
  isEdit.value = true
  resetClassForm()
  
  // 填充表单数据
  Object.assign(classForm, {
    id: row.id,
    className: row.className,
    majorId: row.majorId,
    collegeId: row.collegeId,
    entranceYear: row.entranceYear,
    headTeacherId: row.headTeacherId,
    status: row.status,
    description: row.description
  })
  
  dialogVisible.value = true
}

// 查看班级详情
const viewDetail = (row: ClassInfo) => {
  currentClass.value = { ...row }
  detailDialogVisible.value = true
}

// 处理学生列表
const handleStudents = (row: ClassInfo) => {
  ElMessage.info(`查看班级 ${row.className} 的学生列表功能待实现`)
}

// 处理删除班级
const handleDelete = (row: ClassInfo) => {
  ElMessageBox.confirm(
    `确定要删除班级"${row.className}"吗？此操作将不可逆`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟删除操作
      setTimeout(() => {
        const index = classList.value.findIndex(item => item.id === row.id)
        if (index > -1) {
          classList.value.splice(index, 1)
          total.value--
          ElMessage.success(`已删除班级: ${row.className}`)
        }
      }, 500)
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 提交班级表单
const submitForm = async () => {
  if (!classFormRef.value) return
  
  try {
    await classFormRef.value.validate()
    
    submitting.value = true
    
    // 模拟提交到后端
    setTimeout(() => {
      // 获取当前时间格式化字符串
      const now = new Date()
      const formattedDate = formatDate(now.toString())
      
      if (isEdit.value) {
        // 编辑模式 - 查找并更新班级
        const index = classList.value.findIndex(item => item.id === classForm.id)
        if (index > -1) {
          // 获取对应的名称
          const major = majorList.value.find(m => m.id === classForm.majorId)
          const college = collegeList.value.find(c => c.id === classForm.collegeId)
          const teacher = teacherList.value.find(t => t.id === classForm.headTeacherId)
          
          // 更新数据
          classList.value[index] = {
            ...classList.value[index],
            ...classForm,
            majorName: major?.majorName,
            collegeName: college?.collegeName,
            headTeacherName: teacher?.name,
            updateTime: formattedDate
          }
          
          ElMessage.success('班级更新成功')
        }
      } else {
        // 添加模式 - 创建新班级
        const newId = Math.max(0, ...classList.value.map(item => item.id || 0)) + 1
        
        // 获取对应的名称
        const major = majorList.value.find(m => m.id === classForm.majorId)
        const college = collegeList.value.find(c => c.id === classForm.collegeId)
        const teacher = teacherList.value.find(t => t.id === classForm.headTeacherId)
        
        // 创建新班级
        const newClass: ClassInfo = {
          id: newId,
          className: classForm.className,
          majorId: classForm.majorId,
          majorName: major?.majorName,
          collegeId: classForm.collegeId,
          collegeName: college?.collegeName,
          entranceYear: classForm.entranceYear,
          headTeacherId: classForm.headTeacherId,
          headTeacherName: teacher?.name,
          studentCount: 0,
          status: classForm.status,
          description: classForm.description,
          createTime: formattedDate,
          updateTime: formattedDate
        }
        
        classList.value.unshift(newClass)
        total.value++
        
        ElMessage.success('班级创建成功')
      }
      
      dialogVisible.value = false
      submitting.value = false
    }, 500)
  } catch (error: any) {
    console.error('提交班级表单失败:', error)
    ElMessage.error('提交表单失败: ' + (error.message || '未知错误'))
    submitting.value = false
  }
}
</script>

<style scoped>
.class-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}
</style> 