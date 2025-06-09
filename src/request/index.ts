import axios from 'axios'
import { ElMessage } from 'element-plus'

//创建axios实例
const service = axios.create({
    baseURL: 'http://localhost:39999/',
    headers: {'Content-Type': 'application/json;charset=utf-8'}
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 从localStorage获取token
        const token = localStorage.getItem('token')
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
service.interceptors.response.use(
    response => {
        const res = response.data
        // 如果返回的状态码不是200，说明接口有问题，把错误信息显示出来
        if (res.code !== 200) {
            ElMessage.error(res.msg || '系统错误')
            return Promise.reject(new Error(res.msg || '系统错误'))
        }
        return res.data  // 直接返回data字段
    },
    error => {
        console.error('响应错误：', error)
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // token过期或无效，清除token并跳转到登录页
                    localStorage.removeItem('token')
                    window.location.href = '/'
                    break
                case 403:
                    ElMessage.error('没有权限访问')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器错误')
                    break
                default:
                    ElMessage.error(error.response.data?.msg || '系统错误')
            }
        } else if (error.request) {
            // 请求已发出，但没有收到响应
            ElMessage.error('网络错误，请检查网络连接')
        } else {
            // 请求配置出错
            ElMessage.error('请求配置错误')
        }
        return Promise.reject(error)
    }
)

export default service
