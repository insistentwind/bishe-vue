import axios from 'axios';

// 定义API响应结构
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 定义管理员用户信息接口
export interface AdminUserVo {
  code?: string;
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
  IdCard?: string; // 注意这里是大写D，与后端一致
  email?: string;
  identity?: string;
  createTime?: Date | string;
  updateTime?: Date | string;
  jwt?: string;
  oldPassword?: string;
  status?: number;
  delFlag?: number;
}

// 创建不带token的axios实例用于登录
const adminService = axios.create({
    baseURL: '/api',
    headers: {'Content-Type': 'application/json;charset=utf-8'}
});

// 创建带token的axios实例用于其他请求
const adminAuthService = axios.create({
    baseURL: '/api',
    headers: {'Content-Type': 'application/json;charset=utf-8'}
});

// 创建用于文件上传的axios实例
const adminFileService = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

// 请求拦截器
adminAuthService.interceptors.request.use(
    config => {
        // 从localStorage获取token
        const token = localStorage.getItem('admin_token')
        if (token) {
            // 将token添加到请求头
            config.headers['token'] = token
        }
        return config
    },
    error => {
        console.error('请求错误：', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
adminAuthService.interceptors.response.use(
    response => {
        // 直接返回整个响应，让调用者自己处理状态码
        return response
    },
    error => {
        console.error('响应错误：', error)
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // token过期或无效，清除token并跳转到登录页
                    localStorage.removeItem('admin_token')
                    window.location.href = '/admin/login'
                    break
                case 403:
                    console.error('没有权限访问')
                    break
                case 404:
                    console.error('请求的资源不存在')
                    break
                case 500:
                    console.error('服务器错误')
                    break
                default:
                    console.error(error.response.data?.msg || '系统错误')
            }
        } else if (error.request) {
            // 请求已发出，但没有收到响应
            console.error('网络错误，请检查网络连接')
        } else {
            // 请求配置出错
            console.error('请求配置错误')
        }
        return Promise.reject(error)
    }
)

// 设置adminService的响应拦截器，确保返回数据结构一致
adminService.interceptors.response.use(
    response => {
        return response.data  // 直接返回服务器响应的数据
    },
    error => {
        console.error('登录失败:', error)
        return Promise.reject(error)
    }
)

// 文件上传实例的请求拦截器
adminFileService.interceptors.request.use(
    config => {
        // 从localStorage获取token
        const token = localStorage.getItem('admin_token')
        if (token) {
            // 将token添加到请求头
            config.headers['token'] = token
        }
        return config
    },
    error => {
        console.error('请求错误：', error)
        return Promise.reject(error)
    }
)

// 文件上传实例的响应拦截器
adminFileService.interceptors.response.use(
    response => {
        return response.data  // 直接返回服务器响应的数据
    },
    error => {
        console.error('上传失败:', error)
        return Promise.reject(error)
    }
)

// 管理员登录接口
export function adminLogin(data: {username: string, password: string}): Promise<ApiResponse> {
    return adminService({
        url: '/admin/login',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

// 获取管理员信息
export function getAdminInfo(): Promise<ApiResponse> {
    return adminAuthService({
        url: '/admin/info',
        method: 'get'
    })
}

// 获取系统概览数据
export function getSystemOverview(): Promise<ApiResponse> {
    return adminAuthService({
        url: '/admin/overview',
        method: 'get'
    })
}

// 获取所有学院列表
export function getAllColleges(): Promise<ApiResponse> {
    return adminAuthService({
        url: '/admin/colleges',
        method: 'get'
    })
}

// 获取所有班级列表
export function getAllClasses(): Promise<ApiResponse> {
    return adminAuthService({
        url: '/admin/classes',
        method: 'get'
    })
}

// 获取所有教师列表
export function getAllTeachers(): Promise<ApiResponse> {
    return adminAuthService({
        url: '/admin/teachers',
        method: 'get'
    })
}

// 获取所有学生列表
export function getAllStudents(): Promise<ApiResponse> {
    return adminAuthService({
        url: '/admin/students',
        method: 'get'
    })
}

// 更新管理员信息
export function updateAdminInfo(data: AdminUserVo): Promise<ApiResponse> {
    return adminAuthService({
        url: '/admin/update',
        method: 'post',
        data
    })
}

// 上传管理员头像
export function uploadAdminAvatar(formData: FormData): Promise<ApiResponse> {
    return adminFileService({
        url: '/admin/upload',
        method: 'post',
        data: formData
    })
}

export { adminService, adminAuthService, adminFileService } 