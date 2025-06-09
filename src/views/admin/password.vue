<template>
  <div class="admin-password">
    <el-card class="password-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      
      <div class="password-content">
        <el-form 
          ref="passwordFormRef" 
          :model="passwordForm" 
          :rules="passwordRules" 
          label-width="120px" 
          class="password-form"
        >
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input 
              v-model="passwordForm.oldPassword" 
              type="password" 
              placeholder="请输入当前密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input 
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="请输入新密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="submitForm">
              保存修改
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div class="password-tips">
          <div class="tips-title">
            <el-icon><InfoFilled /></el-icon>
            <span>密码安全提示</span>
          </div>
          <ul class="tips-list">
            <li>密码长度至少为8个字符</li>
            <li>密码必须包含大小写字母、数字和特殊字符</li>
            <li>请勿使用与旧密码相似的密码</li>
            <li>请勿使用常见的密码组合（如123456）</li>
            <li>建议定期更换密码，保障账号安全</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
// import { updateAdminPassword } from '@/request/admin/index'

const router = useRouter()
const passwordFormRef = ref<FormInstance>()
const submitting = ref(false)

// 密码表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 自定义验证规则：确认密码
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 自定义验证规则：密码强度
const validatePasswordStrength = (rule: any, value: string, callback: any) => {
  // 检查密码强度：至少8位，且必须包含大小写字母、数字和特殊字符
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
  if (!strongPasswordRegex.test(value)) {
    callback(new Error('密码必须至少8位，包含大小写字母、数字和特殊字符'))
  } else {
    callback()
  }
}

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8个字符', trigger: 'blur' },
    { validator: validatePasswordStrength, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = async () => {
  await passwordFormRef.value?.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请正确填写表单信息')
      return
    }
    
    submitting.value = true
    try {
      // 模拟API调用
      setTimeout(() => {
        ElMessageBox.confirm(
          '密码修改成功，需要重新登录以应用新密码，是否立即退出登录?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '稍后手动退出',
            type: 'info'
          }
        ).then(() => {
          // 清除登录信息
          localStorage.removeItem('admin_token')
          // 跳转到登录页
          router.push('/admin/login')
        }).catch(() => {
          // 用户选择稍后手动退出
          ElMessage.info('密码已更新，下次登录时生效')
        })
        
        submitting.value = false
      }, 1000)
      
      // 实际项目中应该调用API修改密码
      // const res = await updateAdminPassword({
      //   oldPassword: passwordForm.oldPassword,
      //   newPassword: passwordForm.newPassword
      // })
      // if (res.code === 200) {
      //   ElMessageBox.confirm(
      //     '密码修改成功，需要重新登录以应用新密码，是否立即退出登录?',
      //     '提示',
      //     {
      //       confirmButtonText: '确定',
      //       cancelButtonText: '稍后手动退出',
      //       type: 'info'
      //     }
      //   ).then(() => {
      //     // 清除登录信息
      //     localStorage.removeItem('admin_token')
      //     // 跳转到登录页
      //     router.push('/admin/login')
      //   }).catch(() => {
      //     // 用户选择稍后手动退出
      //     ElMessage.info('密码已更新，下次登录时生效')
      //   })
      // } else {
      //   ElMessage.error(res.message || '密码修改失败')
      // }
    } catch (error) {
      console.error('修改密码失败:', error)
      ElMessage.error('修改密码失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  passwordFormRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.admin-password {
  max-width: 800px;
  margin: 0 auto;
}

.password-card {
  .card-header {
    font-weight: 600;
  }
}

.password-content {
  display: flex;
  
  .password-form {
    flex: 3;
    margin-right: 30px;
  }
  
  .password-tips {
    flex: 2;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
    
    .tips-title {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      color: #409EFF;
      font-weight: 600;
      
      .el-icon {
        margin-right: 8px;
      }
    }
    
    .tips-list {
      padding-left: 20px;
      margin: 0;
      
      li {
        margin-bottom: 10px;
        color: #606266;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .password-content {
    flex-direction: column;
    
    .password-form {
      margin-right: 0;
      margin-bottom: 20px;
    }
  }
}
</style> 