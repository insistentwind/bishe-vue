<template>
  <div class="admin-profile">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
          <el-button type="primary" @click="editProfile">编辑资料</el-button>
        </div>
      </template>
      
      <div class="profile-content">
        <!-- 个人信息概览 -->
        <div class="profile-overview">
          <div class="avatar-box">
            <el-avatar :size="120" :src="adminInfo.avatar" />
            <div class="upload-avatar" @click="openUploadDialog">
              <el-icon><Camera /></el-icon>
              <span>修改头像</span>
            </div>
          </div>
          
          <div class="info-summary">
            <h2>{{ adminInfo.name }}</h2>
            <div class="role-tag">
              <el-tag type="primary">{{ adminInfo.role === 'ADMIN' ? '系统管理员' : '普通管理员' }}</el-tag>
            </div>
            <p class="last-login">上次登录: {{ formatDate(adminInfo.lastLoginTime) }}</p>
            <p class="create-time">账号创建于: {{ formatDate(adminInfo.createTime) }}</p>
          </div>
        </div>
        
        <!-- 个人详细信息 -->
        <div class="profile-details">
          <el-descriptions 
            :column="2" 
            border 
            class="admin-descriptions"
          >
            <el-descriptions-item label="用户ID">
              {{ adminInfo.id || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="用户名">
              {{ adminInfo.username || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="真实姓名">
              {{ adminInfo.name || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="所属学院">
              {{ collegeInfo.name || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ userDetail.phone || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userDetail.email || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">
              {{ userDetail.idCard || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="用户类别">
              {{ userDetail.identity || '管理员' }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              <span v-if="userDetail.sex === '1'">男</span>
              <span v-else-if="userDetail.sex === '0'">女</span>
              <span v-else>未设置</span>
            </el-descriptions-item>
            <el-descriptions-item label="角色ID">
              {{ userDetail.roleId || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="userDetail.status === '1' ? 'success' : 'danger'">
                {{ userDetail.status === '1' ? '正常' : '已禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(userDetail.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="个人简介" :span="2">
              {{ userDetail.description || '暂无个人简介' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
    
    <!-- 安全信息卡片 -->
    <el-card class="security-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>安全设置</span>
        </div>
      </template>
      
      <div class="security-settings">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">账号密码</div>
            <div class="setting-desc">建议定期修改密码，保障账号安全</div>
          </div>
          <el-button @click="$router.push('/admin/password')">修改密码</el-button>
        </div>
        
        <el-divider />
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">登录设备管理</div>
            <div class="setting-desc">查看已登录的设备，及时清除异常登录</div>
          </div>
          <el-button>查看设备</el-button>
        </div>
        
        <el-divider />
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-title">操作日志</div>
            <div class="setting-desc">您在系统中的所有操作记录</div>
          </div>
          <el-button>查看日志</el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 上传头像对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传头像"
      width="500px"
    >
      <div class="upload-container">
        <el-upload
          class="avatar-uploader"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleAvatarChange"
        >
          <img v-if="avatarUrl" :src="avatarUrl" class="avatar-preview" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tip">
          只支持JPG、PNG格式的图片，且不超过2MB
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="uploading" @click="submitAvatar">
            确认上传
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑个人资料对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="600px"
    >
      <el-form :model="editForm" label-width="100px" :rules="formRules" ref="editFormRef">
        <el-form-item label="真实姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="editForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="editForm.sex">
            <el-radio label="1">男</el-radio>
            <el-radio label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个人简介" prop="description">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="4"
            placeholder="请输入个人简介" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitEdit">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Camera, Plus } from '@element-plus/icons-vue'

// 定义简单的管理员信息接口，避免导入
interface AdminInfo {
  id: string
  username: string
  name: string
  avatar: string
  role: string
  lastLoginTime: string
  createTime: string
  status: number
}

// 模拟adminStore
const adminInfo = computed(() => {
  return {
    id: localStorage.getItem('admin_id') || '',
    username: localStorage.getItem('admin_username') || '',
    name: localStorage.getItem('admin_name') || '',
    avatar: localStorage.getItem('admin_avatar') || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    role: localStorage.getItem('admin_role') || 'ADMIN',
    lastLoginTime: localStorage.getItem('admin_lastLoginTime') || '',
    createTime: localStorage.getItem('admin_createTime') || '',
    status: parseInt(localStorage.getItem('admin_status') || '1')
  } as AdminInfo
})

// 设置管理员信息的函数，替代adminStore的功能
const setAdminInfo = (info: Partial<AdminInfo>) => {
  if (info.name) localStorage.setItem('admin_name', info.name)
  if (info.avatar) localStorage.setItem('admin_avatar', info.avatar)
  
  // 更新完整的用户信息对象
  const adminInfoObj = JSON.parse(localStorage.getItem('admin_info') || '{}')
  Object.assign(adminInfoObj, info)
  localStorage.setItem('admin_info', JSON.stringify(adminInfoObj))
}

// 学院信息
const collegeInfo = reactive({
  id: localStorage.getItem('admin_collegeId') || '',
  name: ''
})

// 用户详细信息
const userDetail = reactive({
  phone: localStorage.getItem('admin_phone') || '',
  email: localStorage.getItem('admin_email') || '',
  description: localStorage.getItem('admin_description') || '',
  idCard: localStorage.getItem('admin_idCard') || '',
  identity: localStorage.getItem('admin_identity') || '',
  sex: localStorage.getItem('admin_sex') || '',
  roleId: localStorage.getItem('admin_roleId') || '',
  createTime: localStorage.getItem('admin_createTime') || '',
  updateTime: localStorage.getItem('admin_updateTime') || '',
  status: localStorage.getItem('admin_status') || '1',
  delFlag: localStorage.getItem('admin_delFlag') || '0'
})

// 编辑表单相关
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const submitting = ref(false)
const editForm = reactive({
  name: '',
  phone: '',
  email: '',
  description: '',
  idCard: '',
  sex: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2到20个字符之间', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 上传头像相关
const uploadDialogVisible = ref(false)
const avatarUrl = ref('')
const uploading = ref(false)
const fileToUpload = ref<File | null>(null)

// 初始化页面数据
onMounted(async () => {
  // 加载管理员详细信息
  try {
    // 从localStorage中获取学院名称
    if (collegeInfo.id) {
      // 这里应该是从API获取学院名称
      // 由于管理员可能没有所属学院，所以要处理这种情况
      collegeInfo.name = collegeInfo.id ? '信息工程学院' : '系统管理员（无所属学院）'
    } else {
      collegeInfo.name = '系统管理员（无所属学院）'
    }
    
    // 如果localStorage中没有详细信息，可以尝试从API获取
    if (!userDetail.phone && !userDetail.email) {
      // 模拟从API获取数据
      console.log('从API获取管理员详细信息')
      // 实际项目中应该调用API
      // const res = await getAdminInfo()
      // if (res.code === 200) {
      //   // 更新用户详细信息
      //   userDetail.phone = res.data.phone || ''
      //   userDetail.email = res.data.email || ''
      //   userDetail.description = res.data.description || ''
      //   userDetail.idCard = res.data.idCard || ''
      //   userDetail.identity = res.data.identity || ''
      //   userDetail.sex = res.data.sex || ''
      //   
      //   // 保存到localStorage
      //   localStorage.setItem('admin_phone', userDetail.phone)
      //   localStorage.setItem('admin_email', userDetail.email)
      //   localStorage.setItem('admin_description', userDetail.description)
      //   localStorage.setItem('admin_idCard', userDetail.idCard)
      //   localStorage.setItem('admin_identity', userDetail.identity)
      //   localStorage.setItem('admin_sex', userDetail.sex.toString())
      // }
    }
  } catch (error) {
    console.error('获取管理员信息失败:', error)
    ElMessage.error('获取管理员信息失败')
  }
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未知'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString()
  } catch (error) {
    return dateStr
  }
}

// 打开编辑对话框
const editProfile = () => {
  editForm.name = adminInfo.value.name
  editForm.phone = userDetail.phone
  editForm.email = userDetail.email
  editForm.description = userDetail.description
  editForm.idCard = userDetail.idCard
  editForm.sex = userDetail.sex
  editDialogVisible.value = true
}

// 提交编辑表单
const submitEdit = async () => {
  await editFormRef.value?.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请正确填写表单信息')
      return
    }
    
    submitting.value = true
    try {
      // 使用fetch API更新个人资料
      const response = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({
          id: parseInt(localStorage.getItem('admin_id') || '0'),
          name: editForm.name,
          phone: editForm.phone,
          email: editForm.email,
          description: editForm.description,
          IdCard: editForm.idCard, // 注意这里使用大写D的IdCard
          sex: parseInt(editForm.sex), // 转换为数字类型
          username: adminInfo.value.username // 添加必需的username字段
        })
      })
      
      const res = await response.json()
      
      if (res.code === 200) {
        // 更新本地数据
        setAdminInfo({
          ...adminInfo.value,
          name: editForm.name
        })
        
        // 更新userDetail对象
        userDetail.phone = editForm.phone
        userDetail.email = editForm.email
        userDetail.description = editForm.description
        userDetail.idCard = editForm.idCard
        userDetail.sex = editForm.sex
        
        // 保存到localStorage
        localStorage.setItem('admin_name', editForm.name)
        localStorage.setItem('admin_phone', editForm.phone)
        localStorage.setItem('admin_email', editForm.email)
        localStorage.setItem('admin_description', editForm.description)
        localStorage.setItem('admin_idCard', editForm.idCard)
        localStorage.setItem('admin_sex', editForm.sex)
        
        // 更新完整的用户信息对象
        const adminInfoObj = JSON.parse(localStorage.getItem('admin_info') || '{}')
        adminInfoObj.name = editForm.name
        adminInfoObj.phone = editForm.phone
        adminInfoObj.email = editForm.email
        adminInfoObj.description = editForm.description
        adminInfoObj.idCard = editForm.idCard
        adminInfoObj.sex = editForm.sex
        localStorage.setItem('admin_info', JSON.stringify(adminInfoObj))
        
        ElMessage.success('个人资料更新成功')
        editDialogVisible.value = false
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } catch (error) {
      console.error('更新个人资料失败:', error)
      ElMessage.error('更新个人资料失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 打开上传头像对话框
const openUploadDialog = () => {
  avatarUrl.value = adminInfo.value.avatar
  uploadDialogVisible.value = true
}

// 处理头像变更
const handleAvatarChange = (file: any) => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!')
    return
  }
  
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return
  }
  
  // 预览图片
  avatarUrl.value = URL.createObjectURL(file.raw)
  // 保存文件对象，用于后续上传
  fileToUpload.value = file.raw
}

// 提交头像更新
const submitAvatar = async () => {
  if (!avatarUrl.value || avatarUrl.value === adminInfo.value.avatar) {
    ElMessage.warning('请先选择新的头像图片')
    return
  }
  
  if (!fileToUpload.value) {
    ElMessage.warning('请先选择有效的图片文件')
    return
  }
  
  uploading.value = true
  try {
    // 创建FormData对象，用于上传文件
    const formData = new FormData()
    formData.append('file', fileToUpload.value)
    
    // 使用fetch API上传头像
    const uploadResponse = await fetch('/api/admin/avatar', {
      method: 'POST',
      headers: {
        'token': localStorage.getItem('admin_token') || ''
      },
      body: formData
    })
    
    const res = await uploadResponse.json()
    
    if (res.code === 200) {
      // 获取返回的图片URL
      const newAvatarUrl = res.data
      
      // 使用fetch API更新用户信息
      const updateResponse = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({
          id: parseInt(localStorage.getItem('admin_id') || '0'),
          avatar: newAvatarUrl,
          username: adminInfo.value.username,
          name: adminInfo.value.name
        })
      })
      
      const updateRes = await updateResponse.json()
      
      if (updateRes.code === 200) {
        // 更新头像在界面上
        setAdminInfo({
          ...adminInfo.value,
          avatar: newAvatarUrl
        })
        
        // 保存到本地存储
        localStorage.setItem('admin_avatar', newAvatarUrl)
        
        // 立即更新当前页面显示的头像
        adminInfo.value.avatar = newAvatarUrl
        
        ElMessage.success('头像更新成功')
        uploadDialogVisible.value = false
      } else {
        ElMessage.error(updateRes.message || '更新头像失败')
      }
    } else {
      ElMessage.error(res.message || '上传头像失败')
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('上传头像失败，请稍后重试')
  } finally {
    uploading.value = false
    // 清除文件对象
    fileToUpload.value = null
  }
}
</script>

<style lang="scss" scoped>
.admin-profile {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card, .security-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.profile-content {
  .profile-overview {
    display: flex;
    margin-bottom: 30px;
    
    .avatar-box {
      position: relative;
      margin-right: 30px;
      
      .upload-avatar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 36px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        border-bottom-left-radius: 60px;
        border-bottom-right-radius: 60px;
        opacity: 0;
        transition: opacity 0.3s;
        
        .el-icon {
          margin-right: 4px;
        }
      }
      
      &:hover .upload-avatar {
        opacity: 1;
      }
    }
    
    .info-summary {
      h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
      }
      
      .role-tag {
        margin-bottom: 15px;
      }
      
      .last-login, .create-time {
        margin: 8px 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }
  
  .profile-details {
    .admin-descriptions {
      width: 100%;
    }
  }
}

.security-settings {
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    
    .setting-info {
      .setting-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 5px;
      }
      
      .setting-desc {
        color: #909399;
        font-size: 13px;
      }
    }
  }
}

.upload-container {
  text-align: center;
  
  .avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 178px;
    height: 178px;
    margin: 0 auto;
    
    &:hover {
      border-color: #409EFF;
    }
    
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
    }
    
    .avatar-preview {
      width: 178px;
      height: 178px;
      display: block;
    }
  }
  
  .upload-tip {
    color: #909399;
    font-size: 12px;
    margin-top: 10px;
  }
}
</style> 