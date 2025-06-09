export interface Exam {
  id: number;
  examId: string;
  lessonId: string;
  examName: string;
  examClass: string;
  examSet: string;
  paperClassId: string;
  modelName: string;
  examData: string;
  isDelete: number;
}

export interface ScoreResponse {
  code: number;
  msg: string;
  data: Exam[];
} 