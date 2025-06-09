<template>
  <div class="exam-preview">
    <div class="exam-header">
      <h1>{{ examInfo.title || '未命名试卷' }}</h1>
      <div class="exam-meta">
        <span>考试时长：{{ examInfo.duration }}分钟</span>
        <span>总分：{{ examInfo.totalScore }}分</span>
      </div>
    </div>

    <div class="questions">
      <div v-for="(question, index) in questions" :key="question.id" class="question-item">
        <div class="question-header">
          <span class="question-index">{{ index + 1 }}.</span>
          <span class="question-type">[{{ getQuestionTypeName(question.type) }}]</span>
          <span class="question-score">({{ question.score }}分)</span>
        </div>
        
        <div class="question-content" v-html="question.content"></div>
        
        <div v-if="question.type === 'single'" class="options">
          <div v-for="option in question.options" :key="option.id" class="option">
            <el-radio 
              v-model="answers[question.id]" 
              :label="option.id"
              disabled
            >
              <div v-html="option.content"></div>
            </el-radio>
          </div>
        </div>

        <div v-else class="objective-answer">
          <el-input
            type="textarea"
            rows="3"
            placeholder="请输入答案"
            disabled
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Question } from '@/types/exam'

interface ExamInfo {
  title: string
  duration: number
  totalScore: number
}

defineProps<{
  examInfo: ExamInfo
  questions: Question[]
}>()

const answers = ref<Record<number, string>>({})

const getQuestionTypeName = (type: string) => {
  const typeMap = {
    single: '单选题',
    objective: '客观题'
  }
  return typeMap[type as keyof typeof typeMap] || '未知题型'
}
</script>

<style scoped>
.exam-preview {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.exam-header {
  text-align: center;
  margin-bottom: 30px;
}

.exam-meta {
  color: #666;
  margin-top: 10px;
}

.exam-meta span {
  margin: 0 10px;
}

.question-item {
  margin-bottom: 30px;
}

.question-header {
  margin-bottom: 10px;
}

.question-index {
  font-weight: bold;
  margin-right: 5px;
}

.question-type {
  color: #409EFF;
  margin-right: 5px;
}

.question-score {
  color: #666;
}

.question-content {
  margin-bottom: 15px;
}

.options {
  padding-left: 20px;
}

.option {
  margin-bottom: 10px;
}

.objective-answer {
  margin-top: 10px;
  padding-left: 20px;
}

:deep(img) {
  max-width: 100%;
  height: auto;
}
</style> 