<template>
  <div class="login-box">
    <div class="login-content">
      <div class="login-left">
        <div class="system-intro">
          <h1>作业考试系统设计与开发</h1>
          <p class="slogan">高效 · 专业 · 智能</p>
          <div class="system-features">
            <div class="feature-item">
              <div class="feature-icon">
                <img src="https://insistentwind.oss-cn-beijing.aliyuncs.com/2025-04-16/1bdd1927-4b80-493d-a3e4-1c48a0572392.png" alt="智能批阅" />
              </div>
              <div class="feature-text">
                <h3>智能批阅</h3>
                <p>基于AI技术的智能批阅，提高教师工作效率</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <img src="https://insistentwind.oss-cn-beijing.aliyuncs.com/2025-04-16/e38229a7-9e40-412a-8f1c-1db913a57bab.png" alt="数据分析" />
              </div>
              <div class="feature-text">
                <h3>数据分析</h3>
                <p>详细的成绩统计分析，掌握学生学习情况</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <img src="https://insistentwind.oss-cn-beijing.aliyuncs.com/2025-04-16/0ffbd5fe-8e12-4008-95aa-8dcb0c4dcd91.png" alt="专业设计" />
              </div>
              <div class="feature-text">
                <h3>专业设计</h3>
                <p>符合教育场景的专业界面，易于操作</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="login-form-wrapper">
        <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            status-icon
            :rules="rules"
            label-width="80px"
            class="demo-ruleForm"
        >
          <div class="logo-container">
            <img src="https://insistentwind.oss-cn-beijing.aliyuncs.com/2025-05-23/b1c19cd5-3fdb-450e-8818-ebed112d25d2.png" alt="Logo" class="logo"/>
          </div>
          <h2>用户登录</h2>
          <div class="welcome-text">欢迎使用在线批阅系统，请登录账号</div>
          <el-form-item label="身份：" prop="identity">
            <el-select v-model="ruleForm.identity" placeholder="选择身份" class="form-input">
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="账号：" prop="username">
            <el-input v-model="ruleForm.username" autocomplete="off" class="form-input"/>
          </el-form-item>
          <el-form-item label="密码：" prop="password">
            <el-input
                v-model="ruleForm.password"
                type="password"
                autocomplete="off"
                class="form-input"
                show-password
            />
          </el-form-item>
          
          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="#" class="forgot-link">忘记密码?</a>
          </div>
          
          <div class="form-buttons">
            <el-button type="primary" class="login-btn" @click="submitForm(ruleFormRef)">
              登录
            </el-button>
            <el-button type="default" class="register-btn" @click="toCreat()">
              注册
            </el-button>
          </div>
          
          <div class="login-footer">
            <p>© 2025 在线批阅系统 版权所有</p>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, onMounted} from "vue";
import type {FormInstance, FormRules} from 'element-plus';
import {login} from "../request/login/login";
import {useRouter} from "vue-router";
import {ElMessage} from 'element-plus';
import {useStudentStore} from '../stores/counter'
interface loginData {
  identity: string,
  username: string,
  password: string
}

interface User {
  name: string,
  username: string,
  oldPassword: string,
  newPassword: string,
  description: string,
  authorityRole: string,
  identity: string,
  collegeId: string,
  email: string,
  idCard: string,
  jwt: string,
  id: number,
  password: string
}

const options = [
  {
    value: 'TEACHER',
    label: '教师',
  },
  {
    value: 'STUDENT',
    label: '学生',
  },
]
const ruleFormRef = ref<FormInstance>()
const studentStore = useStudentStore()
const router = useRouter()
const rememberMe = ref(false)

const ruleForm: loginData = reactive({
  identity: "",
  username: "",
  password: ""
});

const rules = {
  identity: [
    { required: true, message: '请选择身份', trigger: 'change' }
  ],
  username: [
    {required: true, message: '请输入账号', trigger: 'blur'},
    {min: 3, max: 11, message: '账号的长度在3-11位之间', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 3, max: 10, message: '密码的长度在3-10之间', trigger: 'blur'},
  ],
};

const toCreat=()=>{
  router.push("creat")
}

// 在组件挂载时，检查是否记住过用户名
onMounted(() => {
  const savedUsername = localStorage.getItem('remember_username')
  if (savedUsername) {
    ruleForm.username = savedUsername
    rememberMe.value = true
  }
})

// 处理用户数据和身份映射
const processUserData = (userData: any) => {
  // 确保获得正确的角色
  let role = ''
  if (userData.authorityRole) {
    // 已经在后端设置了角色
    role = userData.authorityRole
  } else {
    // 基于身份设置角色
    role = 'ROLE_' + ruleForm.identity.toUpperCase()
  }

  // 构建用户信息对象
  const userInfo = {
    id:userData.id|| '',
    name: userData.name || '未命名用户',
    username: userData.username || ruleForm.username,
    description: userData.description || '',
    authorityRole: role, // 使用确定的角色
    identity: ruleForm.identity,
    email: userData.email || '',
    collegeId: userData.collegeId || '',
    collegeName: userData.collegeName || '',
    phone: userData.phone || '',
    oldPassword: '',
    newPassword: '',
    avatar: userData.avatar || ''
  }
  
  return userInfo
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      console.log('提交的登录数据:', ruleForm)
      
      // 显示加载状态
      const loading = ElMessage({
        message: '正在登录，请稍候...',
        type: 'info',
        duration: 0
      })
      
      login(ruleForm).then((res) => {
        // 关闭加载提示
        loading.close()
        
        console.log('服务器返回数据:', res)
        if(!res){
          console.log('登录失败，返回数据为空')
          ElMessage.error("登录失败，请检查账号密码")
          return
        }
        
        // 打印完整的返回数据结构
        console.log('返回数据结构:', JSON.stringify(res))
        
        // 检查状态码，处理可能的错误情况
        // 先尝试处理不同的响应结构，获取实际的响应数据
        let responseData: any = res;
        
        // 处理不同的响应结构
        if (res.data !== undefined) {
          // 标准Axios响应，数据在res.data中
          responseData = res.data;
        }
        
        // 检查各种错误状态码
        const statusCode = responseData.code || responseData.status;
        console.log('响应状态码:', statusCode);
        
        // 如果状态码表示错误，则阻止导航并显示错误信息
        if (statusCode === 400 || statusCode === 401 || statusCode === 403 || statusCode === 500) {
          // 从响应中提取错误信息
          const errorMessage = responseData.message || responseData.msg || responseData.error || '登录失败，请检查账号密码';
          console.error('登录失败，状态码:', statusCode, '错误信息:', errorMessage);
          ElMessage.error(errorMessage);
          return;
        }
        
        // 明确检查是否是成功的响应
        const isSuccessResponse = statusCode === 200 || statusCode === 0 || statusCode === undefined;
        if (!isSuccessResponse) {
          console.warn('未知的响应状态码:', statusCode, '阻止导航');
          ElMessage.warning('登录异常，请稍后重试');
          return;
        }
        
        // 提取用户数据，正确处理返回结构
        // 根据控制台输出，用户信息在res.data.data中
        let userData
        if (res.data && res.data.data) {
          userData = res.data.data
        } else if (res.data) {
          userData = res.data
        } else {
          userData = res
        }
        console.log('提取后的userData详情:', userData)
        
        // 处理用户信息和角色
        const userInfo = processUserData(userData)
        
        // 处理头像URL，确保是完整URL路径
        if (userInfo.avatar && !userInfo.avatar.startsWith('http')) {
          userInfo.avatar = 'http://localhost:39999/' + userInfo.avatar
          console.log('处理后的头像URL:', userInfo.avatar)
        } else if (!userInfo.avatar) {
          // 如果没有头像，使用Element Plus默认头像作为替代
          userInfo.avatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
          console.log('使用默认头像:', userInfo.avatar)
        }
        
        console.log('准备存储的用户信息:', userInfo)
        
        // 保存到store
        studentStore.setUserInfo(userInfo)
        console.log('store中的用户信息:', studentStore.userInfo)
        
        ElMessage.success({
          message: `欢迎回来，${userInfo.name} (${getRoleName(userInfo.authorityRole)})`,
          duration: 3000
        })
        
        // 保存到localStorage
        if (userData.jwt) {
          localStorage.setItem('token', userData.jwt)
        }
        localStorage.setItem('name', userInfo.name)
        localStorage.setItem('id', userInfo.id)
        localStorage.setItem('username', userInfo.username)
        localStorage.setItem('authorityRole', userInfo.authorityRole)
        localStorage.setItem('identity', userInfo.identity)
        
        // 如果用户选择了"记住我"，保存账号
        if (rememberMe.value) {
          localStorage.setItem('remember_username', userInfo.username)
        } else {
          localStorage.removeItem('remember_username')
        }
        
        // 保存额外字段
        if (userInfo.email) {
          localStorage.setItem('email', userInfo.email)
        }
        if (userInfo.collegeId) {
          localStorage.setItem('collegeId', userInfo.collegeId)
        }
        if (userInfo.collegeName) {
          localStorage.setItem('collegeName', userInfo.collegeName)
        } else if (userInfo.collegeId) {
          console.log('需要通过学院ID获取学院名称:', userInfo.collegeId)
          
          localStorage.setItem('collegeName', '学院信息将在页面加载后获取')
        }
        if (userInfo.phone) {
          localStorage.setItem('phone', userInfo.phone)
        }
        if (userInfo.description) {
          localStorage.setItem('description', userInfo.description)
        }
        
        // 保存头像URL到localStorage
        if (userInfo.avatar) {
          localStorage.setItem('avatar', userInfo.avatar)
        } else {
          // 清除可能存在的无效头像URL
          localStorage.removeItem('avatar')
        }
        
        console.log('localStorage中的信息:', {
          name: localStorage.getItem('name'),
          id: localStorage.getItem('id'),
          authorityRole: localStorage.getItem('authorityRole'),
          avatar: localStorage.getItem('avatar'),
          email: localStorage.getItem('email'),
          phone: localStorage.getItem('phone'),
          collegeId: localStorage.getItem('collegeId'),
          collegeName: localStorage.getItem('collegeName'),
          description: localStorage.getItem('description')
        })
        
        router.push('/welcome')
      }).catch((error: any) => {
        // 关闭加载提示
        loading.close()
        
        console.error("登录失败，详细错误：", error)
        ElMessage.error("登录失败，请稍后重试")
      })
    } else {
      console.log('表单验证失败')
      ElMessage.warning("请正确填写登录信息")
    }
  })
}

// 获取角色名称
const getRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    'ROOT': '系统管理员',
    'ROLE_TEACHER': '教师',
    'ROLE_STUDENT': '学生',
    'ROLE_ADMIN': '管理员'
  }
  return roleMap[role] || '用户';
};
</script>

<style lang="scss" scoped>
.login-box {
  width: 100%;
  height: 100%;
  background: url("src/assets/login-bg.jpg") center center/cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
  }
}

.login-content {
  display: flex;
  width: 85%;
  max-width: 1100px;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.login-left {
  width: 50%;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 40px;
  color: white;
  display: flex;
  align-items: center;
}

.system-intro {
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

.system-features {
  margin-top: 40px;
}

.feature-item {
  display: flex;
  margin-bottom: 30px;
  
  .feature-icon {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    flex-shrink: 0;
    overflow: hidden;
    
    img {
      width: 70%;
      height: 70%;
      object-fit: contain;
    }
    
    i {
      font-size: 24px;
    }
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

.login-form-wrapper {
  width: 50%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-ruleForm {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  
  h2 {
    font-size: 28px;
    text-align: center;
    margin-bottom: 10px;
    color: #333;
    font-weight: 600;
  }
  
  .welcome-text {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
    font-size: 14px;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
}

.form-input {
  width: 100%;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .forgot-link {
    color: #409EFF;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.form-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  
  .login-btn, .register-btn {
    flex: 1;
    height: 40px;
    font-size: 16px;
  }
  
  .login-btn {
    background: linear-gradient(to right, #1e3c72, #2a5298);
    border: none;
    
    &:hover {
      background: linear-gradient(to right, #162c55, #1e3c72);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(30, 60, 114, 0.3);
    }
  }
  
  .register-btn {
    &:hover {
      border-color: #1e3c72;
      color: #1e3c72;
    }
  }
}

.login-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}

// 响应式适配
@media screen and (max-width: 992px) {
  .login-content {
    flex-direction: column;
    width: 90%;
  }
  
  .login-left, .login-form-wrapper {
    width: 100%;
  }
  
  .login-left {
    padding: 30px;
  }
  
  .system-intro {
    h1 {
      font-size: 28px;
    }
    
    .slogan {
      font-size: 16px;
      margin-bottom: 20px;
    }
  }
  
  .feature-item {
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 576px) {
  .login-content {
    width: 95%;
  }
  
  .login-left {
    padding: 20px;
  }
  
  .login-form-wrapper {
    padding: 20px 15px;
  }
  
  .form-buttons {
    flex-direction: column;
  }
}

.logo-container {
  text-align: center;
  margin-bottom: 10px;

  .logo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
