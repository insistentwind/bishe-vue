<template>
  <div class="admin-login-container">
    <div class="login-box">
      <div class="login-form">
        <div class="login-header">
          <div class="logo">
            <img src="https://cdn.jsdelivr.net/npm/@vant/assets/logo.png" alt="系统Logo" />
          </div>
          <h2>在线教育系统管理后台</h2>
          <p class="subtitle">请使用管理员账号登录</p>
        </div>
        
        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="loginRules" 
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入管理员用户名" 
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码" 
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <div class="remember-row">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码?</el-link>
          </div>
          
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-button" 
            @click="handleLogin"
          >
            登录
          </el-button>
          
          <div class="login-tips">
            <p>提示: 管理员账号为初始管理员创建，无法自行注册</p>
          </div>
        </el-form>
      </div>
      
      <div class="login-footer">
        <p>© 2025 在线教育管理系统 | 管理员端</p>
      </div>
    </div>
    
    <div class="login-background">
      <div class="login-decoration">
        <div class="system-info">
          <h1>在线教育系统管理平台</h1>
          <p class="slogan">高效管理 · 智能分析 · 精准决策</p>
          
          <div class="feature-list">
            <div class="feature-item">
              <div class="icon-box user-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="feature-text">
                <h3>用户与权限管理</h3>
                <p>全面掌控系统用户与权限分配</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="icon-box school-icon">
                <el-icon><School /></el-icon>
              </div>
              <div class="feature-text">
                <h3>学院与班级管理</h3>
                <p>优化教育资源配置，提升管理效率</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="icon-box data-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="feature-text">
                <h3>数据统计与分析</h3>
                <p>科学化决策，促进教学质量提升</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="icon-box course-icon">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="feature-text">
                <h3>课程内容管理</h3>
                <p>灵活配置课程内容，提升教学体验</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="icon-box exam-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="feature-text">
                <h3>在线考试系统</h3>
                <p>便捷的考试管理，快速评分反馈</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { User, Lock, UserFilled, School, DataAnalysis, Reading, Document } from '@element-plus/icons-vue'

// 定义简单的管理员信息接口
interface AdminInfo {
  id: string
  username: string
  name: string
  avatar: string
  role: string
  lastLoginTime: string
  createTime: string
  updateTime: string
  status: number
  collegeId: string
  delFlag: string
  phone: string
  email: string
  sex: string
  description: string
  idCard: string
  identity: string
  roleId: string
}

const router = useRouter()
const loginFormRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)
const rememberMe = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
  ]
}

// 初始化页面
onMounted(() => {
  // 检查是否有记住的用户名
  const savedUsername = localStorage.getItem('admin_remember_username')
  if (savedUsername) {
    loginForm.username = savedUsername
    rememberMe.value = true
  }
  
  // 检查是否已登录
  const token = localStorage.getItem('admin_token')
  if (token) {
    router.push('/admin/dashboard')
  }
})

// 处理登录
const handleLogin = async () => {
  // 表单验证
  await loginFormRef.value?.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请正确填写登录信息')
      return
    }
    
    try {
      loading.value = true
      
      // 使用fetch API直接调用登录接口
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        })
      });
      
      const res = await response.json();
      
      if (res.code === 200) {
        // 保存JWT令牌
        localStorage.setItem('admin_token', res.data.jwt || '')
        
        // 如果勾选了记住我，保存用户名
        if (rememberMe.value) {
          localStorage.setItem('admin_remember_username', loginForm.username)
        } else {
          localStorage.removeItem('admin_remember_username')
        }
        
        // 保存管理员信息到localStorage
        const adminData: AdminInfo = {
          id: res.data.id?.toString() || '',
          username: res.data.username || '',
          name: res.data.name || '管理员',
          avatar: res.data.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          role: 'ADMIN',
          roleId: res.data.roleId?.toString() || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          sex: res.data.sex?.toString() || '',
          description: res.data.description || '',
          idCard: res.data.idCard || '',
          identity: res.data.identity || '',
          lastLoginTime: res.data.updateTime ? new Date(res.data.updateTime).toISOString() : new Date().toISOString(),
          createTime: res.data.createTime ? new Date(res.data.createTime).toISOString() : new Date().toISOString(),
          updateTime: res.data.updateTime ? new Date(res.data.updateTime).toISOString() : new Date().toISOString(),
          status: res.data.status?.toString() || '1',
          collegeId: res.data.collegeId?.toString() || '',
          delFlag: res.data.delFlag?.toString() || '0'
        }
        setAdminInfo(adminData)
        
        // 保存完整的用户信息对象到localStorage
        localStorage.setItem('admin_info', JSON.stringify(res.data))
        
        ElMessage.success('登录成功，欢迎回来')
        
        // 登录成功后跳转到后台首页
        router.push('/admin/dashboard')
      } else {
        ElMessage.error(res.message || '登录失败，请检查用户名和密码')
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}

// 保存管理员信息的函数
const setAdminInfo = (info: AdminInfo) => {
  // 将所有管理员信息保存到localStorage
  localStorage.setItem('admin_id', info.id)
  localStorage.setItem('admin_username', info.username)
  localStorage.setItem('admin_name', info.name)
  localStorage.setItem('admin_avatar', info.avatar)
  localStorage.setItem('admin_role', 'ADMIN')
  localStorage.setItem('admin_roleId', info.roleId)
  localStorage.setItem('admin_phone', info.phone)
  localStorage.setItem('admin_email', info.email)
  localStorage.setItem('admin_sex', info.sex)
  localStorage.setItem('admin_description', info.description)
  localStorage.setItem('admin_idCard', info.idCard)
  localStorage.setItem('admin_identity', info.identity)
  localStorage.setItem('admin_lastLoginTime', info.lastLoginTime)
  localStorage.setItem('admin_createTime', info.createTime)
  localStorage.setItem('admin_updateTime', info.updateTime)
  localStorage.setItem('admin_status', info.status.toString())
  localStorage.setItem('admin_collegeId', info.collegeId)
  localStorage.setItem('admin_delFlag', info.delFlag)
}
</script>

<style lang="scss" scoped>
.admin-login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-box {
  width: 500px;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 0 50px;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.login-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  
  .logo {
    margin-bottom: 20px;
    
    img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
  }
  
  .subtitle {
    font-size: 14px;
    color: #909399;
    margin-top: 10px;
  }
}

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  margin-bottom: 20px;
  border-radius: 4px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
  border: none;
  font-size: 16px;
  
  &:hover {
    background: linear-gradient(to right, #162c55, #1e3c72);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(30, 60, 114, 0.3);
  }
}

.login-tips {
  text-align: center;
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  
  p {
    color: #909399;
    font-size: 12px;
  }
}

.login-footer {
  padding: 20px 0;
  text-align: center;
  
  p {
    color: #909399;
    font-size: 12px;
  }
}

.login-background {
  flex: 1;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  position: relative;
  overflow: hidden;
}

.login-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 50px;
}

.system-info {
  color: #fff;
  max-width: 600px;
  
  h1 {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 15px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .slogan {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 40px;
    letter-spacing: 2px;
  }
}

.feature-list {
  margin-top: 40px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  
  .icon-box {
    width: 48px;
    height: 48px;
    margin-right: 15px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    
    .el-icon {
      font-size: 24px;
      color: #fff;
    }
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }
  }
  
  .user-icon {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  .school-icon {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
  }
  
  .data-icon {
    background: linear-gradient(135deg, #fa709a, #fee140);
  }
  
  .course-icon {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  .exam-icon {
    background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  }
  
  .feature-text {
    h3 {
      font-size: 18px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    p {
      font-size: 14px;
      opacity: 0.8;
      line-height: 1.5;
    }
  }
}

@media screen and (max-width: 992px) {
  .admin-login-container {
    flex-direction: column-reverse;
  }
  
  .login-box {
    width: 100%;
    height: auto;
    padding: 30px 20px;
  }
  
  .login-background {
    height: 300px;
    min-height: 300px;
  }
  
  .system-info {
    h1 {
      font-size: 28px;
    }
    
    .slogan {
      font-size: 16px;
      margin-bottom: 20px;
    }
  }
  
  .feature-list {
    display: none;
  }
}
</style> 