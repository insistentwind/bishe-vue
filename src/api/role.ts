import { adminAuthService } from '@/request/admin'

// 角色基础数据接口
export interface RoleInfo {
  id?: number;
  name: string;         // 角色名称
  code: string;         // 角色编码
  sort: number;         // 显示顺序
  dataScope?: number;   // 数据权限
  menuIds?: number[];
  deptIds?: number[];
  status: number;       // 角色状态(1-正常；0-停用)
  createTime?: string;  // 创建时间
  updateTime?: string;  // 更新时间
  delFlag?: number;     // 逻辑删除标识
  remark?: string;
  [key: string]: any;
}

// 分页查询参数
export interface RolePageDto {
  pageNum: number;      // 分页大小
  pageSize: number;     // 每页显示记录数
  id?: number;
  name?: string;        // 角色名称
  code?: string;        // 角色编码
  sort?: number;        // 显示顺序
  status?: number;      // 角色状态
  dataScope?: number;   // 数据权限
  [key: string]: any;
}

// 分页结果
export interface PageResult<T> {
  total: number;
  records: T[];
}

// 获取角色列表
export function getRoleList(params: RolePageDto) {
  console.log('调用getRoleList API，参数:', params)
  return adminAuthService({
    url: '/system/role/list',
    method: 'post',
    data: params
  })
}

// 获取角色详情
export function getRoleDetail(id: number) {
  console.log(`调用getRoleDetail API，角色ID: ${id}`)
  console.log(`请求URL: /system/role/${id}`)
  console.log(`请求方法: GET`)
  
  return adminAuthService({
    url: `/system/role/${id}`,
    method: 'get'
  }).then(response => {
    console.log('getRoleDetail API响应:', response)
    if (response && response.data) {
      console.log('响应数据:', JSON.stringify(response.data, null, 2))
    }
    return response
  }).catch(error => {
    console.error('getRoleDetail API错误:', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
      console.error('错误状态码:', error.response.status)
      console.error('错误消息:', error.message)
    }
    throw error
  })
}

// 创建角色
export function createRole(data: RoleInfo) {
  console.log('调用createRole API，参数:', JSON.stringify(data, null, 2))
  return adminAuthService({
    url: '/system/role/save',
    method: 'post',
    data
  }).then(response => {
    console.log('createRole API响应:', response)
    return response
  }).catch(error => {
    console.error('createRole API错误:', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
      console.error('错误状态码:', error.response.status)
    }
    throw error
  })
}

// 更新角色
export function updateRole(data: RoleInfo) {
  console.log('调用updateRole API，参数:', JSON.stringify(data, null, 2))
  return adminAuthService({
    url: '/system/role/update',
    method: 'put',
    data
  }).then(response => {
    console.log('updateRole API响应:', response)
    return response
  }).catch(error => {
    console.error('updateRole API错误:', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
      console.error('错误状态码:', error.response.status)
    }
    throw error
  })
}

// 删除角色
export function deleteRole(id: number) {
  return adminAuthService({
    url: `/system/role/delete/${id}`,
    method: 'delete'
  })
}

// 更新角色状态
export function updateRoleStatus(id: number, status: number) {
  console.log(`调用updateRoleStatus API，角色ID: ${id}, 状态: ${status}`)
  console.log(`请求URL: /system/role/update`)
  console.log(`请求方法: PUT`)
  console.log(`请求数据: ${JSON.stringify({ id, status }, null, 2)}`)
  
  return adminAuthService({
    url: '/system/role/update',
    method: 'put',
    data: { id, status }
  }).then(response => {
    console.log('updateRoleStatus API响应:', response)
    if (response && response.data) {
      console.log('响应数据:', JSON.stringify(response.data, null, 2))
    }
    return response
  }).catch(error => {
    console.error('updateRoleStatus API错误:', error)
    if (error.response) {
      console.error('错误响应数据:', error.response.data)
      console.error('错误状态码:', error.response.status)
      console.error('错误消息:', error.message)
    }
    throw error
  })
}

// 获取所有角色（不分页）
export function getAllRoles() {
  return adminAuthService({
    url: '/system/role/all',
    method: 'get'
  })
}

// 获取角色权限菜单
export function getRoleMenus(roleId: number) {
  return adminAuthService({
    url: `/system/role/menu/${roleId}`,
    method: 'get'
  })
}

// 分配角色权限
export function assignRoleMenus(roleId: number, menuIds: number[]) {
  return adminAuthService({
    url: '/system/role/menu',
    method: 'put',
    data: {
      roleId,
      menuIds
    }
  })
}

// 获取可选角色列表（用于下拉框）
export function getRoleOptions() {
  return adminAuthService({
    url: '/system/role/options',
    method: 'get'
  })
} 