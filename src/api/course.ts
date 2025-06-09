// 课程管理相关的API定义
import { adminAuthService, adminFileService } from '@/request/admin'
import type { ApiResponse } from '@/request/admin'

// 课程类型定义
export interface Course {
  id: number
  lessonName: string
  hours: string
  score: string
  classTime: string
  introduction: string
  teacherName?: string
  teacherId?: number
  capacity: number
  status: number
  createTime?: string
  updateTime?: string
  collegeId?: number
  // 教师相关信息
  name?: string
  username?: string
  phone?: string
  sex?: number
  avatar?: string
  password?: string
  roleId?: number
  description?: string
  IdCard?: string
  email?: string
  identity?: string
}

// 学院信息接口
export interface College {
  id: number
  collegeName: string
  introduction?: string
  deanId?: number
  status: number
  createTime?: string
  updateTime?: string
}

// 课程查询参数
export interface CourseQuery {
  pageNum: number
  pageSize: number
  id?: number
  lessonName?: string
  hours?: string
  score?: string
  status?: number
  capacity?: number
  classTime?: string
  introduction?: string
  createTime?: string
  updateTime?: string
}

// 课程列表查询响应
export interface CourseListResponse {
  total: number
  records: Course[]
}

// 获取所有学院列表
export function getAllColleges(): Promise<ApiResponse<College[]>> {
  return adminAuthService({
    url: '/system/college/all',
    method: 'get'
  })
}

// 根据学院ID获取教师列表
export function getTeachersByCollegeId(collegeId: number): Promise<ApiResponse<any[]>> {
  return adminAuthService({
    url: `/system/college/${collegeId}`,
    method: 'get'
  })
}

// 获取课程列表
export function getCourseList(params: CourseQuery): Promise<ApiResponse<CourseListResponse>> {
  return adminAuthService({
    url: '/system/lesson/list',
    method: 'post',
    data: params
  })
}

// 获取课程详情
export function getCourseDetail(id: number): Promise<ApiResponse<Course>> {
  return adminAuthService({
    url: `/system/lesson/detail/${id}`,
    method: 'get'
  })
}

// 获取课程编辑信息
export function getCourseEditInfo(id: number): Promise<ApiResponse<Course>> {
  return adminAuthService({
    url: `/system/lesson/${id}`,
    method: 'get'
  })
}

// 创建课程
export function createCourse(data: Course): Promise<ApiResponse> {
  return adminAuthService({
    url: '/system/lesson/create',
    method: 'post',
    data
  })
}

// 更新课程
export function updateCourse(data: Course): Promise<ApiResponse> {
  return adminAuthService({
    url: '/system/lesson/update',
    method: 'put',
    data
  })
}

// 删除课程
export function deleteCourse(id: number): Promise<ApiResponse> {
  return adminAuthService({
    url: `/system/lesson/delete/${id}`,
    method: 'delete'
  })
}

// 批量删除课程
export function batchDeleteCourse(ids: number[]): Promise<ApiResponse> {
  return adminAuthService({
    url: '/system/lesson/batch/delete',
    method: 'delete',
    data: { ids }
  })
}

// 启用课程（开课）
export function enableCourse(id: number): Promise<ApiResponse> {
  return adminAuthService({
    url: `/system/lesson/enable/${id}`,
    method: 'put'
  })
}

// 禁用课程（结课）
export function disableCourse(id: number): Promise<ApiResponse> {
  return adminAuthService({
    url: `/system/lesson/disable/${id}`,
    method: 'put'
  })
}

// 批量启用课程
export function batchEnableCourse(ids: number[]): Promise<ApiResponse> {
  return adminAuthService({
    url: '/system/lesson/batch/enable',
    method: 'put',
    data: { ids }
  })
}

// 批量禁用课程
export function batchDisableCourse(ids: number[]): Promise<ApiResponse> {
  return adminAuthService({
    url: '/system/lesson/batch/disable',
    method: 'put',
    data: { ids }
  })
}

// 上传课程封面
export function uploadCourseCover(formData: FormData): Promise<ApiResponse> {
  return adminFileService({
    url: '/system/lesson/upload/cover',
    method: 'post',
    data: formData
  })
}

// 获取课程类型选项
export function getCourseTypeOptions(): Promise<ApiResponse> {
  return adminAuthService({
    url: '/system/lesson/type/options',
    method: 'get'
  })
} 