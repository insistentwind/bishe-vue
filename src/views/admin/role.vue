<template>
  <div class="role-management">
    <div class="page-header">
      <h2>角色管理</h2>
      <p>管理系统中的所有角色及其权限</p>
    </div>

    <!-- 搜索和过滤区域 -->
    <el-card class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入角色名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="queryParams.code"
            placeholder="请输入角色编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option :value="1" label="正常" />
            <el-option :value="0" label="停用" />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增角色
          </el-button>
        </div>
      </template>

      <!-- 角色数据表格 -->
      <el-table
        v-loading="loading"
        :data="roleList"
        border
        style="width: 100%"
        :max-height="500"
        highlight-current-row
        table-layout="fixed"
        :cell-style="{ 'text-align': 'center' }"
        :header-cell-style="{ 'text-align': 'center', background: '#f8f8f9' }"
      >
        <el-table-column type="index" width="50" align="center" />
        <el-table-column label="角色名称" prop="name" min-width="120" show-overflow-tooltip />
        <el-table-column label="角色编码" prop="code" min-width="120" show-overflow-tooltip />
        <el-table-column label="排序" prop="sort" width="80" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据权限" width="120" align="center">
          <template #default="{ row }">
            {{ row.dataScope !== undefined && dataScopeLabels[row.dataScope] ? dataScopeLabels[row.dataScope] : '未知' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="170" show-overflow-tooltip />
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
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
              @click="handlePermission(row)"
            >
              分配权限
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

    <!-- 添加或编辑角色的对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="roleForm.sort" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="数据权限" prop="dataScope">
          <el-select v-model="roleForm.dataScope" placeholder="请选择数据权限">
            <el-option :value="0" label="所有数据" />
            <el-option :value="1" label="部门及子部门数据" />
            <el-option :value="2" label="本部门数据" />
            <el-option :value="3" label="本人数据" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="roleForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      v-model="permissionDialogVisible"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item label="角色名称">
          <span>{{ currentRole.name }}</span>
        </el-form-item>
        <el-form-item label="权限菜单">
          <el-tree
            ref="menuTree"
            :data="menuTreeData"
            show-checkbox
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            :default-checked-keys="selectedMenuIds"
            :check-strictly="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitPermission">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search, Refresh } from '@element-plus/icons-vue'
import {
  getRoleList,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  getRoleMenus,
  assignRoleMenus,
  type RoleInfo,
  type RolePageDto
} from '@/api/role'

// 定义API错误类型
interface ApiError {
  message?: string;
  response?: {
    data?: any;
    status?: number;
  };
}

// 数据权限标签
const dataScopeLabels: Record<number, string> = {
  0: '所有数据',
  1: '部门及子部门数据',
  2: '本部门数据',
  3: '本人数据'
}

// 搜索参数
const queryParams = reactive<RolePageDto>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  code: '',
  status: undefined
})

// 表格数据
const loading = ref(false)
const roleList = ref<RoleInfo[]>([])
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑角色' : '新增角色')
const isEdit = ref(false)
const roleForm = reactive<RoleInfo>({
  name: '',
  code: '',
  sort: 0,
  status: 1,
  dataScope: 0,
  remark: ''
})
const roleFormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}
const roleFormRef = ref()

// 权限相关
const permissionDialogVisible = ref(false)
const currentRole = ref<RoleInfo>({} as RoleInfo)
const menuTreeData = ref([])
const selectedMenuIds = ref<number[]>([])
const menuTree = ref()

// 初始化函数
onMounted(() => {
  getRoleListData()
})

// 获取角色列表数据
const getRoleListData = async () => {
  loading.value = true
  try {
    console.log('发送请求参数:', queryParams)
    const response = await getRoleList(queryParams)
    console.log('原始响应:', response)
    
    // 处理响应数据
    if (response) {
      console.log('响应体:', response)
      
      if (response.code === 200 && response.data) {
        // 成功获取数据
        const pageResult = response.data
        console.log('分页数据:', pageResult)
        
        if (pageResult.records && Array.isArray(pageResult.records)) {
          roleList.value = pageResult.records
          total.value = pageResult.total || 0
          console.log('角色列表数据:', roleList.value)
          console.log('总记录数:', total.value)
        } else {
          console.error('分页数据格式异常:', pageResult)
          ElMessage.error('获取角色列表失败: 数据格式异常')
        }
      } else {
        console.error('接口返回错误:', response.msg || '未知错误')
        ElMessage.error(response.msg || '获取角色列表失败')
      }
    } else {
      console.error('响应异常:', response)
      ElMessage.error('获取角色列表失败: 响应异常')
    }
  } catch (error: any) {
    console.error('请求异常:', error)
    if (error.response) {
      console.error('错误响应:', error.response)
    }
    ElMessage.error('获取角色列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理查询按钮点击
const handleQuery = () => {
  queryParams.pageNum = 1
  getRoleListData()
}

// 重置查询表单
const resetQuery = () => {
  queryParams.name = ''
  queryParams.code = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  getRoleListData()
}

// 处理分页大小变化
const handleSizeChange = (newSize: number) => {
  queryParams.pageSize = newSize
  getRoleListData()
}

// 处理页码变化
const handleCurrentChange = (newPage: number) => {
  queryParams.pageNum = newPage
  getRoleListData()
}

// 处理新增角色
const handleAdd = () => {
  isEdit.value = false
  resetRoleForm()
  dialogVisible.value = true
}

// 重置角色表单
const resetRoleForm = () => {
  roleForm.id = undefined
  roleForm.name = ''
  roleForm.code = ''
  roleForm.sort = 0
  roleForm.status = 1
  roleForm.dataScope = 0
  roleForm.remark = ''
}

// 处理编辑角色
const handleUpdate = async (row: RoleInfo) => {
  isEdit.value = true
  resetRoleForm()
  
  try {
    // 获取角色详情
    const response = await getRoleDetail(row.id as number)
    
    if (response && response.code === 200 && response.data) {
      // 获取返回的角色数据
      const roleData = response.data
      console.log('获取到的角色详情数据:', roleData)
      
      // 填充表单
      roleForm.id = roleData.id
      roleForm.name = roleData.name
      roleForm.code = roleData.code
      roleForm.sort = roleData.sort
      roleForm.status = roleData.status
      roleForm.dataScope = roleData.dataScope
      // 如果后端返回了备注字段，也设置上
      if ('remark' in roleData) {
        roleForm.remark = roleData.remark
      }
      
      dialogVisible.value = true
    } else {
      const errorMsg = response?.msg || '获取角色详情失败'
      console.error('获取角色详情接口返回错误:', errorMsg)
      ElMessage.error(errorMsg)
    }
  } catch (error: any) {
    console.error('获取角色详情失败:', error)
    ElMessage.error('获取角色详情失败: ' + (error.message || '未知错误'))
  }
}

// 处理角色状态变更
const handleStatusChange = (row: RoleInfo, status: number) => {
  const statusText = status === 1 ? '启用' : '禁用'
  ElMessageBox.confirm(
    `确定要${statusText}角色"${row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const response = await updateRoleStatus(row.id as number, status)
        if (response && response.code === 200) {
          ElMessage.success(`已${statusText}角色: ${row.name}`)
          // 直接更新状态，避免重新加载列表
          row.status = status
        } else {
          const errorMsg = response?.msg || `${statusText}角色失败`
          console.error(`${statusText}角色失败:`, errorMsg)
          ElMessage.error(errorMsg)
        }
      } catch (error: any) {
        console.error(`${statusText}角色失败`, error)
        ElMessage.error(`${statusText}角色失败: ` + (error.message || '未知错误'))
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 处理删除角色
const handleDelete = (row: RoleInfo) => {
  ElMessageBox.confirm(
    `确定要删除角色"${row.name}"吗？此操作将不可逆`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const response = await deleteRole(row.id as number)
        if (response && response.code === 200) {
          ElMessage.success(`已删除角色: ${row.name}`)
          getRoleListData()
        } else {
          const errorMsg = response?.msg || '删除角色失败'
          console.error('删除角色失败:', errorMsg)
          ElMessage.error(errorMsg)
        }
      } catch (error: any) {
        console.error('删除角色失败', error)
        ElMessage.error('删除角色失败: ' + (error.message || '未知错误'))
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 处理分配权限
const handlePermission = async (row: RoleInfo) => {
  currentRole.value = { ...row }
  permissionDialogVisible.value = true
  
  try {
    // 获取角色菜单权限
    const response = await getRoleMenus(row.id as number)
    
    if (response && response.code === 200 && response.data) {
      const menuData = response.data
      
      // 这里假设后端返回的是一个对象，包含菜单树和已选中的菜单ID
      menuTreeData.value = menuData.menus || []
      selectedMenuIds.value = menuData.checkedKeys || []
    } else {
      ElMessage.error('获取角色权限数据失败')
    }
  } catch (error: any) {
    console.error('获取角色权限数据失败:', error)
    ElMessage.error('获取角色权限数据失败: ' + (error.message || '未知错误'))
  }
}

// 提交角色表单
const submitForm = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate()
    
    // 准备提交的数据
    const submitData = {
      id: roleForm.id,
      name: roleForm.name,
      code: roleForm.code,
      sort: roleForm.sort,
      status: roleForm.status,
      dataScope: roleForm.dataScope,
      remark: roleForm.remark
    }
    
    console.log('准备提交的角色数据:', submitData)
    
    if (isEdit.value) {
      // 更新角色
      const response = await updateRole(submitData)
      if (response && response.code === 200) {
        ElMessage.success('更新角色成功')
        dialogVisible.value = false
        getRoleListData()
      } else {
        const errorMsg = response?.msg || '更新角色失败'
        console.error('更新角色接口返回错误:', errorMsg)
        ElMessage.error(errorMsg)
      }
    } else {
      // 创建角色
      const response = await createRole(submitData)
      if (response && response.code === 200) {
        ElMessage.success('创建角色成功')
        dialogVisible.value = false
        getRoleListData()
      } else {
        const errorMsg = response?.msg || '创建角色失败'
        console.error('创建角色接口返回错误:', errorMsg)
        ElMessage.error(errorMsg)
      }
    }
  } catch (error: any) {
    console.error('提交角色表单失败:', error)
    ElMessage.error('提交表单失败: ' + (error.message || '未知错误'))
  }
}

// 提交权限分配
const submitPermission = async () => {
  try {
    if (!menuTree.value) return
    
    // 获取选中的菜单ID
    const checkedKeys = menuTree.value.getCheckedKeys()
    const halfCheckedKeys = menuTree.value.getHalfCheckedKeys()
    const menuIds = [...checkedKeys, ...halfCheckedKeys]
    
    // 分配角色权限
    const response = await assignRoleMenus(currentRole.value.id as number, menuIds)
    if (response && response.code === 200) {
      ElMessage.success(`已成功分配"${currentRole.value.name}"角色的权限`)
      permissionDialogVisible.value = false
    } else {
      const errorMsg = response?.msg || '分配权限失败'
      console.error('分配权限失败:', errorMsg)
      ElMessage.error(errorMsg)
    }
  } catch (error: any) {
    console.error('分配权限失败:', error)
    ElMessage.error('分配权限失败: ' + (error.message || '未知错误'))
  }
}
</script>

<style scoped>
.role-management {
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

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style> 