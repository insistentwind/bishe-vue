<template>
  <div class="course-form-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="left">
        <h2>{{ isEdit ? '编辑课程' : '新增课程' }}</h2>
        <p class="description">{{ isEdit ? '修改课程信息' : '创建新的课程' }}</p>
      </div>
      <div class="right">
        <el-button @click="goBack">
          <el-icon><Back /></el-icon>返回
        </el-button>
      </div>
    </div>

    <!-- 表单卡片 -->
    <el-card class="form-card" shadow="hover">
      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="rules" 
        label-width="100px" 
        label-position="right"
        v-loading="loading"
      >
        <el-row :gutter="20">
          <!-- 课程基本信息 -->
          <el-col :span="24">
            <div class="form-section">
              <h3 class="section-title">
                <el-icon class="section-icon"><Files /></el-icon>
                基本信息
              </h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="课程名称" prop="lessonName">
                    <el-input 
                      v-model="formData.lessonName" 
                      placeholder="请输入课程名称" 
                      clearable 
                      :maxlength="50"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所属学院" prop="collegeId">
                    <el-select
                      v-model="formData.collegeId"
                      placeholder="请选择所属学院"
                      clearable
                      filterable
                      style="width: 100%"
                      @change="handleCollegeChange"
                    >
                      <el-option
                        v-for="item in collegeOptions"
                        :key="item.id"
                        :label="item.collegeName"
                        :value="item.id"
                      >
                        <div class="college-option">
                          <span class="college-name">{{ item.collegeName }}</span>
                          <el-tag size="small" :type="item.status === 1 ? 'success' : 'info'">
                            {{ item.status === 1 ? '启用' : '禁用' }}
                          </el-tag>
                        </div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="授课教师" prop="teacherId">
                    <el-select 
                      v-model="formData.teacherId" 
                      placeholder="请选择教师" 
                      clearable
                      filterable
                      style="width: 100%"
                      :disabled="!formData.collegeId"
                    >
                      <template #empty>
                        <el-empty description="暂无教师数据" :image-size="60" />
                      </template>
                      <el-option 
                        v-for="item in teacherOptions" 
                        :key="item.id" 
                        :label="item.name" 
                        :value="item.id" 
                      >
                        <div class="teacher-option">
                          <el-avatar :size="30" :src="item.avatar || '/avatar-default.png'" />
                          <div class="teacher-info">
                            <div class="teacher-name">{{ item.name }}</div>
                            <div class="extra-info">
                              <span v-if="item.phone">{{ item.phone }}</span>
                              <span v-else-if="item.email">{{ item.email }}</span>
                              <span v-else>无联系方式</span>
                            </div>
                          </div>
                        </div>
                      </el-option>
                    </el-select>
                    <div class="form-tip" v-if="!formData.collegeId">
                      <el-icon><InfoFilled /></el-icon>
                      <span>请先选择所属学院</span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="学分" prop="score">
                    <el-input
                      v-model="formData.score"
                      placeholder="请输入学分"
                      clearable
                    >
                      <template #append>分</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="学时" prop="hours">
                    <el-input
                      v-model="formData.hours"
                      placeholder="请输入学时"
                      clearable
                    >
                      <template #append>小时</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="课程容量" prop="capacity">
                    <el-input-number 
                      v-model="formData.capacity" 
                      :min="1" 
                      :max="500" 
                      :precision="0"
                      :controls-position="'right'"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="上课时间" prop="classTime">
                    <el-input 
                      v-model="formData.classTime" 
                      placeholder="请输入上课时间，如：周一 8:00-10:00" 
                      clearable 
                    >
                      <template #prefix>
                        <el-icon><Clock /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="课程状态" prop="status">
                    <el-radio-group v-model="formData.status">
                      <el-radio :label="1">
                        <el-tag type="success" size="small">未结课</el-tag>
                      </el-radio>
                      <el-radio :label="0">
                        <el-tag type="info" size="small">已结课</el-tag>
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
          
          <!-- 课程介绍 -->
          <el-col :span="24">
            <div class="form-section">
              <h3 class="section-title">
                <el-icon class="section-icon"><Document /></el-icon>
                课程介绍
              </h3>
              <el-form-item prop="introduction">
                <el-input 
                  v-model="formData.introduction" 
                  type="textarea" 
                  :rows="8" 
                  placeholder="请输入课程介绍"
                  :maxlength="2000"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </el-col>
        </el-row>
        
        <!-- 表单操作 -->
        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ isEdit ? '保存修改' : '创建课程' }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Back, Files, Document, Clock, InfoFilled } from '@element-plus/icons-vue'

// 导入API相关内容
// @ts-ignore
import { 
  getCourseDetail, 
  getCourseEditInfo,
  createCourse, 
  updateCourse,
  getAllColleges,
  getTeachersByCollegeId,
  type Course,
  type College
} from '@/api/course'

// @ts-ignore
import { getAllTeachers } from '@/request/admin'
// @ts-ignore
import type { ApiResponse } from '@/request/admin'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

// 判断是编辑还是新增
const isEdit = computed(() => {
  return Boolean(route.query.id)
})

// 表单数据
const formData = reactive<Course>({
  id: 0,
  lessonName: '',
  hours: '',
  score: '',
  classTime: '',
  introduction: '',
  capacity: 30,
  status: 1,
  teacherId: undefined,
  collegeId: undefined
})

// 表单验证规则
const rules = reactive<FormRules>({
  lessonName: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  collegeId: [
    { required: true, message: '请选择所属学院', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请输入学分', trigger: 'blur' }
  ],
  hours: [
    { required: true, message: '请输入学时', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入课程容量', trigger: 'blur' }
  ],
  classTime: [
    { required: true, message: '请输入上课时间', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择课程状态', trigger: 'change' }
  ]
})

// 选项数据
const collegeOptions = ref<College[]>([])
const teacherOptions = ref<{id: number, name: string, avatar?: string, phone?: string, email?: string}[]>([])

// 处理学院变更
const handleCollegeChange = async (collegeId: number) => {
  formData.teacherId = undefined // 清空已选教师
  if (!collegeId) {
    teacherOptions.value = []
    return
  }
  
  await loadTeachersByCollege(collegeId)
}

// 根据学院ID加载教师列表
const loadTeachersByCollege = async (collegeId: number) => {
  if (!collegeId) return
  
  try {
    const res = await getTeachersByCollegeId(collegeId) as ApiResponse<any[]>
    if (res.code === 200) {
      // 简化处理，不过滤角色
      teacherOptions.value = res.data
        .filter(teacher => teacher.status === 1)  // 只过滤启用状态
        .map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          avatar: teacher.avatar,
          phone: teacher.phone,
          email: teacher.email
        }))
        
      if (teacherOptions.value.length === 0) {
        ElMessage.warning('该学院下暂无可用教师')
      }
    } else {
      ElMessage.error(res.message || '获取教师列表失败')
    }
  } catch (error) {
    console.error('加载教师列表失败:', error)
    ElMessage.error('获取教师列表失败，请稍后重试')
    teacherOptions.value = []
  }
}

// 加载所有学院
const loadColleges = async () => {
  try {
    const res = await getAllColleges() as ApiResponse<College[]>
    if (res.code === 200) {
      collegeOptions.value = res.data.filter(college => college.status === 1) // 只显示启用的学院
    } else {
      ElMessage.error(res.message || '获取学院列表失败')
    }
  } catch (error) {
    console.error('加载学院列表失败:', error)
    ElMessage.error('获取学院列表失败，请稍后重试')
  }
}

// 加载课程详情
const loadCourseDetail = async (id: number) => {
  loading.value = true
  try {
    const res = await getCourseEditInfo(id) as ApiResponse<Course>
    if (res.code === 200) {
      const courseData = res.data
      // 填充表单数据
      if (courseData.lessonName) formData.lessonName = courseData.lessonName
      if (courseData.hours) formData.hours = courseData.hours
      if (courseData.score) formData.score = courseData.score
      if (courseData.classTime) formData.classTime = courseData.classTime
      if (courseData.introduction) formData.introduction = courseData.introduction
      if (courseData.capacity) formData.capacity = courseData.capacity
      if (courseData.status !== undefined) formData.status = courseData.status
      if (courseData.collegeId) {
        formData.collegeId = courseData.collegeId
        // 加载该学院下的教师
        await loadTeachersByCollege(courseData.collegeId)
      }
      if (courseData.teacherId) formData.teacherId = courseData.teacherId
      
      console.log('课程编辑回显数据:', courseData)
    } else {
      ElMessage.error(res.message || '获取课程详情失败')
    }
  } catch (error) {
    console.error('加载课程详情失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      submitFormAction()
    }
  })
}

// 实际提交表单的操作
const submitFormAction = async () => {
  submitting.value = true
  try {
    let res
    if (isEdit.value) {
      // 更新课程
      res = await updateCourse(formData) as ApiResponse
    } else {
      // 创建课程
      res = await createCourse(formData) as ApiResponse
    }
    
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '课程更新成功' : '课程创建成功')
      router.push({ name: 'CourseList' })
    } else {
      ElMessage.error(res.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error(isEdit.value ? '更新课程失败:' : '创建课程失败:', error)
    ElMessage.error(isEdit.value ? '更新失败，请稍后重试' : '创建失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/admin/course')
}

// 初始化
onMounted(async () => {
  // 加载学院列表
  await loadColleges()
  
  // 如果是编辑模式，加载课程详情
  if (isEdit.value && route.query.id) {
    const id = parseInt(route.query.id as string)
    if (!isNaN(id)) {
      formData.id = id  // 设置ID
      await loadCourseDetail(id)
    }
  }
})
</script>

<style lang="scss" scoped>
.course-form-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #f5f7fa, #ebeef5);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .left {
      h2 {
        margin: 0;
        font-size: 24px;
        color: #303133;
        position: relative;
        padding-left: 15px;
      }
      
      h2::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 5px;
        height: 24px;
        background-color: #409eff;
        border-radius: 2px;
      }
      
      .description {
        margin: 8px 0 0 15px;
        font-size: 14px;
        color: #606266;
      }
    }
  }
  
  .form-card {
    margin-bottom: 20px;
    border-radius: 8px;
    
    .form-section {
      margin-bottom: 30px;
      
      .section-title {
        margin-top: 0;
        margin-bottom: 20px;
        padding-bottom: 15px;
        font-size: 18px;
        color: #303133;
        border-bottom: 1px solid #EBEEF5;
        display: flex;
        align-items: center;
      }
      
      .section-icon {
        margin-right: 10px;
        color: #409eff;
        font-size: 20px;
      }
    }
    
    .form-actions {
      margin-top: 30px;
      padding-top: 20px;
      display: flex;
      justify-content: center;
      gap: 16px;
      border-top: 1px dashed #EBEEF5;
    }
  }

  .teacher-option {
    display: flex;
    align-items: center;
    padding: 5px 0;
    width: 100%;
  }

  .teacher-info {
    margin-left: 12px;
    flex: 1;
    overflow: hidden;
  }

  .teacher-name {
    font-size: 15px;
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
    color: #333;
  }

  .extra-info {
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .form-tip {
    margin-top: 5px;
    color: #909399;
    font-size: 12px;
    display: flex;
    align-items: center;
    
    .el-icon {
      margin-right: 4px;
      font-size: 14px;
      color: #E6A23C;
    }
  }

  .college-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
  }

  .college-name {
    font-size: 14px;
    font-weight: 500;
  }
}
</style> 