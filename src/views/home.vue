<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="sidebar">
      <!-- 系统标题和Logo -->
      <div class="logo-container">
        <img src="../assets/school.png" class="logo-image">
        <div class="logo-text">在线批阅系统</div>
      </div>

      <!-- 用户信息简介 -->
      <div class="sidebar-user-info">
        <el-avatar 
          :src="userInfo.avatar || '/src/assets/avatar.png'" 
          :size="48"
          @error="handleAvatarError"
        ></el-avatar>
        <div class="user-details">
          <div class="user-name">{{ username || '用户' }}</div>
          <div class="user-role">{{ getRoleName(role) }}</div>
        </div>
      </div>

      <!-- 侧边菜单 -->
      <el-scrollbar>
        <el-menu
          :default-openeds="opends"
          class="sidebar-menu"
          :default-active="activeMenu"
          :router="false"
          @select="handleSelect"
        >
          <!-- 管理员菜单 -->
          <el-sub-menu v-if="isAdmin" index="1">
            <template #title>
              <el-icon><Notification /></el-icon>
              <span>信息管理</span>
            </template>
            <el-menu-item index="1-1" @click="toSchool">
              <template #title>
                <el-icon><School /></el-icon>
                <span>学院管理</span>
              </template>
            </el-menu-item>
            <el-menu-item index="1-2" @click="toTeacher">
              <template #title>
                <el-icon><UserFilled /></el-icon>
                <span>教师管理</span>
              </template>
            </el-menu-item>
            <el-menu-item index="1-3" @click="toStudentInfo">
              <template #title>
                <el-icon><User /></el-icon>
                <span>学生管理</span>
              </template>
            </el-menu-item>
            <el-menu-item index="1-4" @click="toClass">
              <template #title>
                <el-icon><Reading /></el-icon>
                <span>课程管理</span>
              </template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 系统公告 - 所有用户可见 -->
          <el-menu-item index="9" @click="toAnnouncement">
            <el-icon><Bell /></el-icon>
            <template #title>系统公告</template>
          </el-menu-item>
          
          <!-- 教师可见菜单 -->
          <el-menu-item v-if="isTeacher"
            index="2" @click="toMyClass">
            <el-icon><Collection /></el-icon>
            <template #title>我的课程</template>
          </el-menu-item>

          <el-sub-menu v-if="isTeacher" index="3">
            <template #title>
              <el-icon><Calendar /></el-icon>
              <span>考试管理</span>
            </template>
            <el-menu-item index="3-1" @click="toTest">
              <template #title>
                <el-icon><Paperclip /></el-icon>
                <span>测试安排</span>
              </template>
            </el-menu-item>
            <el-menu-item index="3-2" @click="toExam">
              <template #title>
                <el-icon><Files /></el-icon>
                <span>考试安排</span>
              </template>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item v-if="isTeacher"
            index="4" @click="toScore">
            <el-icon><EditPen /></el-icon>
            <template #title>在线批阅</template>
          </el-menu-item>
          
          <el-menu-item v-if="isTeacher"
            index="8" @click="toExamEditor">
            <el-icon><Document /></el-icon>
            <template #title>试卷编辑</template>
          </el-menu-item>
          
          <el-menu-item v-if="isTeacher"
            index="14" @click="toCourseAnswer">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>课程答疑</template>
          </el-menu-item>
          
          <!-- 学生可见菜单 -->
          <el-menu-item v-if="isStudent" index="2" @click="toStudentCourses">
            <el-icon><Collection /></el-icon>
            <template #title>课程查询</template>
          </el-menu-item>
          
          <el-menu-item v-if="isStudent" index="12" @click="toClassInfo">
            <el-icon><Reading /></el-icon>
            <template #title>班级信息</template>
          </el-menu-item>
          
          <el-menu-item v-if="isStudent" index="5" @click="toMyGrades">
            <el-icon><PieChart /></el-icon>
            <template #title>我的成绩</template>
          </el-menu-item>
          
          <el-menu-item v-if="isStudent" index="6" @click="toTakeExam">
            <el-icon><EditPen /></el-icon>
            <template #title>参加考试</template>
          </el-menu-item>
          
          <el-menu-item v-if="isStudent" index="13" @click="toCourseConsult">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>课程咨询</template>
          </el-menu-item>
          
          <!-- 通用菜单（除管理员外） -->
          <el-menu-item v-if="!isAdmin && !isStudent" index="5" @click="toSeeScore">
            <el-icon><PieChart /></el-icon>
            <template #title>成绩统计</template>
          </el-menu-item>
          
          <!-- 所有用户可见 -->
          <el-menu-item index="10" @click="toStatistics">
            <el-icon><DataLine /></el-icon>
            <template #title>系统统计</template>
          </el-menu-item>
          
          <el-menu-item index="11" @click="toResources">
            <el-icon><Files /></el-icon>
            <template #title>教学资源</template>
          </el-menu-item>
          
          <!-- 管理员菜单 -->
          <el-menu-item v-if="isAdmin" index="6" @click="toAuthority">
            <el-icon><Setting /></el-icon>
            <template #title>权限管理</template>
          </el-menu-item>
          
          <!-- 所有用户可见 -->
          <el-menu-item index="7" @click="toWelcome">
            <el-icon><User /></el-icon>
            <template #title>个人中心</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>

      <!-- 底部操作栏 -->
      <div class="sidebar-footer">
        <el-tooltip content="退出登录" placement="top">
          <el-button @click="logout" class="logout-button" type="danger" text>
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-button>
        </el-tooltip>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 头部导航栏 -->
      <el-header class="main-header">
        <div class="header-left">
          <el-button @click="toggleSidebar" text>
            <el-icon :size="20"><Fold /></el-icon>
          </el-button>
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ mark }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        
        <div class="header-right">
          <el-tooltip content="全屏显示" placement="bottom">
            <el-button @click="toggleFullScreen" text>
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="刷新页面" placement="bottom">
            <el-button @click="refreshPage" text>
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-dropdown trigger="click">
            <el-button text class="user-dropdown">
              <el-avatar 
                :src="userInfo.avatar || '/src/assets/avatar.png'" 
                :size="32"
              ></el-avatar>
              <span class="username">{{ username || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toWelcome">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主要内容区 -->
      <el-main class="content-area">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import {ref, onMounted, computed} from 'vue';
import {
  Document, Menu as IconMenu, Setting, Notification, User, EditPen, Crop, ArrowDown,
  School, UserFilled, Reading, Collection, Calendar, Files, Paperclip, PieChart,
  FullScreen, Refresh, Fold, SwitchButton, Bell, DataLine, ChatDotRound
} from '@element-plus/icons-vue'
import {useRouter, useRoute} from "vue-router";
import {ElMessage} from 'element-plus';
import {useStudentStore} from '../stores/counter'

interface UserInfo {
  avatar: string;
  name: string;
  authorityRole: string;
}

const studentStore = useStudentStore()
const router = useRouter();
const route = useRoute();
const username = ref(localStorage.getItem("name"));
const mark = ref("欢迎使用");
const opends = ['1', '3'];
const role = ref('');
const sidebarCollapsed = ref(false);
const userInfo = ref<UserInfo>({
  avatar: '',
  name: '',
  authorityRole: ''
});

// 当前活动菜单
const activeMenu = computed(() => {
  const path = route.path;
  if (path.includes('school')) return '1-1';
  if (path.includes('teacher')) return '1-2';
  if (path.includes('studentInfo')) return '1-3';
  if (path.includes('class') && !path.includes('classInfo') && !path.includes('myClassInfo')) return '1-4';
  if (path.includes('myclass')) return '2';
  if (path.includes('test')) return '3-1';
  if (path.includes('exam') && !path.includes('takeExam')) return '3-2';
  if (path.includes('score')) return '4';
  if (path.includes('seeScore')) return '5';
  if (path.includes('authority')) return '6';
  if (path.includes('welcome')) return '7';
  if (path.includes('editor')) return '8';
  if (path.includes('announcement')) return '9';
  if (path.includes('statistics')) return '10';
  if (path.includes('resources')) return '11';
  if (path.includes('classInfo')) return '12';
  if (path.includes('myClassInfo')) return '12'; // 新增的myClassInfo页面使用和classInfo相同的菜单索引
  if (path.includes('studentCourses')) return '2';
  if (path.includes('myGrades')) return '5';
  if (path.includes('takeExam')) return '6';
  if (path.includes('courseConsult')) return '13';
  if (path.includes('courseAnswer')) return '14';
  return '';
});

// 切换侧边栏展开/收起
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// 刷新页面
const refreshPage = () => {
  window.location.reload();
};

// 切换全屏
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

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

// 判断用户身份的计算属性
const isStudent = computed(() => role.value === 'ROLE_STUDENT');
const isTeacher = computed(() => role.value === 'ROLE_TEACHER');
const isAdmin = computed(() => role.value === 'ROOT' || role.value === 'ROLE_ADMIN');

const handleSelect = (index: string) => {
  console.log('选中菜单项:', index);
};

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const logout=()=>{
  localStorage.clear();
  ElMessage.success("退出登录")
  router.push("/");
}
const toSchool = () => {
  mark.value = "学院管理";
  router.push('school');
}
const toClass = () => {
  mark.value = "课程管理";
  router.push('class');
  localStorage.setItem('class', 'class');
}
const toMyClass = () => {
  // 根据用户角色决定跳转页面
  if (isStudent.value) {
    mark.value = "班级信息";
    router.push('myClassInfo');
  } else {
  mark.value = "我的课程";
  router.push('myclass');
  localStorage.setItem('class', 'myclass');
  }
}
const toTest = () => {
  mark.value = "测试安排"
  router.push('test');
}
const toExam = () => {
  mark.value = "考试安排"
  router.push('exam');
}
const toScore = () => {
  mark.value = "在线批阅"
  router.push('score');
}
const toSeeScore = () => {
  mark.value = "成绩统计"
  router.push('seeScore');
}
const toWelcome = () => {
  mark.value = "个人中心"
  router.push('welcome');
}
const toTeacher = () => {
  mark.value = "教师管理"
  router.push('teacher');
}
const toAuthority = () => {
  mark.value = "权限管理"
  router.push('authority');
}
const toStudentInfo = () => {
  mark.value = "学生管理"
  router.push('studentInfo');
}
const toExamEditor = () => {
  mark.value = "试卷编辑"
  router.push('editor')
}
const toAnnouncement = () => {
  mark.value = "系统公告"
  router.push('announcement')
}
const toStatistics = () => {
  mark.value = "系统统计";
  router.push("/statistics");
};
const toResources = () => {
  mark.value = "教学资源";
  router.push("/resources");
};

// 学生专用路由方法
const toStudentCourses = () => {
  mark.value = "课程查询";
  router.push("/studentCourses");
};

const toClassInfo = () => {
  mark.value = "班级详情";
  router.push("/classInfo");
};

const toMyGrades = () => {
  mark.value = "我的成绩";
  router.push("/myGrades");
};

const toTakeExam = () => {
  mark.value = "参加考试";
  router.push("/takeExam");
};

const toCourseConsult = () => {
  mark.value = "课程咨询";
  router.push("/courseConsult");
};

const toCourseAnswer = () => {
  mark.value = "课程答疑";
  router.push("/courseAnswer");
};

// 处理头像加载错误
const handleAvatarError = () => {
  console.log('头像加载错误，使用默认头像')
  
  // 尝试不同的默认头像路径
  const defaultAvatarPaths = [
    '/src/assets/avatar.png',       // 绝对路径
    '../assets/avatar.png',         // 相对路径
    './assets/avatar.png',          // 相对路径变体
    'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png' // 外部CDN备用
  ];
  
  // 设置为一个稳定的Element-Plus内置默认头像
  userInfo.value.avatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
  
  // 清除无效的头像URL
  localStorage.removeItem('avatar');
}

onMounted(async () => {
  try {
    // 从store获取用户信息
    const storeUserInfo = studentStore.userInfo
    console.log('当前用户信息:', storeUserInfo)
    
    // 设置用户信息
    userInfo.value = {
      avatar: storeUserInfo.avatar || localStorage.getItem('avatar') || '',
      name: storeUserInfo.name || localStorage.getItem('name') || '用户',
      authorityRole: storeUserInfo.authorityRole || localStorage.getItem('authorityRole') || ''
    }
    
    // 设置角色
    role.value = userInfo.value.authorityRole || localStorage.getItem('authorityRole') || ''
    console.log('当前用户角色:', role.value)
    
    // 验证角色是否合法
    if (!['ROOT', 'ROLE_TEACHER', 'ROLE_STUDENT', 'ROLE_ADMIN'].includes(role.value)) {
      console.warn('未识别的用户角色:', role.value)
      // 设置默认角色，防止UI错误
      role.value = 'ROLE_STUDENT'
    }
    
    // 设置用户名
    username.value = userInfo.value.name || localStorage.getItem('name') || '用户'
    console.log('当前用户名:', username.value)
    
    // 如果头像URL不是以http开头，添加API基础URL
    if (userInfo.value.avatar && typeof userInfo.value.avatar === 'string') {
      if (!userInfo.value.avatar.startsWith('http')) {
        userInfo.value.avatar = 'http://localhost:39999/' + userInfo.value.avatar
      }
      console.log('处理后的头像URL:', userInfo.value.avatar)
      
      // 预加载头像图片
      const img = new Image()
      img.src = userInfo.value.avatar
      img.onload = () => {
        console.log('头像预加载成功')
        // 将处理后的完整URL保存到localStorage，这样下次刷新就直接使用完整URL
        localStorage.setItem('avatar', userInfo.value.avatar)
      }
      img.onerror = () => {
        console.error('头像预加载失败')
        userInfo.value.avatar = ''  // 设置为空以显示默认头像
        localStorage.removeItem('avatar') // 清除无效的头像URL
      }
    }
  } catch (error) {
    console.error('加载用户信息出错:', error)
  }
});
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
  background-color: #f8fafc;  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2388c1ff' fill-opacity='0.1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* 侧边栏样式 */
.sidebar {
  position: relative;
  background: linear-gradient(135deg, #e6f2ff 0%, #f5f7fa 100%);
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s, transform 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.logo-container {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);
  background: linear-gradient(to right, rgba(64, 158, 255, 0.1), rgba(103, 194, 255, 0.05));
}

.logo-image {
  height: 42px;
  width: 42px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.2));
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-left: 12px;
  letter-spacing: 1px;
}

.sidebar-user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  background-color: rgba(64, 158, 255, 0.05);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 10px;
  border-radius: 0 0 8px 8px;
}

.user-details {
  margin-left: 12px;
  overflow: hidden;
}

.user-name {
  font-size: 16px;
  font-weight: bold;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #67c2ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 54px;
  line-height: 54px;
  color: #606266;
  padding: 0 20px !important;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
  margin: 4px 8px;
  border-radius: 8px;
  width: 90%;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(to right, rgba(64, 158, 255, 0.15), rgba(64, 158, 255, 0.05));
  color: #409EFF;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  border-left: 3px solid #409EFF;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(64, 158, 255, 0.05);
  color: #409EFF;
  transform: translateX(3px);
}

/* 子菜单样式优化 */
.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background-color: transparent;
  padding: 5px 0;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  height: 48px;
  line-height: 48px;
  color: #606266;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  margin: 4px 8px;
  padding-left: 45px !important;
  font-size: 14px;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  transform: translateX(3px);
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background: linear-gradient(to right, rgba(64, 158, 255, 0.15), rgba(64, 158, 255, 0.05));
  color: #409EFF;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  border-left: 3px solid #409EFF;
}

.sidebar-menu :deep(.el-menu-item) .el-icon,
.sidebar-menu :deep(.el-sub-menu__title) .el-icon {
  margin-right: 10px;
  font-size: 18px;
  color: inherit;
}

.sidebar-menu :deep(.el-menu--inline) .el-menu-item {
  height: 48px;
  line-height: 48px;
  padding-left: 45px !important;
  font-size: 14px;
  font-weight: normal;
  margin: 2px 8px;
  border-radius: 6px;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  border-bottom: none;
  position: relative;
}

.sidebar-menu :deep(.el-sub-menu__title)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(64, 158, 255, 0.1), transparent);
}

.sidebar-menu :deep(.el-menu-item):not(.is-active):not(:last-child) {
  border-bottom: none;
}

.sidebar-menu :deep(.el-sub-menu.is-opened) .el-menu-item {
  font-size: 14px;
  color: #606266;
  background-color: rgba(64, 158, 255, 0.02);
}

.sidebar-menu :deep(.el-sub-menu.is-opened) .el-menu-item.is-active {
  color: #409EFF;
  font-weight: 600;
  background: linear-gradient(to right, rgba(64, 158, 255, 0.15), rgba(64, 158, 255, 0.05));
}

.sidebar-footer {
  padding: 15px;
  background-color: rgba(64, 158, 255, 0.03);
  border-top: 1px solid rgba(64, 158, 255, 0.05);
  text-align: center;
}

.logout-button {
  width: 100%;
  color: #f56c6c;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 6px;
  transition: all 0.3s;
  background-color: rgba(245, 108, 108, 0.05);
  border: 1px solid rgba(245, 108, 108, 0.1);
}

.logout-button:hover {
  background-color: rgba(245, 108, 108, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.15);
}

.logout-button .el-icon {
  margin-right: 8px;
  vertical-align: middle;
}

/* 主内容区样式 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: transparent;
}

.main-header {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  background-color: #ffffff;
  border-bottom: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 5;
  border-radius: 0 0 12px 12px;
  margin: 0 15px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.breadcrumb {
  margin-left: 20px;
  font-weight: 500;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  color: #606266;
}

.breadcrumb :deep(.el-breadcrumb__item:last-child) {
  color: #409EFF;
  font-weight: bold;
}

.header-right .el-button {
  color: #606266;
  border-radius: 50%;
  padding: 8px;
  transition: all 0.3s;
  margin: 0 5px;
}

.header-right .el-button:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.1);
}

.user-dropdown {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  transition: all 0.3s;
  background-color: rgba(64, 158, 255, 0.05);
  margin-left: 15px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.user-dropdown:hover {
  background-color: rgba(64, 158, 255, 0.1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.username {
  margin: 0 8px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #409EFF;
  font-weight: 500;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 25px;
  position: relative;
  margin: 15px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.03);
}

.content-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, rgba(64, 158, 255, 0.03), transparent);
  pointer-events: none;
  border-radius: 12px 12px 0 0;
}
</style>

