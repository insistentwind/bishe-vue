<template>
  <div class="register-box">
    <div class="register-content">
      <div class="register-left">
        <div class="system-intro">
          <h1>在线批阅系统</h1>
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
      
      <div class="register-right">
        <div class="register-form-wrapper">
          <div class="register-header">
            <img src="https://cdn.jsdelivr.net/npm/@vant/assets/logo.png" alt="Logo" class="logo"/>
            <h2>账号注册</h2>
            <p class="welcome-text">欢迎注册在线批阅系统，请填写以下信息</p>
          </div>
          
          <div class="register-tabs">
            <div 
              class="tab-item" 
              :class="{ active: identity === 'student' }" 
              @click="identity = 'student'"
            >
              <i class="tab-icon student-icon"></i>
              <span>学生注册</span>
            </div>
            <div 
              class="tab-item" 
              :class="{ active: identity === 'teacher' }" 
              @click="identity = 'teacher'"
            >
              <i class="tab-icon teacher-icon"></i>
              <span>教师注册</span>
            </div>
          </div>
          
          <el-form
            v-if="identity==='student'"
            ref="ruleFormRef"
            :model="studentInfo"
            status-icon
            :rules="rules"
            label-position="top"
            class="register-form"
          >
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="学号" prop="id">
                  <el-input v-model="studentInfo.username" autocomplete="off" placeholder="请输入学号"/>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="studentInfo.name" autocomplete="off" placeholder="请输入姓名"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属学院" prop="collegeId">
                  <el-select v-model="studentInfo.collegeId" placeholder="选择学院" class="full-width">
                    <el-option
                      v-for="item in optionsCollege"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="密码" prop="password">
                  <el-input
                    v-model="studentInfo.password"
                    type="password"
                    autocomplete="off"
                    placeholder="请输入密码"
                    show-password
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="password"
                    type="password"
                    autocomplete="off"
                    placeholder="请再次输入密码"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="身份证号" prop="idCard">
                  <el-input
                    v-model="studentInfo.idCard"
                    autocomplete="off"
                    placeholder="请输入身份证号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="studentInfo.email"
                    autocomplete="off"
                    placeholder="请输入邮箱"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <div class="form-buttons">
              <el-button type="primary" class="register-btn" @click="submitForm(ruleFormRef)">
                注册
              </el-button>
              <el-button type="default" class="login-btn" @click="toLogin()">
                已有账号，去登录
              </el-button>
            </div>
          </el-form>
          
          <el-form
            v-if="identity==='teacher'"
            ref="ruleFormRef"
            :model="teacherInfo"
            status-icon
            :rules="rules"
            label-position="top"
            class="register-form"
          >
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="教师ID" prop="teacherId">
                  <el-input v-model="teacherInfo.username" autocomplete="off" placeholder="请输入教师ID"/>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="teacherInfo.name" autocomplete="off" placeholder="请输入姓名"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属学院" prop="collegeId">
                  <el-select v-model="teacherInfo.collegeId" placeholder="选择学院" class="full-width">
                    <el-option
                      v-for="item in optionsCollege"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="密码" prop="teacherPassword">
                  <el-input
                    v-model="teacherInfo.password"
                    type="password"
                    autocomplete="off"
                    placeholder="请输入密码"
                    show-password
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="password"
                    type="password"
                    autocomplete="off"
                    placeholder="请再次输入密码"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="身份证号" prop="idCardNo">
                  <el-input
                    v-model="teacherInfo.idCard"
                    autocomplete="off"
                    placeholder="请输入身份证号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="teacherEmail">
                  <el-input
                    v-model="teacherInfo.email"
                    autocomplete="off"
                    placeholder="请输入邮箱"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <div class="form-buttons">
              <el-button type="primary" class="register-btn" @click="submitForm(ruleFormRef)">
                注册
              </el-button>
              <el-button type="default" class="login-btn" @click="toLogin()">
                已有账号，去登录
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick} from "vue";
import type {FormInstance, FormRules} from 'element-plus';
import {useRouter} from "vue-router";
import {ElMessage} from 'element-plus';
import {registerStudent, registerTeacher, verificationCode} from "@/request/login/login"
import {query} from "@/request/school/query";

interface TeacherInfo {
  collegeId: string
  username: string
  name: string
  password: string
  idCard: string
  email: string
  code: string
  roleId: string
  status: string
  description: string
}

interface StudentInfo {
  collegeId: string
  username: string
  password: string
  name: string
  idCard: string
  email: string
  code: string
  gender: string
  status: string
  roleId: string
  description: string
}

interface College {
  id: number,
  collegeId: string,
  collegeName: string,
}

interface CollegeOption {
  value: string,
  label: string
}

const password = ref();
const collegeList = ref<College[]>([]);
const optionsCollege = ref<CollegeOption[]>([]);
const ruleFormRef = ref<FormInstance>()
const router = useRouter()
const studentInfo = ref<StudentInfo>({
  collegeId: '',
  username: '',
  password: '123456',
  name: 'insistentwind',
  idCard: '',
  email: '',
  code: '123456',
  gender: '1',
  status: '1',
  roleId: '5',
  description: '',
})
const teacherInfo = ref<TeacherInfo>({
  collegeId: '',
  username: '',
  name: 'insistentwind',
  password: '123456',
  idCard: '',
  email: '',
  code: '123456',
  roleId: '4',
  status: '1',
  description: '',
})
const identity = ref('student') // 默认选择学生

const rules = {
  username: [
    {required: true, message: '请输入账号', trigger: 'blur'},
    {min: 3, max: 20, message: '账号长度必须在3-20个字符之间', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 3, max: 20, message: '密码长度必须在3-20个字符之间', trigger: 'blur'},
  ],
  name: [
    {required: true, message: '请输入姓名', trigger: 'blur'},
  ],
  collegeId: [
    {required: true, message: '请选择学院', trigger: 'change'},
  ],
  idCard: [
    {required: true, message: '请输入身份证号', trigger: 'blur'},
    {pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur'},
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur'},
  ],
};

const toLogin = () => {
  router.push("/")
}

const getOptions = async () => {
  try {
    // 从API获取数据
    const data = await query();
    
    // 直接打印响应，查看结构
    console.log('API响应:', data);
    
    // 根据响应拦截器的设置，我们直接获取到的是data数组
    if (data && Array.isArray(data)) {
      collegeList.value = data;
      optionsCollege.value = collegeList.value.map(college => ({
        value: college.collegeId,
        label: college.collegeName
      }));
      console.log('已加载学院列表:', optionsCollege.value);
    } else {
      console.error('获取学院列表失败：数据格式不正确', data);
      ElMessage.error('获取学院列表失败，请稍后重试');
    }
  } catch (error) {
    console.error('获取学院列表失败：', error);
    ElMessage.error('获取学院列表失败，请稍后重试');
  }
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (password.value !== studentInfo.value.password && password.value !== teacherInfo.value.password) {
    ElMessage.error("两次密码不一致")
    return
  }
  
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (identity.value === 'student') {
          ElMessage.info('正在注册，请稍候...');
          try {
            // 由于request/login/login.ts可能使用的是不同的axios实例，我们需要检查返回格式
            const res = await registerStudent(studentInfo.value as any);
            // 检查响应结构
            console.log('注册学生响应:', res);
            if (res.data && res.data.code === 200) {
              ElMessage.success(res.data.msg || "创建成功")
              await nextTick()
              router.push("/")
            } else {
              ElMessage.error(res.data?.msg || "注册失败")
            }
          } catch (error) {
            throw error;
          }
        } else if (identity.value === 'teacher') {
          ElMessage.info('正在注册，请稍候...');
          try {
            // 由于request/login/login.ts可能使用的是不同的axios实例，我们需要检查返回格式
            const res = await registerTeacher(teacherInfo.value as any);
            // 检查响应结构
            console.log('注册教师响应:', res);
            if (res.data && res.data.code === 200) {
              ElMessage.success(res.data.msg || "创建成功")
              await nextTick()
              router.push("/")
            } else {
              ElMessage.error(res.data?.msg || "注册失败")
            }
          } catch (error) {
            throw error;
          }
        }
      } catch (error) {
        console.error('注册失败：', error);
        ElMessage.error("注册失败，请稍后重试")
      }
    }
  })
}

onMounted(async () => {
  await getOptions();
  console.log('组件已挂载，学院列表:', optionsCollege.value);
});

</script>

<style lang="scss" scoped>
.register-box {
  width: 100%;
  height: 100%;
  background: url("@/assets/login-bg.jpg") center center/cover no-repeat;
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

.register-content {
  display: flex;
  width: 85%;
  max-width: 1200px;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.register-left {
  width: 40%;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 40px;
  color: white;
  display: flex;
  align-items: center;
}

.system-intro {
  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 15px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .slogan {
    font-size: 16px;
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

.register-right {
  width: 60%;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.register-form-wrapper {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.register-header {
  text-align: center;
  margin-bottom: 20px;
  
  .logo {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
  }
  
  h2 {
    font-size: 26px;
    text-align: center;
    margin-bottom: 10px;
    color: #333;
    font-weight: 600;
  }
  
  .welcome-text {
    color: #666;
    margin-bottom: 20px;
    font-size: 14px;
  }
}

.register-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  
  .tab-item {
    padding: 10px 20px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    display: flex;
    align-items: center;
    margin-right: 20px;
    color: #666;
    transition: all 0.3s ease;
    
    &.active {
      color: #1e3c72;
      border-bottom-color: #1e3c72;
      font-weight: 500;
    }
    
    &:hover:not(.active) {
      color: #2a5298;
    }
    
    .tab-icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
      background-size: contain;
      background-repeat: no-repeat;
      
      &.student-icon {
        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTggMlY4SDE0VjJIMThNOCA0VjE2SDRWNEg4TTEzIDE4SDExVjE2SDEzVjE4TTEzIDE1SDExVjEzSDEzVjE1TTEzIDEySDExVjEwSDEzVjEyTTE2IDdWNUgxNlY3SDE2TTE5IDdWNUgyMVY3SDE5TTE5IDRIMTFWOUFIMTFWNE0xOSAyMEgyVjE4SDEwQTEgMSAwIDAgMSAxMSAxOVYyMEgxOU0yMiAxMFYyMkgyMFYxMU0xOSA0SDExVjlIMTFWNEgxOU0xNiA3VjVIMTZWN0gxNlpNMTkgN1Y1SDIxVjdIMTlaIi8+PC9zdmc+');
      }
      
      &.teacher-icon {
        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMjAgMTdhMiAyIDAgMCAwIDItMlY0YTIgMiAwIDAgMC0yLTJIOS40NmMuMzUuNjEuNTQgMS4zLjU0IDJoMTB2MTFoLTl2Mm0tNy05SDl2OUg0djJoMTF2LTJoLTN2LTloM1Y2SDR2MloiLz48L3N2Zz4=');
      }
    }
  }
}

.register-form {
  width: 100%;
  
  .el-form-item {
    margin-bottom: 20px;
  }
}

.full-width {
  width: 100%;
}

.form-buttons {
  display: flex;
  gap: 15px;
  margin: 20px 0;
  
  .register-btn, .login-btn {
    flex: 1;
    height: 40px;
    font-size: 16px;
  }
  
  .register-btn {
    background: linear-gradient(to right, #1e3c72, #2a5298);
    border: none;
    
    &:hover {
      background: linear-gradient(to right, #162c55, #1e3c72);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(30, 60, 114, 0.3);
    }
  }
  
  .login-btn {
    border: 1px solid #dcdfe6;
    color: #606266;
    
    &:hover {
      border-color: #1e3c72;
      color: #1e3c72;
    }
  }
}

// 响应式适配
@media screen and (max-width: 992px) {
  .register-content {
    flex-direction: column;
    width: 90%;
  }
  
  .register-left, .register-right {
    width: 100%;
  }
  
  .register-left {
    padding: 30px;
  }
  
  .register-form-wrapper {
    max-width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .register-content {
    width: 95%;
  }
  
  .register-form-wrapper {
    padding: 20px 10px;
  }
  
  .form-buttons {
    flex-direction: column;
  }
}
</style>

