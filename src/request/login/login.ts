import axios from 'axios';
import service from "@/request/index";

// 创建不带token的axios实例用于登录
const loginService = axios.create({
    baseURL: 'http://localhost:39999/',
    headers: {'Content-Type': 'application/json;charset=utf-8'}
});

interface loginData {
    identity: string,
    username: string,
    password: string
}
interface User {
    name: string,
    username: string,
    oldPassword: string,
    newPassword: string,
    description: string,
    authorityRole: string,
    identity: string,
}
interface TeacherInfo {
    collegeId: string
    teacherId: string
    teacherName: string
    teacherPassword: string
    idCardNo: string
    teacherEmail: string
    code: string
    authorityId: string
    status: string
    description: string
}

interface StudentInfo {
    collegeId: string
    studentId: string
    studentPassword: string
    studentName: string
    idCardNo: string
    studentEmail: string
    code: string
    gender: string
    status: string
    authorityId: string
    description: string
}
export function login(data:loginData){
    return loginService({
        url:'/login/login',
        method:'post',
        data
    })
}

export function updatePassword(data:User){
    return service({
        url:'/login/update',
        method:'post',
        data
    })
}

export function registerStudent(data: StudentInfo){
    return service({
        url:'/user/register',
        method:'post',
        data
    })
}


export function registerTeacher(data: TeacherInfo){
    return service({
        url:'/user/register',
        method:'post',
        data
    })
}

export function verificationCode(email: string){
    return service({
        url:'/login/verificationCode/'+email,
        method:'get',
    })
}

// 更新用户信息
export function updateUserInfo(data: {
  name: string;
  description: string;
  avatar: string;
  username: string;
  collegeId?: string;
  collegeName?: string;
  phone?: string;
  email?: string;
}) {
  return service({
    url: '/login/update',
    method: 'post',
    data
  })
}

// 上传头像
export function uploadAvatar(data: FormData) {
  return service({
    url: '/upload/avatar',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

