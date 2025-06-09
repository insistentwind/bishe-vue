export type QuestionType = 'single' | 'multiple' | 'objective' | 'blank' | 'note'

export interface Question {
  id: number
  type: QuestionType
  content: string
  options: {
    id: string
    content: string
  }[]
  answer: string | string[]  // 多选题的答案为string数组
  score: number
  analysis: string
  objectiveAnswer?: string
  // 附加字段
  noteTitle?: string       // 题注标题
  relatedCount?: number    // 题注关联题目数量
  isNote?: boolean         // 是否是题注
  student_answer?: string | string[]  // 学生答案
  student_score?: number   // 学生得分
}