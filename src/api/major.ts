import { adminAuthService } from '@/request/admin'

// 专业数据接口
export interface Major {
  id: number;
  majorName: string;
  collegeId: number;
  collegeName?: string;
  introduction?: string;
  deanId?: number;
  deanName?: string;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

// 分页请求参数
export interface MajorPageQuery {
  pageNum: number;
  pageSize: number;
  id?: number;
  majorName?: string;
  collegeId?: number;
  status?: number;
}

// 分页响应结果
export interface PageResult<T> {
  total: number;
  records: T[];
}

// 获取所有专业列表
export function getAllMajors() {
  return adminAuthService({
    url: '/admin/major/all',
    method: 'get'
  })
}

// 分页查询专业列表
export function getMajorsByPage(data: MajorPageQuery) {
  console.log('发送专业分页查询请求，参数:', data);
  return adminAuthService({
    url: '/admin/major/page',
    method: 'post',
    data
  })
}

// 添加专业
export function addMajor(data: Partial<Major>) {
  return adminAuthService({
    url: '/admin/major/add',
    method: 'post',
    data
  })
}

// 更新专业信息
export function updateMajor(data: Major) {
  return adminAuthService({
    url: '/admin/major/update',
    method: 'put',
    data
  })
}

// 删除专业
export function deleteMajor(id: number | string) {
  return adminAuthService({
    url: `/admin/major/delete/${id}`,
    method: 'delete'
  })
}

// 根据学院ID获取专业列表
export function getMajorsByCollegeId(collegeId: number) {
  return adminAuthService({
    url: `/admin/major/college/${collegeId}`,
    method: 'get'
  })
}

// 模拟数据 - 用于展示
export const mockMajorData = {
  total: 8,
  records: [
    {
      id: 1,
      majorName: '计算机科学与技术',
      collegeId: 1,
      collegeName: '信息工程学院',
      introduction: '培养具有良好的科学素养，掌握计算机科学与技术的基本理论、基本知识和基本技能的专业人才',
      deanId: 101,
      deanName: '张教授',
      status: 1,
      createTime: '2023-01-15 10:30:00',
      updateTime: '2023-05-20 14:25:00'
    },
    {
      id: 2,
      majorName: '软件工程',
      collegeId: 1,
      collegeName: '信息工程学院',
      introduction: '培养掌握软件开发方法与技术、软件工程管理等知识，能从事软件开发、测试与维护的专业人才',
      deanId: 102,
      deanName: '李教授',
      status: 1,
      createTime: '2023-01-15 11:20:00',
      updateTime: '2023-06-10 09:15:00'
    },
    {
      id: 3,
      majorName: '人工智能',
      collegeId: 1, 
      collegeName: '信息工程学院',
      introduction: '培养具备人工智能理论基础和应用能力，能够在智能系统研发、算法设计等领域工作的人才',
      deanId: 103,
      deanName: '王教授',
      status: 1,
      createTime: '2023-02-20 09:10:00',
      updateTime: '2023-07-05 16:40:00'
    },
    {
      id: 4,
      majorName: '数据科学与大数据技术',
      collegeId: 1,
      collegeName: '信息工程学院',
      introduction: '培养具备大数据采集、处理、分析与应用能力的专业人才',
      deanId: 104,
      deanName: '刘教授',
      status: 1,
      createTime: '2023-03-05 14:20:00',
      updateTime: '2023-08-12 10:50:00'
    },
    {
      id: 5,
      majorName: '数学与应用数学',
      collegeId: 2,
      collegeName: '理学院',
      introduction: '培养具有扎实的数学基础和较强的数学应用能力的专业人才',
      deanId: 201,
      deanName: '钱教授',
      status: 1,
      createTime: '2023-01-18 08:40:00',
      updateTime: '2023-06-25 11:30:00'
    },
    {
      id: 6,
      majorName: '物理学',
      collegeId: 2,
      collegeName: '理学院',
      introduction: '培养具备物理学基本理论和实验技能，能在科研、教育等领域工作的专业人才',
      deanId: 202,
      deanName: '孙教授',
      status: 0,
      createTime: '2023-01-20 13:15:00',
      updateTime: '2023-05-30 15:45:00'
    },
    {
      id: 7,
      majorName: '英语',
      collegeId: 3,
      collegeName: '外国语学院',
      introduction: '培养具有扎实的英语语言基础和广泛的文化知识，能在外事、教育等领域工作的专业人才',
      deanId: 301,
      deanName: '周教授',
      status: 1,
      createTime: '2023-02-10 10:00:00',
      updateTime: '2023-07-18 09:20:00'
    },
    {
      id: 8,
      majorName: '日语',
      collegeId: 3,
      collegeName: '外国语学院',
      introduction: '培养具备扎实的日语语言基础和较强的跨文化交际能力的专业人才',
      deanId: 302,
      deanName: '吴教授',
      status: 0,
      createTime: '2023-03-01 11:30:00',
      updateTime: '2023-08-05 14:10:00'
    }
  ]
}

// 模拟的学院列表，用于选择专业所属学院
export const mockCollegeList = [
  { id: 1, collegeName: '信息工程学院' },
  { id: 2, collegeName: '理学院' },
  { id: 3, collegeName: '外国语学院' },
  { id: 4, collegeName: '经济管理学院' },
  { id: 5, collegeName: '人文学院' }
] 