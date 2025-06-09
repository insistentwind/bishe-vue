<template>
  <div class="user-form-page">
    <div class="page-header">
      <h2>{{ formTitle }}</h2>
      <p>{{ isEdit ? '修改用户信息' : '创建新用户' }}</p>
    </div>

    <el-card class="form-card">
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
        class="user-form"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <!-- 基本信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="isEdit" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="姓名" prop="realName">
                  <el-input v-model="userForm.realName" placeholder="请输入姓名" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="角色" prop="role">
                  <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
                    <el-option
                      v-for="item in roleOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="userForm.status">
                    <el-radio :label="1">启用</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号码" prop="phone">
                  <el-input v-model="userForm.phone" placeholder="请输入手机号码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="userForm.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="头像" prop="avatar">
              <el-upload
                class="avatar-uploader"
                action="#"
                :http-request="uploadAvatar"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar-image" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="el-upload__tip">只能上传jpg/png/gif文件，且不超过2MB</div>
            </el-form-item>

            <el-form-item label="身份证号码" prop="IdCard">
              <el-input v-model="userForm.IdCard" placeholder="请输入身份证号码" />
            </el-form-item>

            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="userForm.sex">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="用户类别" prop="identity">
              <el-input v-model="userForm.identity" placeholder="请输入用户类别" />
            </el-form-item>

            <el-form-item label="密码" prop="password" v-if="!isEdit">
              <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
              <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码" />
            </el-form-item>
          </el-tab-pane>

          <!-- 教师特有字段 -->
          <el-tab-pane label="教师信息" name="teacher" v-if="userForm.role === UserRole.TEACHER">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学院" prop="collegeId">
                  <el-select v-model="userForm.collegeId" placeholder="请选择学院" style="width: 100%">
                    <el-option
                      v-for="item in collegeOptions"
                      :key="item.collegeId"
                      :label="item.collegeName"
                      :value="item.collegeId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职称" prop="title">
                  <el-select v-model="userForm.title" placeholder="请选择职称" style="width: 100%">
                    <el-option label="教授" value="教授" />
                    <el-option label="副教授" value="副教授" />
                    <el-option label="讲师" value="讲师" />
                    <el-option label="助教" value="助教" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学历" prop="education">
                  <el-select v-model="userForm.education" placeholder="请选择学历" style="width: 100%">
                    <el-option label="博士" value="博士" />
                    <el-option label="硕士" value="硕士" />
                    <el-option label="学士" value="学士" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="教师简介" prop="description">
              <el-input
                v-model="userForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入教师简介"
              />
            </el-form-item>
          </el-tab-pane>

          <!-- 学生特有字段 -->
          <el-tab-pane label="学生信息" name="student" v-if="userForm.role === UserRole.STUDENT">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学院" prop="collegeId">
                  <el-select 
                    v-model="userForm.collegeId" 
                    placeholder="请选择学院" 
                    style="width: 100%"
                    @change="handleCollegeChange"
                  >
                    <el-option
                      v-for="item in collegeOptions"
                      :key="item.collegeId"
                      :label="item.collegeName"
                      :value="item.collegeId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="专业" prop="majorId">
                  <el-select 
                    v-model="userForm.majorId" 
                    placeholder="请选择专业" 
                    style="width: 100%"
                    :disabled="!userForm.collegeId"
                  >
                    <el-option
                      v-for="item in majorOptions"
                      :key="item.majorId"
                      :label="item.majorName"
                      :value="item.majorId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="班级" prop="classId">
                  <el-select 
                    v-model="userForm.classId" 
                    placeholder="请选择班级" 
                    style="width: 100%"
                    :disabled="!userForm.majorId"
                  >
                    <el-option
                      v-for="item in classOptions"
                      :key="item.classId"
                      :label="item.className"
                      :value="item.classId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年级" prop="grade">
                  <el-select v-model="userForm.grade" placeholder="请选择年级" style="width: 100%">
                    <el-option label="2020级" value="2020级" />
                    <el-option label="2021级" value="2021级" />
                    <el-option label="2022级" value="2022级" />
                    <el-option label="2023级" value="2023级" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="入学日期" prop="enrollment">
              <el-date-picker
                v-model="userForm.enrollment"
                type="date"
                placeholder="选择入学日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="submitForm">{{ isEdit ? '保存' : '创建' }}</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getUserDetail,
  getUserInfo,
  createUser,
  updateUser,
  UserRole,
  UserStatus,
  roleOptions,
  type AdminUserInfo
} from '@/api/user'
import { getAllColleges } from '@/request/admin'

const route = useRoute()
const router = useRouter()

// 表单引用
const userFormRef = ref()
const activeTab = ref('basic')

// 判断是否是编辑模式
const isEdit = computed(() => route.params.id !== undefined)
const userId = computed(() => route.params.id as string)
const formTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户')

// 下拉选项数据
const collegeOptions = ref<{ collegeId: string; collegeName: string }[]>([])
const majorOptions = ref<{ majorId: string; majorName: string }[]>([])
const classOptions = ref<{ classId: string; className: string }[]>([])

// 表单数据
const userForm = reactive({
  id: '',
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  avatar: '',
  phone: '',
  email: '',
  role: UserRole.STUDENT as UserRole,
  status: UserStatus.ENABLED as UserStatus,
  IdCard: '', // 身份证号
  sex: 1, // 性别 1-男，2-女
  identity: '', // 用户类别
  
  // 教师特有字段
  collegeId: '',
  title: '',
  education: '',
  description: '',
  
  // 学生特有字段
  majorId: '',
  classId: '',
  grade: '',
  enrollment: ''
})

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: !isEdit.value, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: !isEdit.value, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  IdCard: [
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ],
  
  // 教师特有字段验证 - 不强制必填
  collegeId: [],
  title: [],
  education: [],
  
  // 学生特有字段验证 - 不强制必填
  majorId: [],
  classId: [],
  grade: [],
  enrollment: []
}

// 初始化
onMounted(async () => {
  // 加载学院列表
  await loadCollegeOptions()
  
  // 编辑模式下加载用户数据
  if (isEdit.value && userId.value) {
    await loadUserData()
  }
})

// 监听角色变化，切换到对应的标签页
watch(() => userForm.role, (newRole) => {
  if (newRole === UserRole.TEACHER) {
    activeTab.value = 'teacher'
  } else if (newRole === UserRole.STUDENT) {
    activeTab.value = 'student'
  } else {
    activeTab.value = 'basic'
  }
})

// 加载学院选项
const loadCollegeOptions = async () => {
  try {
    const res = await getAllColleges()
    if (res.data && res.data.code === 200) {
      collegeOptions.value = res.data.data
    } else {
      ElMessage.error(res.data?.msg || '获取学院列表失败')
    }
  } catch (error) {
    console.error('获取学院列表失败', error)
    ElMessage.error('获取学院列表失败')
  }
}

// 学院变更时加载专业选项
const handleCollegeChange = async (collegeId: string) => {
  userForm.majorId = ''
  userForm.classId = ''
  
  if (!collegeId) {
    majorOptions.value = []
    return
  }
  
  try {
    // 由于没有 queryMajorsByCollegeId API，我们暂时使用模拟数据
    // 待后端 API 就绪后替换此处代码
    // 模拟专业数据
    majorOptions.value = [
      { majorId: 'M001', majorName: '计算机科学与技术' },
      { majorId: 'M002', majorName: '软件工程' },
      { majorId: 'M003', majorName: '人工智能' }
    ]
  } catch (error) {
    console.error('获取专业列表失败', error)
    ElMessage.error('获取专业列表失败')
  }
}

// 专业变更时加载班级选项
watch(() => userForm.majorId, (majorId) => {
  userForm.classId = ''
  
  if (!majorId) {
    classOptions.value = []
    return
  }
  
  // 模拟加载班级数据
  classOptions.value = [
    { classId: 'CL001', className: '计算机科学1班' },
    { classId: 'CL002', className: '计算机科学2班' },
    { classId: 'CL003', className: '软件工程1班' },
    { classId: 'CL004', className: '软件工程2班' },
    { classId: 'CL005', className: '人工智能1班' }
  ]
})

// 加载用户数据
const loadUserData = async () => {
  try {
    // 使用新的API获取用户详情
    const res = await getUserInfo(Number(userId.value))
    console.log('获取用户详情原始响应:', res)
    
    if (res.data && res.data.code === 200) {
      const userData = res.data.data
      console.log('用户详情数据:', userData)
      
      // 设置基本信息
      userForm.id = userData.id
      userForm.username = userData.username
      userForm.realName = userData.name
      userForm.avatar = userData.avatar || ''
      userForm.phone = userData.phone || ''
      userForm.email = userData.email || ''
      userForm.role = userData.roleId || UserRole.STUDENT
      userForm.status = userData.status === 1 ? 1 : 0
      userForm.IdCard = userData.IdCard || '' // 使用大写D
      userForm.sex = userData.sex || 1
      userForm.identity = userData.identity || ''
      
      // 设置角色特有字段
      userForm.description = userData.description || ''
      
      // 设置学院信息(如果存在)
      if (userData.collegeId) {
        userForm.collegeId = String(userData.collegeId)
      }
      
      // 设置教师特有字段(如果存在)
      if (userData.title) {
        userForm.title = userData.title
      }
      if (userData.education) {
        userForm.education = userData.education
      }
      
      // 设置学生特有字段(如果存在)
      if (userData.majorId) {
        userForm.majorId = String(userData.majorId)
      }
      if (userData.classId) {
        userForm.classId = String(userData.classId)
      }
      if (userData.grade) {
        userForm.grade = userData.grade
      }
      if (userData.enrollment) {
        userForm.enrollment = userData.enrollment
      }
      
      console.log('表单数据设置完成:', userForm)
      ElMessage.success('加载用户信息成功')
      
      // 如果是教师或学生角色，根据已有的collegeId加载相关选项
      if (userForm.role === UserRole.TEACHER || userForm.role === UserRole.STUDENT) {
        handleCollegeChange(userForm.collegeId)
      }
    } else {
      ElMessage.error(res.data?.msg || '获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 上传头像前的校验
const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isGIF = file.type === 'image/gif'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG && !isGIF) {
    ElMessage.error('头像图片只能是JPG/PNG/GIF格式!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过2MB!')
    return false
  }
  
  return true
}

// 上传头像
const uploadAvatar = (options: any) => {
  const file = options.file
  
  // 在真实环境中，应该上传到服务器
  // 这里使用FileReader来模拟本地预览
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    userForm.avatar = reader.result as string
    ElMessage.success('头像上传成功')
  }
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return
  
  try {
    // 不再进行表单验证，直接提交
    // await userFormRef.value.validate()
    
    // 将表单数据映射到API需要的格式
    const formData: AdminUserInfo = {
      id: isEdit.value ? Number(userId.value) : undefined,
      username: userForm.username,
      name: userForm.realName,
      roleId: userForm.role,
      status: userForm.status,  // 确保状态值正确传递（1-启用，0-禁用）
      phone: userForm.phone || '',
      email: userForm.email || '',
      avatar: userForm.avatar || '',
      collegeId: userForm.collegeId ? Number(userForm.collegeId) : undefined,
      description: userForm.description || '',
      IdCard: userForm.IdCard || '', // 确保使用大写D的IdCard
      sex: userForm.sex || 1,
      identity: userForm.identity || ''
    } as AdminUserInfo
    
    // 仅在新增时添加密码
    if (!isEdit.value) {
      formData.password = userForm.password
    }
    
    // 根据角色添加额外字段
    if (userForm.role === UserRole.TEACHER) {
      // 添加教师特有字段
      formData.title = userForm.title || ''
      formData.education = userForm.education || ''
    } else if (userForm.role === UserRole.STUDENT) {
      // 添加学生特有字段
      formData.majorId = userForm.majorId || ''
      formData.classId = userForm.classId || ''
      formData.grade = userForm.grade || ''
      formData.enrollment = userForm.enrollment || ''
    }
    
    // 清理对象，移除所有undefined或null值
    Object.keys(formData).forEach(key => {
      const value = (formData as any)[key]
      if (value === undefined || value === null) {
        delete (formData as any)[key]
      }
    })
    
    console.log('准备提交表单数据:', JSON.stringify(formData, null, 2))
    
    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: isEdit.value ? '正在更新用户...' : '正在创建用户...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    try {
      if (isEdit.value) {
        // 更新用户
        console.log(`调用updateUser API, URL: /system/user/update, 方法: PUT`)
        const response = await updateUser(formData)
        console.log('更新用户响应:', response)
        
        if (response && response.data) {
          if (response.data.code === 200) {
            ElMessage.success('更新用户成功')
            // 返回用户列表页
            goBack()
          } else {
            // 显示具体错误信息
            ElMessage.error(response.data.msg || '更新用户失败，请检查表单数据')
            console.error('更新失败原因:', response.data)
          }
        } else {
          ElMessage.error('更新用户失败，服务器返回数据格式异常')
        }
      } else {
        // 创建用户
        console.log(`调用createUser API, URL: /system/user/save, 方法: POST`)
        const response = await createUser(formData)
        console.log('创建用户响应:', response)
        
        if (response && response.data) {
          if (response.data.code === 200) {
            ElMessage.success('创建用户成功')
            // 返回用户列表页
            goBack()
          } else {
            // 显示具体错误信息
            ElMessage.error(response.data.msg || '创建用户失败，请检查表单数据')
            console.error('创建失败原因:', response.data)
          }
        } else {
          ElMessage.error('创建用户失败，服务器返回数据格式异常')
        }
      }
    } catch (error: any) {
      console.error(isEdit.value ? '更新用户失败' : '创建用户失败', error)
      // 尝试提取更多错误信息
      if (error.response && error.response.data) {
        console.error('错误响应数据:', JSON.stringify(error.response.data, null, 2))
        ElMessage.error(error.response.data.msg || (isEdit.value ? '更新用户失败' : '创建用户失败'))
      } else {
        ElMessage.error(error.message || (isEdit.value ? '更新用户失败' : '创建用户失败'))
      }
    } finally {
      // 关闭加载状态
      loading.close()
    }
  } catch (error) {
    console.error('表单处理失败:', error)
    ElMessage.error('表单处理失败，请检查输入内容')
  }
}

// 返回上一页
const goBack = () => {
  router.push('/admin/user')
}
</script>

<style scoped>
.user-form-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.page-header p {
  color: #666;
  margin: 0;
}

.form-card {
  margin-bottom: 20px;
}

.user-form {
  max-width: 100%;
}

.avatar-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar-image {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}
</style> 