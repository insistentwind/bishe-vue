import service from "@/request/index";

interface Lesson {
    id: string
    lessonId: string
    lessonName: string
    hours: string
    score: string
}
interface ChooseInfo {
    lessonId: string
    studentId: string
}
interface StudentInfo {
    collegeId: string
    studentId: string
    studentPassword: string
    studentName: string
    idCardNo: string
    studentEmail: string
    gender: string
    status: string
    authorityId: string
    description: string
}
interface Student {
    id: number
    collegeId: string
    studentId: string
    studentPassword: string
    studentName: string
    idCardNo: string
    studentEmail: string
    gender: string
    status: string
    authorityId: string
    description: string
}
export function queryAll(lessonId:string){
    return service({
        url:'/choose/all/'+lessonId,
        method:'get',
    })
}

export function queryById(id:string){
    return service({
        url:'/choose/'+id,
        method:'get',
    })
}

export function queryByStudentId(data:ChooseInfo){
    return service({
        url:'/student/select',
        method:'put',
        data,
    })
}


export function addByInfo(data:ChooseInfo){
    return service({
        url:'/choose',
        method:'post',
        data,
    })
}


export function deleteById(studentId:string){
    return service({
        url:'/choose/'+studentId,
        method:'delete',
    })
}

export function getInfo(studentId:string){
    return service({
        url:'/student/getInfo/'+studentId,
        method:'get',
    })
}

export function getPaperClassId(examId:string){
    return service({
        url:'/exam/getModelClass/'+examId,
        method:'get',
    })
}

export function getAll(){
    return service({
        url:'/student/getAll',
        method:'get',
    })
}

export function add(data: StudentInfo){
    return service({
        url:'/student/insert',
        method:'post',
        data,
    })
}
export function deleteByIdStudent(id:string){
    return service({
        url:'/student/deleteStudentId/'+id,
        method:'delete',
    })
}
export function updateStudent(data:Student){
    return service({
        url:'/student',
        method:'put',
        data,
    })
}
export function selectLike(studentId:string){
    return service({
        url:'/student/getLike/'+studentId,
        method:'get',
    })
}

// 获取选修特定课程的学生列表
export function queryStudentsByLessonId(lessonId: string) {
  return service({
    url: `/student/lesson/${lessonId}`,
    method: 'get'
  });
}

// 获取所有学生
export function queryAllStudents() {
  return service({
    url: '/student/all',
    method: 'get'
  });
}

// 根据ID查询学生
export function queryStudentById(studentId: string) {
  return service({
    url: `/student/${studentId}`,
    method: 'get'
  });
}

// 添加学生
export function addStudent(data: any) {
  return service({
    url: '/student/add',
    method: 'post',
    data
  });
}

// 删除学生
export function deleteStudent(id: number | string) {
  return service({
    url: `/student/delete/${id}`,
    method: 'delete'
  });
}

// 学生选课
export function enrollCourse(studentId: string, lessonId: string) {
  return service({
    url: '/student/enroll',
    method: 'post',
    data: {
      studentId,
      lessonId
    }
  });
}

// 学生退课
export function dropCourse(studentId: string, lessonId: string) {
  return service({
    url: '/student/drop',
    method: 'post',
    data: {
      studentId,
      lessonId
    }
  });
}
