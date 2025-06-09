<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <p>管理系统中的所有用户信息</p>
    </div>

    <!-- 搜索和过滤区域 -->
    <el-card class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="queryParams.roleId" placeholder="请选择角色" clearable>
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据操作工具栏 -->
    <el-card class="table-container">
      <template #header>
        <div class="card-header">
          <div class="left-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增用户
            </el-button>
            <el-button type="success" :disabled="!selectedUserIds.length" @click="handleBatchEnable">
              <el-icon><Check /></el-icon>批量启用
            </el-button>
            <el-button type="warning" :disabled="!selectedUserIds.length" @click="handleBatchDisable">
              <el-icon><Close /></el-icon>批量禁用
            </el-button>
            <el-button type="danger" :disabled="!selectedUserIds.length" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>批量删除
            </el-button>
          </div>
          <div class="right-actions">
            <el-button type="primary" plain @click="handleExport">
              <el-icon><Download /></el-icon>导出
            </el-button>
            <el-dropdown @command="handleImportCommand">
              <el-button type="success" plain>
                <el-icon><Upload /></el-icon>导入<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="template">下载模板</el-dropdown-item>
                  <el-dropdown-item command="import">导入数据</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <!-- 用户数据表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
        border
        style="width: 100%"
        :max-height="500"
        highlight-current-row
        table-layout="fixed"
        :cell-style="{ 'text-align': 'center' }"
        :header-cell-style="{ 'text-align': 'center', background: '#f8f8f9' }"
      >
        <el-table-column type="selection" width="55" align="center" fixed="left" />
        <el-table-column label="用户名" prop="username" width="120" show-overflow-tooltip fixed="left" />
        <el-table-column label="姓名" prop="name" width="120" show-overflow-tooltip fixed="left" />
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar || defaultAvatar">{{ row.name?.substring(0, 1) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="角色" prop="roleId" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.roleId)">
              {{ row.roleName || getRoleName(row.roleId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="电话" prop="phone" width="140" show-overflow-tooltip />
        <el-table-column label="邮箱" prop="email" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" width="170" show-overflow-tooltip />
        <el-table-column label="操作" width="330" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="handleUpdate(row)">编辑</el-button>
            <el-button
              size="small"
              type="success"
              v-if="row.status === 0"
              @click="handleStatusChange(row, 1)"
            >
              启用
            </el-button>
            <el-button
              size="small"
              type="warning"
              v-else
              @click="handleStatusChange(row, 0)"
            >
              禁用
            </el-button>
            <el-button
              size="small"
              type="info"
              @click="handleResetPassword(row)"
            >
              重置密码
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Plus, Delete, Search, Refresh, Check, Close, Download, Upload, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import {
  getUserList,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  roleOptions,
  getRoleName,
  exportUsers,
  downloadImportTemplate,
  importUsers,
  type AdminUserInfo,
  type AdminPageDto,
  type PageResult
} from '@/api/user'
import type { ApiResponse } from '@/request/admin'

// 添加router实例
const router = useRouter()

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 搜索参数
const queryParams = reactive<AdminPageDto>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  name: '',
  roleId: undefined,
  status: undefined
})

// 表格数据
const loading = ref(false)
const userList = ref<AdminUserInfo[]>([])
const total = ref(0)
const selectedUserIds = ref<number[]>([])

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
  try {
    // 测试API调用
    const { testGetUserList } = await import('@/api/user');
    await testGetUserList();
  } catch (error) {
    console.error('测试API调用失败:', error);
  }
  
  // 获取用户列表数据
  await getUserListData()
})

// 获取用户列表数据
const getUserListData = async () => {
  loading.value = true
  try {
    console.log('发送请求参数:', queryParams)
    const response = await getUserList(queryParams)
    console.log('原始响应:', response)
    
    // 处理响应数据
    if (response) {
      console.log('响应体:', response)
      
      if (response.code === 200 && response.data) {
        // 成功获取数据
        const pageResult = response.data
        console.log('分页数据:', pageResult)
        
        if (pageResult.records && Array.isArray(pageResult.records)) {
          userList.value = pageResult.records
          total.value = pageResult.total || 0
          console.log('用户列表数据:', userList.value)
          console.log('总记录数:', total.value)
        } else {
          console.error('分页数据格式异常:', pageResult)
          ElMessage.error('获取用户列表失败: 数据格式异常')
        }
      } else {
        console.error('接口返回错误:', response.msg || '未知错误')
        ElMessage.error(response.msg || '获取用户列表失败')
      }
    } else {
      console.error('响应异常:', response)
      ElMessage.error('获取用户列表失败: 响应异常')
    }
  } catch (error: any) {
    console.error('请求异常:', error)
    if (error.response) {
      console.error('错误响应:', error.response)
    }
    ElMessage.error('获取用户列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理查询按钮点击
const handleQuery = () => {
  queryParams.pageNum = 1
  getUserListData()
}

// 重置查询表单
const resetQuery = () => {
  queryParams.username = ''
  queryParams.name = ''
  queryParams.roleId = undefined
  queryParams.status = undefined
  queryParams.pageNum = 1
  getUserListData()
}

// 处理表格选择变化事件
const handleSelectionChange = (selection: AdminUserInfo[]) => {
  selectedUserIds.value = selection.map(item => item.id)
}

// 处理查看用户详情
const handleViewDetail = (row: AdminUserInfo) => {
  router.push(`/admin/user/detail/${row.id}`)
}

// 处理新增用户
const handleAdd = () => {
  router.push('/admin/user/create')
}

// 处理编辑用户
const handleUpdate = (row: AdminUserInfo) => {
  router.push(`/admin/user/edit/${row.id}`)
}

// 处理用户状态变更
const handleStatusChange = (row: AdminUserInfo, status: number) => {
  const statusText = status === 1 ? '启用' : '禁用'
  ElMessageBox.confirm(
    `确定要${statusText}用户"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await updateUserStatus(row.id, status)
        ElMessage.success(`已${statusText}用户: ${row.name}`)
        // 直接更新状态，避免重新加载列表
        row.status = status
      } catch (error) {
        console.error(`${statusText}用户失败`, error)
        ElMessage.error(`${statusText}用户失败`)
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 处理重置密码
const handleResetPassword = (row: AdminUserInfo) => {
  ElMessageBox.confirm(
    `确定要重置用户"${row.name}"的密码吗？重置后密码将变为默认密码。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await resetUserPassword(row.id)
        ElMessage.success(`已重置用户密码: ${row.name}`)
      } catch (error) {
        console.error('重置密码失败', error)
        ElMessage.error('重置密码失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 处理删除用户
const handleDelete = (row: AdminUserInfo) => {
  ElMessageBox.confirm(
    `确定要删除用户"${row.name}"吗？此操作将不可逆`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await deleteUser(row.id)
        ElMessage.success(`已删除用户: ${row.name}`)
        getUserListData()
      } catch (error) {
        console.error('删除用户失败', error)
        ElMessage.error('删除用户失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 处理批量启用
const handleBatchEnable = () => {
  if (!selectedUserIds.value.length) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要启用选中的 ${selectedUserIds.value.length} 个用户吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(async () => {
      try {
        // 真实环境中应该调用批量启用API
        // 这里模拟批量启用
        const updatePromises = selectedUserIds.value.map(id => updateUserStatus(id, 1))
        await Promise.all(updatePromises)
        
        // 直接更新状态，避免重新加载列表
        userList.value.forEach(user => {
          if (selectedUserIds.value.includes(user.id)) {
            user.status = 1
          }
        })
        
        ElMessage.success(`已成功启用 ${selectedUserIds.value.length} 个用户`)
      } catch (error) {
        console.error('批量启用用户失败', error)
        ElMessage.error('批量启用用户失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 处理批量禁用
const handleBatchDisable = () => {
  if (!selectedUserIds.value.length) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要禁用选中的 ${selectedUserIds.value.length} 个用户吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        // 真实环境中应该调用批量禁用API
        // 这里模拟批量禁用
        const updatePromises = selectedUserIds.value.map(id => updateUserStatus(id, 0))
        await Promise.all(updatePromises)
        
        // 直接更新状态，避免重新加载列表
        userList.value.forEach(user => {
          if (selectedUserIds.value.includes(user.id)) {
            user.status = 0
          }
        })
        
        ElMessage.success(`已成功禁用 ${selectedUserIds.value.length} 个用户`)
      } catch (error) {
        console.error('批量禁用用户失败', error)
        ElMessage.error('批量禁用用户失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 处理批量删除
const handleBatchDelete = () => {
  if (!selectedUserIds.value.length) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedUserIds.value.length} 个用户吗？此操作将不可逆`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        // 真实环境中应该调用批量删除API
        // 这里模拟批量删除
        const deletePromises = selectedUserIds.value.map(id => deleteUser(id))
        await Promise.all(deletePromises)
        
        ElMessage.success(`已成功删除 ${selectedUserIds.value.length} 个用户`)
        getUserListData()
      } catch (error) {
        console.error('批量删除用户失败', error)
        ElMessage.error('批量删除用户失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getUserListData()
}

// 处理当前页变化
const handleCurrentChange = (current: number) => {
  queryParams.pageNum = current
  getUserListData()
}

// 处理导出用户数据
const handleExport = async () => {
  try {
    ElMessage.info('正在导出数据，请稍候...')
    const loading = ElLoading.service({
      lock: true,
      text: '导出中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 使用当前筛选条件导出数据
    const res = await exportUsers(queryParams)
    loading.close()
    
    // 创建下载
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `用户数据_${new Date().getTime()}.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败', error)
    ElMessage.error('导出失败')
  }
}

// 处理导入命令
const handleImportCommand = async (command: string) => {
  if (command === 'template') {
    // 下载导入模板
    try {
      const res = await downloadImportTemplate()
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = '用户导入模板.xlsx'
      link.click()
      URL.revokeObjectURL(link.href)
      ElMessage.success('下载模板成功')
    } catch (error) {
      console.error('下载模板失败', error)
      ElMessage.error('下载模板失败')
    }
  } else if (command === 'import') {
    // 创建文件选择输入框
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.style.display = 'none'
    
    // 监听文件选择事件
    input.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const loading = ElLoading.service({
          lock: true,
          text: '导入中...',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        
        const res = await importUsers(file)
        loading.close()
        
        if (res.data && res.data.code === 200) {
          ElMessage.success(`导入成功，共导入 ${res.data.data.successCount || 0} 条数据`)
          // 刷新用户列表
          getUserListData()
        } else {
          ElMessage.error(`导入失败：${res.data.message || '未知错误'}`)
        }
      } catch (error) {
        console.error('导入失败', error)
        ElMessage.error('导入失败')
      }
      
      // 清理DOM
      document.body.removeChild(input)
    })
    
    document.body.appendChild(input)
    input.click()
  }
}
</script>

<style scoped>
.user-management {
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

.filter-container {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .left-actions, .card-header .right-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__header) {
  padding: 12px 20px;
}
</style> 