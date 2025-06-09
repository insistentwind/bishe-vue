<template>
  <div class="user-detail-page">
    <div class="page-header">
      <h2>用户详情</h2>
      <p>查看用户的详细信息</p>
    </div>

    <el-card class="detail-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>用户信息</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="handleEdit">编辑</el-button>
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </template>

      <div class="user-basic-info">
        <div class="user-avatar">
          <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar">
            {{ userInfo.name?.substring(0, 1) }}
          </el-avatar>
        </div>
        <div class="user-info-content">
          <h3>{{ userInfo.name }} <small>({{ userInfo.username }})</small></h3>
          <el-tag 
            :type="getRoleTagType(userInfo.roleId)" 
            effect="dark" 
            class="user-role-tag"
          >
            {{ getRoleName(userInfo.roleId) }}
          </el-tag>
          <el-tag 
            :type="userInfo.status === 1 ? 'success' : 'danger'" 
            effect="plain" 
            class="user-status-tag"
          >
            {{ userInfo.status === 1 ? '启用' : '禁用' }}
          </el-tag>
          <p class="user-contact">
            <span v-if="userInfo.phone"><i class="el-icon-phone"></i> {{ userInfo.phone }}</span>
            <span v-if="userInfo.email"><i class="el-icon-message"></i> {{ userInfo.email }}</span>
          </p>
        </div>
      </div>

      <el-divider></el-divider>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ userInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag :type="getRoleTagType(userInfo.roleId)">
                {{ getRoleName(userInfo.roleId) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ userInfo.IdCard || '无' }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ userInfo.sex === 1 ? '男' : userInfo.sex === 2 ? '女' : '未知' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'">
                {{ userInfo.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="用户类别">{{ userInfo.identity || '无' }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ userInfo.phone || '无' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email || '无' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ userInfo.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ userInfo.updateTime }}</el-descriptions-item>
            <el-descriptions-item label="个人简介" :span="2">
              <p style="white-space: pre-line;">{{ userInfo.description || '无' }}</p>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 教师特有信息 -->
        <el-tab-pane label="教师信息" name="teacher" v-if="userInfo.roleId === 4">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="教师ID">{{ userInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="所属学院">{{ userInfo.collegeName || '无' }}</el-descriptions-item>
            <el-descriptions-item label="职称">{{ userInfo.title || '无' }}</el-descriptions-item>
            <el-descriptions-item label="学历">{{ userInfo.education || '无' }}</el-descriptions-item>
            <el-descriptions-item label="简介" :span="2">
              <p style="white-space: pre-line;">{{ userInfo.description || '无' }}</p>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 学生特有信息 -->
        <el-tab-pane label="学生信息" name="student" v-if="userInfo.roleId === 5">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学号">{{ userInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ userInfo.className || '无' }}</el-descriptions-item>
            <el-descriptions-item label="专业">{{ userInfo.majorName || '无' }}</el-descriptions-item>
            <el-descriptions-item label="学院">{{ userInfo.collegeName || '无' }}</el-descriptions-item>
            <el-descriptions-item label="年级">{{ userInfo.grade || '无' }}</el-descriptions-item>
            <el-descriptions-item label="入学日期">{{ userInfo.enrollment || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 系统信息 -->
        <el-tab-pane label="系统信息" name="system" v-if="userInfo.roleId === 2">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="角色编码">{{ userInfo.code || '无' }}</el-descriptions-item>
            <el-descriptions-item label="显示顺序">{{ userInfo.sort || '无' }}</el-descriptions-item>
            <el-descriptions-item label="数据权限">
              {{ 
                userInfo.dataScope === 0 ? '所有数据' : 
                userInfo.dataScope === 1 ? '部门及子部门数据' : 
                userInfo.dataScope === 2 ? '本部门数据' : 
                userInfo.dataScope === 3 ? '本人数据' : '未知'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="逻辑删除">
              <el-tag :type="userInfo.delFlag === 0 ? 'success' : 'danger'">
                {{ userInfo.delFlag === 0 ? '正常' : '已删除' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 登录记录 -->
        <el-tab-pane label="登录记录" name="login">
          <el-table :data="loginRecords" stripe>
            <el-table-column label="登录时间" prop="loginTime" width="180" />
            <el-table-column label="登录IP" prop="loginIp" width="180" />
            <el-table-column label="登录地点" prop="loginLocation" />
            <el-table-column label="设备/浏览器" prop="browser" :show-overflow-tooltip="true" />
            <el-table-column label="操作系统" prop="os" :show-overflow-tooltip="true" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getUserDetail,
  getUserInfo,
  getRoleName
} from '@/api/user'

const route = useRoute()
const router = useRouter()
const userId = computed(() => route.params.id as string)

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 页面状态
const loading = ref(false)
const activeTab = ref('basic')

// 用户数据
const userInfo = ref<any>({})

// 登录记录（模拟数据）
const loginRecords = ref([
  {
    id: '1',
    userId: '1',
    loginTime: '2023-08-15 10:30:45',
    loginIp: '192.168.1.100',
    loginLocation: '中国 广西 桂林',
    browser: 'Chrome 95.0.4638.69',
    os: 'Windows 10',
    status: 1
  },
  {
    id: '2',
    userId: '1',
    loginTime: '2023-08-14 14:20:15',
    loginIp: '192.168.1.100',
    loginLocation: '中国 广西 桂林',
    browser: 'Chrome 95.0.4638.69',
    os: 'Windows 10',
    status: 1
  },
  {
    id: '3',
    userId: '1',
    loginTime: '2023-08-13 08:45:30',
    loginIp: '114.114.114.114',
    loginLocation: '中国 广东 广州',
    browser: 'Firefox 92.0',
    os: 'macOS 12.0.1',
    status: 0
  }
])

// 获取角色标签类型
const getRoleTagType = (roleId?: number) => {
  if (!roleId) return 'info';
  
  // 根据后端实际返回的角色ID调整映射关系
  // 2: 系统管理员, 4: 老师, 5: 学生
  const typeMap: Record<number, string> = {
    2: 'danger',  // 系统管理员
    4: 'warning', // 老师
    5: 'success'  // 学生
  }
  return typeMap[roleId] || 'info'
}

// 初始化函数
onMounted(async () => {
  if (userId.value) {
    await loadUserDetail()
  } else {
    ElMessage.error('用户ID不能为空')
    goBack()
  }
})

// 加载用户详情
const loadUserDetail = async () => {
  loading.value = true
  try {
    // 使用新的API获取用户详情
    const res = await getUserInfo(Number(userId.value))
    console.log('获取用户详情原始响应:', res)
    
    if (res.data && res.data.code === 200) {
      // 直接使用后端返回的数据
      userInfo.value = res.data.data
      console.log('用户详情数据:', JSON.stringify(userInfo.value, null, 2))
      
      // 检查所有返回的字段
      console.log('返回的所有字段:', Object.keys(userInfo.value))
      
      // 检查IdCard字段是否存在
      if (userInfo.value.IdCard) {
        console.log('身份证号存在:', userInfo.value.IdCard)
      } else {
        console.warn('身份证号字段不存在或为空')
        // 检查是否有其他类似的字段
        const possibleKeys = Object.keys(userInfo.value).filter(key => 
          key.toLowerCase().includes('id') && key.toLowerCase().includes('card')
        )
        if (possibleKeys.length > 0) {
          console.warn('可能的身份证字段:', possibleKeys)
        }
      }
      
      // 设置适当的标签页
      if (userInfo.value.roleId === 4) {
        activeTab.value = 'teacher'
      } else if (userInfo.value.roleId === 5) {
        activeTab.value = 'student'
      } else {
        activeTab.value = 'basic'
      }
      
    } else {
      ElMessage.error(res.data?.msg || '获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
    }
    ElMessage.error('获取用户详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/admin/user')
}

// 跳转到编辑页面
const handleEdit = () => {
  router.push(`/admin/user/edit/${userId.value}`)
}
</script>

<style scoped>
.user-detail-page {
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

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions .el-button {
  margin-left: 10px;
}

.user-basic-info {
  display: flex;
  margin-bottom: 20px;
}

.user-avatar {
  margin-right: 20px;
}

.user-info-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.user-info-content h3 small {
  font-size: 0.8em;
  color: #909399;
  font-weight: normal;
}

.user-role-tag {
  margin-right: 10px;
}

.user-contact {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.user-contact span {
  margin-right: 20px;
}

.user-contact i {
  margin-right: 5px;
}
</style> 