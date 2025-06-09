<template>
  <div class="welcome-container">
    <!-- 顶部欢迎语 -->
    <div class="welcome-header">
      <h1 class="system-title">在线批阅系统</h1>
      <div class="greeting-text">
        <span class="time-greeting">{{ getTimeGreeting() }}</span>
        <span class="user-name">{{ form.name }}</span>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧用户信息 -->
      <div class="left-panel">
        <el-card class="user-info-card" shadow="hover">
          <div class="user-profile">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :auto-upload="false"
              accept="image/*"
              @change="handleAvatarChange"
            >
              <div class="avatar-wrapper">
                <img 
                  v-if="form.avatar" 
                  :src="form.avatar" 
                  class="avatar"
                  @error="handleAvatarError" 
                />
                <img v-else src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" class="avatar" />
                <div class="avatar-hover">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
            </el-upload>
            <h2 class="welcome-text">{{ form.name }}</h2>
            <div class="user-role">
              <el-tag type="success" effect="dark" round>{{ getRoleName(form.authorityRole) }}</el-tag>
            </div>
            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-label">学院</div>
                <div class="stat-value">{{ collegeNameMap[form.collegeId] || '未知学院' }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">账号</div>
                <div class="stat-value">{{ form.username }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 快捷功能入口 -->
        <el-card class="quick-access-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷功能</span>
            </div>
          </template>
          <div class="quick-access-grid">
            <div class="quick-access-item" @click="navigateTo('课程管理')">
              <el-icon><Reading /></el-icon>
              <span>课程管理</span>
            </div>
            <div class="quick-access-item" @click="navigateTo('考试管理')">
              <el-icon><Files /></el-icon>
              <span>考试管理</span>
            </div>
            <div class="quick-access-item" @click="navigateTo('成绩统计')">
              <el-icon><DataAnalysis /></el-icon>
              <span>成绩统计</span>
            </div>
            <div class="quick-access-item" @click="navigateTo('批阅作业')">
              <el-icon><EditPen /></el-icon>
              <span>批阅作业</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧功能区域 -->
      <div class="right-panel">
        <!-- 用户信息卡片 -->
        <el-card class="personal-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <div>
                <el-button v-if="!editMode" @click="enableEdit" type="primary" size="small" plain>
                  <el-icon><Edit /></el-icon> 修改信息
                </el-button>
                <template v-else>
                  <el-button @click="cancelEdit" size="small" plain>
                    取消
                  </el-button>
                  <el-button @click="update" type="primary" size="small">
                    保存
                  </el-button>
                </template>
              </div>
            </div>
          </template>
          <el-form label-position="top" :model="form" class="info-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名">
                  <el-input v-model="form.name" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="账号">
                  <el-input v-model="form.username" disabled></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学院">
                  <el-input :model-value="collegeNameMap[form.collegeId] || '未知学院'" readonly disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" :disabled="!editMode">
                    <template #prefix><el-icon><Phone /></el-icon></template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
              
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="身份权限">
                  <el-input :model-value="getRoleName(form.authorityRole)" readonly disabled>
                    <template #prefix><el-icon><User /></el-icon></template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" :disabled="!editMode">
                    <template #prefix><el-icon><Message /></el-icon></template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="个人简介">
              <el-input 
                v-model="form.description" 
                :disabled="!editMode" 
                type="textarea" 
                :rows="3"
                placeholder="填写您的个人简介..."
              ></el-input>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 系统公告 -->
        <el-card class="announcement-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
              <el-tag type="info" effect="plain" size="small">{{ announcements.length }}条公告</el-tag>
            </div>
          </template>
          <div v-if="announcements.length > 0" class="announcement-list">
            <div v-for="(item, index) in announcements" :key="index" class="announcement-item">
              <div class="announcement-title">
                <el-icon><Bell /></el-icon>
                <span>{{ item.title }}</span>
              </div>
              <div class="announcement-content">{{ item.content }}</div>
              <div class="announcement-time">{{ item.time }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无公告" />
        </el-card>

        <!-- 使用指南 -->
        <el-card class="guide-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统使用指南</span>
            </div>
          </template>
          <el-steps :active="1" simple>
            <el-step title="创建考试" icon="Files"></el-step>
            <el-step title="添加试题" icon="EditPen"></el-step>
            <el-step title="批阅答卷" icon="Check"></el-step>
            <el-step title="成绩统计" icon="DataAnalysis"></el-step>
          </el-steps>
          <div class="guide-content">
            <p>在线批阅系统帮助您高效管理教学工作。从创建考试到成绩分析，全流程数字化。</p>
            <el-button type="primary" plain @click="viewSystemGuide">查看详细指南</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {ElMessage} from "element-plus";
import {useStudentStore} from "@/stores/counter";
import {updatePassword, updateUserInfo, uploadAvatar} from "@/request/login/login";
import { Camera, Message, Phone, Edit, Reading, Files, DataAnalysis, EditPen, Bell, Check, User } from '@element-plus/icons-vue'
import { getAllColleges } from '@/request/school/query'
import router from '@/router';

const studentStore = useStudentStore();

// 编辑模式状态
const editMode = ref(false);

// 学院名称映射表
const collegeNameMap = ref<Record<string, string>>({});

// 启用编辑模式
const enableEdit = () => {
  editMode.value = true;
};

// 取消编辑
const cancelEdit = () => {
  editMode.value = false;
  // 重置表单为初始值
  const storeUserInfo = studentStore.userInfo;
  form.value = {
    ...storeUserInfo,
    oldPassword: '',
    name: storeUserInfo.name || localStorage.getItem('name') || '用户',
    id: storeUserInfo.id || localStorage.getItem('id') || '',
    username: storeUserInfo.username || localStorage.getItem('username') || '',
    authorityRole: storeUserInfo.authorityRole || localStorage.getItem('authorityRole') || '',
    avatar: storeUserInfo.avatar || localStorage.getItem('avatar') || '',
    email: storeUserInfo.email || localStorage.getItem('email') || '',
    collegeId: storeUserInfo.collegeId || localStorage.getItem('collegeId') || '',
    collegeName: storeUserInfo.collegeName || localStorage.getItem('collegeName') || '',
    phone: storeUserInfo.phone || localStorage.getItem('phone') || '',
  };
};

// 定义学院数据接口
interface College {
  id: number;
  collegeId: string;
  collegeName: string;
}

// 学院列表
const collegeList = ref<College[]>([]);

// 获取所有学院
const fetchColleges = async () => {
  try {
    const res = await getAllColleges();
    console.log('获取到的学院列表:', res);
    if (res && Array.isArray(res)) {
      collegeList.value = res;
      
      // 创建学院ID到名称的映射
      collegeList.value.forEach(college => {
        collegeNameMap.value[college.collegeId] = college.collegeName;
      });
      
      console.log('学院名称映射:', collegeNameMap.value);
    } else {
      console.error('学院数据格式不正确');
    }
  } catch (error) {
    console.error('获取学院列表出错:', error);
    ElMessage.error('获取学院列表失败');
  }
};

interface User{
  id:string,
  name:string,
  username:string,
  avatar:string,
  oldPassword:string,
  newPassword:string,
  description:string,
  authorityRole:string,
  identity:string,
  email:string,
  collegeId:string,
  collegeName:string,
  phone:string
}
const form=ref<User>({
  id:'',
  name:'',
  username:'',
  avatar: '',
  oldPassword:'',
  newPassword:'',
  description:'',
  authorityRole:'',
  identity:'',
  email:'',
  collegeId:'',
  collegeName:'',
  phone:''
});

// 示例公告数据
interface Announcement {
  title: string;
  content: string;
  time: string;
}

const announcements = ref<Announcement[]>([
  {
    title: '系统更新通知',
    content: '在线批阅系统已更新至最新版本，新增了多种题型支持和智能评分功能。',
    time: '2025-04-16'
  },
  {
    title: '期末考试安排',
    content: '请各位教师于下周开始准备期末考试相关资料，并在系统中创建考试。',
    time: '2025-04-16'
  }
]);

// 获取基于时间的问候语
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好，';
  if (hour < 9) return '早上好，';
  if (hour < 12) return '上午好，';
  if (hour < 14) return '中午好，';
  if (hour < 18) return '下午好，';
  if (hour < 22) return '晚上好，';
  return '夜深了，';
};

// 导航到其他页面
const navigateTo = (destination: string) => {
  const routeMap: Record<string, string> = {
    '课程管理': '/myclass',
    '考试管理': '/exam',
    '成绩统计': '/seeScore',
    '批阅作业': '/score'
  };
  
  const route = routeMap[destination];
  if (route) {
    router.push(route);
  } else {
    ElMessage.info('该功能即将上线');
  }
};

// 查看系统使用指南
const viewSystemGuide = () => {
  ElMessage.info('系统使用指南即将上线');
};

const update = async () => {
  try {
    // 保存原始数据用于回滚
    const originalData = { ...form.value };
    
    // 更新用户基本信息，只更新可编辑的字段
    const userInfoRes = await updateUserInfo({
      name: form.value.name,         // 保留姓名字段，但前端已设置为不可编辑
      username: form.value.username, // 保留用户名字段，但前端已设置为不可编辑
      description: form.value.description, // 可编辑
      avatar: form.value.avatar,     // 可通过上传头像修改
      collegeId: form.value.collegeId, // 保留学院字段，但前端已设置为不可编辑
      collegeName: form.value.collegeName || collegeNameMap.value[form.value.collegeId] || '未知学院', // 添加学院名称
      phone: form.value.phone,       // 手机号可编辑
      email: form.value.email        // 邮箱可编辑
    });
    
    console.log('updateUserInfo响应数据:', userInfoRes);
    
    // 根据service拦截器处理，userInfoRes可能是字符串"修改成功"
    if (userInfoRes) {
      ElMessage.success("个人信息更新成功");
      
      // 确保所有字段都有值再更新store
      const updatedUserInfo = {
        ...form.value,
        phone: form.value.phone || originalData.phone || '',
        email: form.value.email || originalData.email || '',
        description: form.value.description || originalData.description || '',
        collegeName: form.value.collegeName || collegeNameMap.value[form.value.collegeId] || originalData.collegeName || '未知学院'
      };
      
      // 更新 store 中的用户信息
      studentStore.setUserInfo(updatedUserInfo);
      
      // 更新本地存储
      localStorage.setItem('name', updatedUserInfo.name);
      localStorage.setItem('avatar', updatedUserInfo.avatar);
      localStorage.setItem('collegeId', updatedUserInfo.collegeId);
      localStorage.setItem('collegeName', updatedUserInfo.collegeName);  // 保存学院名称
      localStorage.setItem('phone', updatedUserInfo.phone);
      localStorage.setItem('email', updatedUserInfo.email);
      localStorage.setItem('description', updatedUserInfo.description);
      
      console.log('更新后的用户信息:', updatedUserInfo);
      
      // 退出编辑模式
      editMode.value = false;
      
      // 强制刷新表单显示的数据
      refreshUserInfo();
    } else {
      ElMessage.error("个人信息更新失败");
    }
  } catch (error) {
    console.error('更新失败:', error);
    ElMessage.error("更新失败，请重试");
  }
}

// 添加刷新用户信息函数
const refreshUserInfo = async () => {
  try {
    // 从localStorage获取最新数据
    const updatedData = {
      id: localStorage.getItem('id') || form.value.id,
      name: localStorage.getItem('name') || form.value.name,
      username: localStorage.getItem('username') || form.value.username,
      avatar: localStorage.getItem('avatar') || form.value.avatar,
      email: localStorage.getItem('email') || form.value.email,
      phone: localStorage.getItem('phone') || form.value.phone,
      description: localStorage.getItem('description') || form.value.description,
      collegeId: localStorage.getItem('collegeId') || form.value.collegeId,
      collegeName: localStorage.getItem('collegeName') || form.value.collegeName || collegeNameMap.value[form.value.collegeId] || '未知学院',
      authorityRole: localStorage.getItem('authorityRole') || form.value.authorityRole,
      identity: localStorage.getItem('identity') || form.value.identity,
      oldPassword: '',
      newPassword: ''
    };
    
    // 更新表单数据
    form.value = updatedData;
    console.log('刷新后的用户信息:', form.value);
  } catch (error) {
    console.error('刷新用户信息出错:', error);
  }
};

onMounted(async () => {
  // 获取学院列表
  await fetchColleges();
  
  // 输出所有localStorage内容，用于调试
  console.log('当前localStorage中的所有数据:',{
    name: localStorage.getItem('name'),
    id: localStorage.getItem('id'),
    authorityRole: localStorage.getItem('authorityRole'),
    avatar: localStorage.getItem('avatar'),
    email: localStorage.getItem('email'),
    collegeId: localStorage.getItem('collegeId'),
    collegeName: localStorage.getItem('collegeName'),
    phone: localStorage.getItem('phone'),
    description: localStorage.getItem('description'),
    identity: localStorage.getItem('identity')
  });
  
  // 从store和localStorage加载用户信息
  const storeUserInfo = studentStore.userInfo
  console.log('从store获取的用户信息:', storeUserInfo)
  
  // 为缺失的字段设置默认值
  const defaultEmail = storeUserInfo.email || localStorage.getItem('email') || '';
  const defaultPhone = storeUserInfo.phone || localStorage.getItem('phone') || '';
  const defaultDescription = storeUserInfo.description || localStorage.getItem('description') || '';
  const defaultCollegeName = storeUserInfo.collegeName || localStorage.getItem('collegeName') || '';
  
  // 如果字段为空，设置默认值
  if (!storeUserInfo.email && defaultEmail) {
    studentStore.updateUserField('email', defaultEmail);
  }
  
  if (!storeUserInfo.phone && defaultPhone) {
    studentStore.updateUserField('phone', defaultPhone);
  }
  
  if (!storeUserInfo.description && defaultDescription) {
    studentStore.updateUserField('description', defaultDescription);
  }
  
  if (!storeUserInfo.collegeName && defaultCollegeName) {
    studentStore.updateUserField('collegeName', defaultCollegeName);
  }
  
  form.value = {
    ...storeUserInfo,
    oldPassword: '',
    // 如果store中没有数据，尝试从localStorage获取
    name: storeUserInfo.name || localStorage.getItem('name') || '用户',
    id: storeUserInfo.id || localStorage.getItem('id') || '',
    username: storeUserInfo.username || localStorage.getItem('username') || '',
    authorityRole: storeUserInfo.authorityRole || localStorage.getItem('authorityRole') || '',
    avatar: storeUserInfo.avatar || localStorage.getItem('avatar') || '',
    email: defaultEmail,
    collegeId: storeUserInfo.collegeId || localStorage.getItem('collegeId') || '',
    collegeName: defaultCollegeName,
    phone: defaultPhone,
    description: defaultDescription,
    identity: storeUserInfo.identity || localStorage.getItem('identity') || '',
  }
  console.log('初始化的表单数据:', form.value)
  console.log('email字段:', form.value.email);
  console.log('phone字段:', form.value.phone);
  
  // 处理头像URL
  if (form.value.avatar && typeof form.value.avatar === 'string' && !form.value.avatar.startsWith('http')) {
    form.value.avatar = 'http://localhost:39999/' + form.value.avatar
    console.log('处理后的头像URL:', form.value.avatar)
    
    // 将完整URL保存回localStorage
    localStorage.setItem('avatar', form.value.avatar)
  }
  
  // 延迟500ms后再次刷新用户信息，确保页面完全加载后使用最新数据
  setTimeout(() => {
    refreshUserInfo();
  }, 500);
});

// 处理头像上传
const handleAvatarChange = async (file: any) => {
  try {
    console.log('开始上传头像，文件信息:', file)
    const formData = new FormData()
    formData.append('file', file.raw)
    console.log('FormData内容:', formData)
    
    const response = await uploadAvatar(formData)
    console.log('上传头像响应:', response)
    
    if (response) {
      // 确保avatarUrl是字符串类型
      let avatarUrl = response as unknown as string
      console.log('头像上传成功，URL:', avatarUrl)
      
      // 确保URL格式正确
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = 'http://localhost:39999/' + avatarUrl
      }
      
      // 更新头像URL
      form.value.avatar = avatarUrl
      console.log('更新后的form.avatar:', form.value.avatar)
      
      // 保存到localStorage
      localStorage.setItem('avatar', form.value.avatar)
      console.log('已将头像URL保存到localStorage:', localStorage.getItem('avatar'))
      
      // 更新 store
      studentStore.setUserInfo({
        ...form.value
      })
      console.log('更新后的store用户信息:', studentStore.userInfo)
      
      ElMessage.success('头像上传成功')
    } else {
      console.error('头像上传失败')
      ElMessage.error('头像上传失败')
    }
  } catch (error) {
    console.error('上传头像过程中发生错误:', error)
    ElMessage.error('头像上传失败')
  }
}

// 处理头像加载错误
const handleAvatarError = (e: Event) => {
  console.log('头像加载错误，使用默认头像')
  const img = e.target as HTMLImageElement
  
  // 首先尝试使用Element-Plus内置的稳定头像
  img.src = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  
  // 如果Element-Plus默认头像也加载失败
  img.onerror = () => {
    console.error('Element-Plus默认头像加载失败')
    // 清除无效的头像URL
    form.value.avatar = ''
    localStorage.removeItem('avatar')
    
    // 隐藏头像元素（最后的备用方案）
    img.style.display = 'none'
  }
}

// 获取角色名称
const getRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    'ROLE_STUDENT': '学生',
    'ROLE_TEACHER': '教师',
    'ROLE_ADMIN': '管理员'
  }
  return roleMap[role] || '未知角色'
}
</script>

<style scoped>
.welcome-container {
  padding: 20px;
}

.welcome-header {
  text-align: center;
  margin-bottom: 30px;
}

.system-title {
  font-size: 32px;
  color: #409EFF;
  margin-bottom: 10px;
}

.greeting-text {
  font-size: 24px;
  color: #606266;
}

.time-greeting {
  margin-right: 5px;
}

.user-name {
  font-weight: bold;
  color: #303133;
}

.main-content {
  display: flex;
  gap: 20px;
}

.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info-card, 
.quick-access-card, 
.personal-info-card, 
.announcement-card, 
.guide-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.user-info-card:hover, 
.quick-access-card:hover, 
.personal-info-card:hover, 
.announcement-card:hover, 
.guide-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-hover {
  opacity: 1;
}

.welcome-text {
  margin: 0 0 10px;
  font-size: 20px;
  color: #303133;
}

.user-role {
  margin-bottom: 15px;
}

.profile-stats {
  width: 100%;
  display: flex;
  margin-top: 15px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0 10px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  color: #303133;
  font-weight: bold;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.quick-access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  background-color: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-access-item:hover {
  background-color: #ecf5ff;
  transform: scale(1.05);
}

.quick-access-item .el-icon {
  font-size: 28px;
  color: #409EFF;
  margin-bottom: 10px;
}

.info-form {
  max-width: 100%;
}

.announcement-list {
  max-height: 300px;
  overflow-y: auto;
}

.announcement-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.announcement-title .el-icon {
  color: #E6A23C;
  margin-right: 8px;
}

.announcement-content {
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}

.announcement-time {
  color: #909399;
  font-size: 12px;
  text-align: right;
}

.guide-content {
  margin-top: 20px;
  text-align: center;
}

.guide-content p {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.6;
}
</style>
