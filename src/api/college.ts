import { adminAuthService } from '@/request/admin'
import type { ApiResponse } from '@/request/admin'

// 学院基本信息接口
export interface College {
  id: number;
  collegeName: string;
  introduction?: string;
  deanId?: number;
  status: number;
  createTime?: string;
  updateTime?: string;
  
  // 关联院长信息（可选）
  name?: string;        // 院长姓名
  username?: string;    // 院长账号
  sex?: number;         // 院长性别
  phone?: string;       // 院长电话
  email?: string;       // 院长邮箱
  avatar?: string;      // 院长头像
  password?: string;    // 院长密码（一般不返回）
  description?: string; // 院长简介
}

// 分页查询参数
export interface CollegePageQuery {
  pageNum: number;
  pageSize: number;
  collegeName?: string;
  status?: number;
}

// 分页结果
export interface PageResult<T> {
  total: number;
  records: T[];
}

// 获取所有学院列表
export function getAllColleges(): Promise<ApiResponse<College[]>> {
  return adminAuthService({
    url: '/system/college/all',
    method: 'get'
  })
}

// 分页查询学院列表
export function getCollegesByPage(params: CollegePageQuery): Promise<ApiResponse<PageResult<College>>> {
  return adminAuthService({
    url: '/system/college/list',
    method: 'post',
    data: params
  })
}

// 添加学院
export function addCollege(data: Partial<College>): Promise<ApiResponse<any>> {
  return adminAuthService({
    url: '/system/college/save',
    method: 'post',
    data
  })
}

// 更新学院
export function updateCollege(data: College): Promise<ApiResponse<any>> {
  return adminAuthService({
    url: '/system/college/update',
    method: 'put',
    data
  })
}

// 删除学院
export function deleteCollege(id: number): Promise<ApiResponse<any>> {
  return adminAuthService({
    url: `/system/college/delete/${id}`,
    method: 'delete'
  })
}

// 获取学院详情
export function getCollegeDetail(id: number): Promise<ApiResponse<College>> {
  return adminAuthService({
    url: `/system/college/${id}`,
    method: 'get'
  })
} 