import request from '@/utils/request'
import type { Question } from '@/types/exam'

interface OCRResponse {
  code: number;
  message: string;
  data: {
    questions: Question[];
  };
}

export async function processImage(data: FormData) {
  return request({
    url: '/api/ocr/process',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// OCR识别试卷
export function recognizeExam(data: FormData) {
  return request<OCRResponse>({
    url: '/api/exam/ocr',  // 修改为实际的后端接口地址
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 