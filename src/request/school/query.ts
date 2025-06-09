import service from '@/request/index'

interface College {
    id: number,
    collegeId: string,
    collegeName: string,
}

interface Collegeinfo {
    collegeId: string,
    collegeName: string,
}

// 查询所有学院
export function query() {
    return service({
        url: '/college/all',
        method: 'get',
        timeout: 5000 // 设置超时时间
    })
}

export function queryTeachersByCollegeID(collegeId:string){
    return service({
        url:'/teacher/byCollegeId/'+collegeId,
        method:'get',
        timeout: 5000
    })
}

export function queryStudentsByCollegeID(collegeId:string){
    return service({
        url:'/student/byCollegeId/'+collegeId,
        method:'get',
        timeout: 5000
    })
}

export function queryLessonsByCollegeID(collegeId:string){
    return service({
        url:'/lesson/byCollegeId/'+collegeId,
        method:'get',
        timeout: 5000
    })
}

// 根据ID修改学院信息
export function queryById(data: College) {
    return service({
        url: '/college',
        method: 'put',
        data,
        timeout: 5000
    })
}

// 删除学院
export function deleteByid(id: number) {
    return service({
        url: `/college/${id}`,
        method: 'delete',
        timeout: 5000
    })
}

// 新增学院
export function addByInfo(data: Collegeinfo) {
    return service({
        url: '/college',
        method: 'post',
        data,
        timeout: 5000
    })
}

// 获取所有学院信息
export function getAllColleges() {
  return service({
    url: '/college/all',
    method: 'get',
    timeout: 5000
  })
}
