<template>
  <div class="admin-layout">
    <!-- 侧边导航栏 -->
    <div class="sidebar" :class="{ 'is-collapsed': isCollapse }">
      <div class="sidebar-header">
        <div class="logo-container">
          <img src="https://cdn.jsdelivr.net/npm/@vant/assets/logo.png" alt="系统Logo" class="logo" />
          <h1 v-if="!isCollapse" class="logo-text">教育管理系统</h1>
        </div>
        <el-icon class="collapse-icon" @click="toggleSidebar">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
      
      <div class="sidebar-menu">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :collapse="isCollapse"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse-transition="false"
          router
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <template #title>控制面板</template>
          </el-menu-item>
          
          <!-- 个人中心菜单 -->
          <el-sub-menu index="0">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>个人中心</span>
            </template>
            <el-menu-item index="/admin/profile">个人资料</el-menu-item>
            <el-menu-item index="/admin/password">修改密码</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="1">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/admin/user">用户列表</el-menu-item>
            <el-menu-item index="/admin/role">角色管理</el-menu-item>
            <!-- <el-menu-item index="/admin/permission">权限设置</el-menu-item> -->
          </el-sub-menu>
          
          <el-sub-menu index="2">
            <template #title>
              <el-icon><OfficeBuilding /></el-icon>
              <span>学院管理</span>
            </template>
            <el-menu-item index="/admin/college">学院列表</el-menu-item>
            <el-menu-item index="/admin/major">专业管理</el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/admin/class">
            <el-icon><OfficeBuilding /></el-icon>
            <template #title>班级管理</template>
          </el-menu-item>
          
          <!-- <el-menu-item index="/admin/teacher">
            <el-icon><Avatar /></el-icon>
            <template #title>教师管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/student">
            <el-icon><UserFilled /></el-icon>
            <template #title>学生管理</template>
          </el-menu-item> -->
          
          <el-menu-item index="/admin/course">
            <el-icon><Reading /></el-icon>
            <template #title>课程管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/exam">
            <el-icon><Document /></el-icon>
            <template #title>考试管理</template>
          </el-menu-item>
          
          <el-sub-menu index="8">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/admin/settings">基本设置</el-menu-item>
            <el-menu-item index="/admin/backup">数据备份</el-menu-item>
            <el-menu-item index="/admin/log">系统日志</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'is-expanded': isCollapse }">
      <!-- 顶部导航栏 -->
      <div class="top-navbar">
        <div class="navbar-left">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="breadcrumb.first">{{ breadcrumb.first }}</el-breadcrumb-item>
              <el-breadcrumb-item v-if="breadcrumb.second">{{ breadcrumb.second }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        
        <div class="navbar-right">
          <span class="time-display">{{ currentTime }}</span>
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="admin-info">
              <el-avatar :size="32" :src="adminInfo.avatar" />
              <span class="admin-name">{{ adminInfo.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 页面内容区域 -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled, User, School, OfficeBuilding, UserFilled, Reading, Document,
  Setting, Avatar, Fold, Expand, ArrowDown
} from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const isCollapse = computed(() => adminStore.isCollapse)
const currentTime = ref(new Date().toLocaleString())

// 面包屑导航
const breadcrumb = reactive({
  first: '',
  second: ''
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 管理员信息
const adminInfo = reactive({
  id: localStorage.getItem('admin_id') || '',
  name: localStorage.getItem('admin_name') || '管理员',
  avatar: localStorage.getItem('admin_avatar') || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  role: localStorage.getItem('admin_role') || 'ADMIN'
})

// 切换侧边栏状态
const toggleSidebar = () => {
  adminStore.toggleCollapse()
}

// 定时器更新时间
let timer: any = null
const startTimer = () => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'settings':
      router.push('/admin/settings')
      break
    case 'password':
      router.push('/admin/password')
      break
    case 'logout':
      ElMessageBox.confirm(
        '确定要退出系统吗?',
        '退出提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 清除管理员数据
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_id')
        localStorage.removeItem('admin_name')
        localStorage.removeItem('admin_avatar')
        localStorage.removeItem('admin_role')
        
        // 清除Store数据
        adminStore.clearAdminInfo()
        
        ElMessage.success('已安全退出系统')
        router.push('/admin/login')
      }).catch(() => {
        // 取消退出
      })
      break
  }
}

// 更新面包屑导航
const updateBreadcrumb = () => {
  const pathMap: Record<string, { first: string, second?: string }> = {
    '/admin/dashboard': { first: '控制面板' },
    '/admin/user': { first: '用户管理', second: '用户列表' },
    '/admin/role': { first: '用户管理', second: '角色管理' },
    '/admin/permission': { first: '用户管理', second: '权限设置' },
    '/admin/college': { first: '学院管理', second: '学院列表' },
    '/admin/major': { first: '学院管理', second: '专业管理' },
    '/admin/class': { first: '班级管理' },
    '/admin/teacher': { first: '教师管理' },
    '/admin/student': { first: '学生管理' },
    '/admin/course': { first: '课程管理', second: '课程列表' },
    '/admin/course/create': { first: '课程管理', second: '新增课程' },
    '/admin/course/edit': { first: '课程管理', second: '编辑课程' },
    '/admin/exam': { first: '考试管理' },
    '/admin/settings': { first: '系统设置', second: '基本设置' },
    '/admin/backup': { first: '系统设置', second: '数据备份' },
    '/admin/log': { first: '系统设置', second: '系统日志' },
    '/admin/profile': { first: '个人中心', second: '个人资料' },
    '/admin/password': { first: '个人中心', second: '修改密码' },
  }
  
  const currentPath = route.path
  // 处理带参数的路径，如/admin/course/edit/1
  let matchPath = currentPath
  if (currentPath.includes('/admin/course/edit/')) {
    matchPath = '/admin/course/edit'
  } else if (currentPath.includes('/admin/user/edit/')) {
    matchPath = '/admin/user/edit'
  } else if (currentPath.includes('/admin/user/detail/')) {
    matchPath = '/admin/user/detail'
  }
  
  const pathInfo = pathMap[matchPath] || { first: '', second: '' }
  
  breadcrumb.first = pathInfo.first || ''
  breadcrumb.second = pathInfo.second || ''
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateBreadcrumb()
  }
)

// 组件挂载时
onMounted(() => {
  startTimer()
  updateBreadcrumb()
})

// 组件卸载时
onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  height: 100%;
  background-color: #001529;
  transition: width 0.3s;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  
  &.is-collapsed {
    width: 64px;
  }
  
  .sidebar-header {
    height: 60px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .logo-container {
      display: flex;
      align-items: center;
      overflow: hidden;
      
      .logo {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 10px;
      }
      
      .logo-text {
        font-size: 16px;
        margin: 0;
        white-space: nowrap;
        transition: opacity 0.3s, transform 0.3s;
      }
    }
    
    .collapse-icon {
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      border-radius: 4px;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
  
  .sidebar-menu {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #001529;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
    
    .el-menu {
      border-right: none;
    }
    
    .el-menu-vertical:not(.el-menu--collapse) {
      width: 220px;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
  
  &.is-expanded {
    margin-left: -156px;
  }
  
  .top-navbar {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #ebeef5;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    background-color: #fff;
    
    .navbar-left {
      display: flex;
      align-items: center;
      
      .breadcrumb {
        margin-left: 10px;
      }
    }
    
    .navbar-right {
      display: flex;
      align-items: center;
      
      .time-display {
        margin-right: 20px;
        color: #606266;
        font-size: 14px;
      }
      
      .admin-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 4px;
        
        &:hover {
          background-color: #f5f7fa;
        }
        
        .admin-name {
          margin: 0 5px 0 10px;
          font-size: 14px;
          color: #303133;
        }
      }
    }
  }
  
  .page-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f0f2f5;
    
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f0f2f5;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 4px;
      border: 2px solid #f0f2f5;
    }
  }
}
</style> 