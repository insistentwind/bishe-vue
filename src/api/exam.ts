import service from '@/request/index'
import type { Question } from '@/types/exam'

// 请求参数接口
interface SaveExamRequest {
  id: string | null;     // 试卷ID，新建时为null
  lessonId: string;      // 课程ID
  title: string;         // 试卷标题
  subject: string;       // 科目类型
  duration: number;      // 考试时长（分钟）
  totalScore: number;    // 总分
  questions: Question[]; // 试题列表
}

// 响应数据接口
interface SaveExamResponse {
  code: number;         // 状态码：200-成功，其他-失败
  msg: string;          // 提示信息
  data: {
    id: string;        // 返回的试卷ID
    [key: string]: any; // 其他可能的返回数据
  };
}

// 保存试卷
export function saveExam(data: SaveExamRequest) {
  return service({
    url: '/exam/save',
    method: 'post',
    data
  })
} 