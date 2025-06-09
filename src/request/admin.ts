import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// API响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建请求实例
export const adminAuthService = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 文件上传专用请求实例
export const adminFileService = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

// 请求拦截器
adminAuthService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
adminAuthService.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 上传文件响应拦截器
adminFileService.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 获取所有教师
export function getAllTeachers(): Promise<ApiResponse> {
  return adminAuthService({
    url: '/system/user/teachers',
    method: 'get'
  })
}

// 获取所有学院
export function getAllColleges(): Promise<ApiResponse> {
  return adminAuthService({
    url: '/system/college/list',
    method: 'get'
  })
} 