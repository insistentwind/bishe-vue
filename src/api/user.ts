import { adminAuthService } from '@/request/admin'

// 用户角色枚举
export enum UserRole {
  ADMIN = 2,       // 系统管理员
  TEACHER = 4,     // 老师
  STUDENT = 5      // 学生
}

// 用户状态枚举
export enum UserStatus {
  DISABLED = 0,    // 禁用
  ENABLED = 1      // 启用
}

// 用户基础数据接口
export interface AdminUserInfo {
  id: number;
  collegeId?: number;
  name: string;
  username: string;
  phone?: string;
  sex?: number;
  avatar?: string;
  password?: string;
  roleId?: number;
  description?: string;
  IdCard?: string;
  email?: string;
  identity?: string;
  createTime?: string;
  updateTime?: string;
  jwt?: string;
  roleName?: string;
  code?: string;
  sort?: number;
  dataScope?: number;
  status?: number;
  delFlag?: number;
  oldPassword?: string;
  
  // 后端可能返回的额外字段
  collegeName?: string;
  title?: string;
  education?: string;
  majorId?: string | number;
  majorName?: string;
  classId?: string | number;
  className?: string;
  grade?: string;
  enrollment?: string;
}

// 分页查询参数
export interface AdminPageDto {
  pageNum: number;
  pageSize: number;
  id?: number;
  collegeId?: number;
  name?: string;
  username?: string;
  phone?: string;
  sex?: number;
  roleId?: number;
  identity?: string;
  status?: number;
  [key: string]: any;
}

// 分页结果
export interface PageResult<T> {
  total: number;
  records: T[];
}

// 用户查询返回结果
export type UserQueryResult = PageResult<AdminUserInfo>;

// 获取用户列表
export function getUserList(params: AdminPageDto) {
  console.log('调用getUserList API，参数:', params)
  return adminAuthService({
    url: '/system/user/list',
    method: 'post',
    data: params
  })
}

// 获取用户详情
export function getUserDetail(id: number) {
  return adminAuthService({
    url: `/system/user/info/${id}`,
    method: 'get'
  })
}

// 获取用户详情
export function getUserInfo(id: number) {
  return adminAuthService({
    url: `/system/user/${id}`,
    method: 'get'
  })
}

// 创建用户
export function createUser(data: AdminUserInfo) {
  return adminAuthService({
    url: '/system/user/save',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(data: AdminUserInfo) {
  console.log('调用updateUser API，参数:', JSON.stringify(data, null, 2))
  return adminAuthService({
    url: '/system/user/update',
    method: 'put',
    data
  }).then(response => {
    console.log('updateUser API响应:', response)
    return response
  }).catch(error => {
    console.error('updateUser API错误:', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
      console.error('错误状态码:', error.response.status)
    }
    throw error
  })
}

// 删除用户
export function deleteUser(id: number) {
  return adminAuthService({
    url: `/system/user/delete/${id}`,
    method: 'delete'
  })
}

// 更新用户状态
export function updateUserStatus(id: number, status: number) {
  console.log(`调用updateUserStatus API，用户ID: ${id}, 状态: ${status}`)
  console.log(`请求URL: /system/user/update`)
  console.log(`请求方法: PUT`)
  console.log(`请求数据: ${JSON.stringify({ id, status }, null, 2)}`)
  
  return adminAuthService({
    url: '/system/user/update',
    method: 'put',
    data: { id, status }
  }).then(response => {
    console.log('updateUserStatus API响应:', response)
    if (response && response.data) {
      console.log('响应数据:', JSON.stringify(response.data, null, 2))
    }
    return response
  }).catch(error => {
    console.error('updateUserStatus API错误:', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
      console.error('错误状态码:', error.response.status)
      console.error('错误消息:', error.message)
    }
    throw error
  })
}

// 重置用户密码
export function resetUserPassword(id: number) {
  return adminAuthService({
    url: `/system/user/reset-password/${id}`,
    method: 'put'
  })
}

// 获取角色列表
export function getRoleList() {
  return adminAuthService({
    url: '/system/role/list',
    method: 'get'
  })
}

// 获取用户角色名称
export function getRoleName(roleId?: number): string {
  if (!roleId) return '未知角色';
  
  // 根据后端实际返回的角色ID调整映射关系
  switch (roleId) {
    case 2:
      return '系统管理员';
    case 4:
      return '老师';
    case 5:
      return '学生';
    default:
      return '未知角色';
  }
}

// 角色选项列表
export const roleOptions = [
  { value: 2, label: '系统管理员' },
  { value: 4, label: '老师' },
  { value: 5, label: '学生' }
]

// 导出用户数据
export function exportUsers(params: AdminPageDto) {
  return adminAuthService({
    url: '/system/user/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

// 下载用户导入模板
export function downloadImportTemplate() {
  return adminAuthService({
    url: '/system/user/import-template',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入用户数据
export function importUsers(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return adminAuthService({
    url: '/system/user/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 测试获取用户列表（用于调试）
export function testGetUserList() {
  const params = {
    pageNum: 1,
    pageSize: 10
  }
  return adminAuthService({
    url: '/system/user/list',
    method: 'post',
    data: params
  }).then(res => {
    console.log('测试API调用结果:', res)
    return res
  }).catch(error => {
    console.error('测试API调用失败:', error)
    throw error
  })
} 