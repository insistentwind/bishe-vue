<template>
  <div class="exam-editor">
    <!-- 隐藏的打印 iframe -->
    <iframe
      ref="printFrame"
      style="display: none;"
    ></iframe>

    <el-container>
      <!-- 左侧预览区域 -->
      <el-aside :width="isFullscreenPreview ? '100%' : '50%'" :class="{'fullscreen-preview': isFullscreenPreview}">
        <div class="preview-area">
          <div class="preview-header">
            <h2>预览区域</h2>
            <el-button 
              v-if="isFullscreenPreview" 
              type="primary" 
              size="small" 
              @click="isFullscreenPreview = false"
              class="exit-preview-btn"
            >
              <el-icon><View /></el-icon>
              退出预览
            </el-button>
          </div>
          <div class="exam-paper">
            <div class="exam-header">
              <div class="seat-number">座位号：_______</div>
              <h1 class="exam-title">{{ examInfo.examName || '未命名试卷' }}</h1>
              <div class="exam-meta">
                <div class="meta-row">
                  <span>科目：{{ getLessonName(examInfo.lesson) }}</span>
                  <span>时长：{{ examInfo.duration }}分钟</span>
                  <span>满分：{{ examInfo.totalScore }}分</span>
                </div>
                <div class="student-info">
                  <p>姓名：____________ &nbsp;&nbsp;&nbsp; 班级：_______________ &nbsp;&nbsp;&nbsp; 学号：_____________</p>
                </div>
              </div>
            </div>

            <div class="questions">
              <div 
                v-for="(question, index) in questions" 
                :key="question.id" 
                :class="['question-item', {'note-item': question.type === 'note'}]"
              >
                <!-- 题注类型 -->
                <template v-if="question.type === 'note'">
                  <div class="note-header">
                    <span class="note-title">{{ question.noteTitle || '阅读材料' }}</span>
                  </div>
                  <div class="content-html note-content" v-html="question.content"></div>
                </template>
                <!-- 普通题目类型 -->
                <template v-else>
                  <div class="question-header">
                    <span class="question-index">{{ getRealQuestionNumber(index) }}. </span>
                    <span class="question-type">（{{ question.score }}分）</span>
                  </div>
                  <div class="question-content-wrapper">
                    <div class="content-html" v-html="question.content"></div>
                  </div>
                  <div v-if="question.type === 'single' || question.type === 'multiple'" class="options">
                    <div v-for="(option, index) in question.options" :key="option.id" class="option">
                      <div class="option-content">
                        <span class="option-label">{{ String.fromCharCode(65 + index) }}. </span>
                        <span v-html="option.content"></span>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="question.type === 'blank'" class="blank-answer">
                    <div class="answer-box">
                      <div class="blank-hints">
                        请在试卷上的横线处填写答案
                      </div>
                    </div>
                  </div>
                  <div v-else class="objective-answer">
                    <div class="answer-box">
                      <div class="answer-lines"></div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </el-aside>

      <!-- 右侧编辑区域 -->
      <el-main v-show="!isFullscreenPreview">
        <div class="edit-section">
          <div class="section-header">
            <h2>试卷编辑</h2>
          </div>
          
          <div class="toolbar">
            <div class="toolbar-group">
              <el-upload
                class="upload-btn"
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                @change="handleOCR"
              >
                <el-button type="primary">
                  <el-icon><Document /></el-icon>
                  OCR导入试卷
                </el-button>
              </el-upload>
              <el-button type="primary" @click="saveExam">
                <el-icon><Document /></el-icon>
                保存试卷
              </el-button>
            </div>
            
            <div class="toolbar-group">
              <el-button type="success" @click="addQuestion">
                <el-icon><Plus /></el-icon>
                添加试题
              </el-button>
              <el-button type="primary" @click="addNote">
                <el-icon><Reading /></el-icon>
                添加题注
              </el-button>
              <el-button type="info" @click="showExistingExams">
                <el-icon><Folder /></el-icon>
                已有试卷
              </el-button>
            </div>
            
            <div class="toolbar-group">
              <el-button :type="isFullscreenPreview ? 'danger' : 'warning'" @click="previewQuestions">
                <el-icon><View /></el-icon>
                {{ isFullscreenPreview ? '退出预览' : '预览试题' }}
              </el-button>
              <el-button type="primary" @click="printExam">
                <el-icon><Printer /></el-icon>
                打印试卷
              </el-button>
            </div>
          </div>

          <!-- OCR处理进度对话框 -->
          <el-dialog
            v-model="showOcrProgress"
            title="正在识别试卷"
            width="360px"
            :close-on-click-modal="false"
            :show-close="false"
          >
            <div class="ocr-progress">
              <el-progress :percentage="ocrProgress" :stroke-width="18" status="success" />
              <p>{{ ocrStatus }}</p>
            </div>
          </el-dialog>

          <!-- 查看已有试卷对话框 -->
          <el-dialog
            v-model="existingExamsDialogVisible"
            align-center
            title="查看已有试卷"
            width="700"
          >
            <el-form label-width="120px">
              <el-form-item label="选择学院">
                <el-select
                  v-model="selectedCollegeId"
                  filterable
                  placeholder="请选择学院"
                  style="width: 100%"
                  @change="handleCollegeChange"
                >
                  <el-option
                    v-for="college in collegeList"
                    :key="college.collegeId"
                    :label="college.collegeName"
                    :value="college.collegeId"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="选择科目" v-if="selectedCollegeId">
                <el-select
                  v-model="selectedSubjectId"
                  filterable
                  placeholder="请选择科目"
                  style="width: 100%"
                  @change="handleSubjectChange"
                >
                  <el-option
                    v-for="subject in subjectList"
                    :key="subject.lessonId"
                    :label="subject.lessonName"
                    :value="subject.lessonId"
                  />
                </el-select>
              </el-form-item>
            </el-form>

            <!-- 考试列表 -->
            <div v-if="selectedSubjectId && existingExamsList.length > 0" class="exams-table">
              <h3>科目考试列表</h3>
              <el-table :data="existingExamsList" style="width: 100%" border>
                <el-table-column prop="examName" label="考试名称" show-overflow-tooltip />
                <el-table-column prop="lesson" label="科目" width="120" />
                <el-table-column prop="examClass" label="用途" width="80">
                  <template #default="scope">
                    {{ scope.row.examClass === 1 ? '考试' : '测试' }}
                  </template>
                </el-table-column>
                <el-table-column prop="duration" label="考试时长" width="130">
                  <template #default="scope">
                    {{ scope.row.duration }} 分钟
                  </template>
                </el-table-column>
                <el-table-column prop="totalScore" label="总分" width="110" />
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="scope">
                    <el-button size="small" type="primary" @click="loadExamDetail(scope.row)">导入试卷</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else-if="selectedSubjectId && existingExamsList.length === 0" style="text-align: center; margin: 20px 0;">
              <el-empty description="该科目暂无考试记录" />
            </div>
          </el-dialog>

          <!-- 试卷基本信息 -->
          <div class="exam-info">
            <h3 class="section-title">试卷基本信息</h3>
            <el-form :model="examInfo" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="试卷类型">
                    <el-select v-model="examInfo.lesson" placeholder="请选择科目">
                      <el-option
                        v-for="item in lessonOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="试卷标题">
                    <el-input v-model="examInfo.examName" placeholder="请输入试卷标题"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="考试时长">
                    <el-input-number v-model="examInfo.duration" :min="1" :max="180" style="width: 100%"/>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="总分">
                    <el-input-number v-model="examInfo.totalScore" :min="1" :max="300" style="width: 100%"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="试卷用途">
                    <el-radio-group v-model="examInfo.examClass">
                      <el-radio :label="0">测试</el-radio>
                      <el-radio :label="1">考试</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <!-- 试题列表 -->
          <div class="question-list">
            <h3 class="section-title">
              试题列表
              <el-button 
                type="text" 
                :icon="Sort" 
                @click="toggleSortMode"
                class="sort-mode-btn" 
                :class="{ 'sort-active': sortModeActive }"
              >
                {{ sortModeActive ? '退出排序' : '排序题目' }}
              </el-button>
            </h3>
            
            <!-- 排序模式下的试题列表 -->
            <div v-if="sortModeActive" class="sort-container">
              <p class="sort-tip">拖拽题目卡片调整顺序，排序完成后点击"保存排序"按钮</p>
              <draggable 
                v-model="questions" 
                item-key="id"
                handle=".drag-handle"
                ghost-class="ghost-item"
                animation="300"
                @end="handleDragEnd"
              >
                <template #item="{ element, index }">
                  <div class="sortable-item" :class="{'note-sortable-item': element.type === 'note'}">
                    <div class="drag-handle">
                      <el-icon><Sort /></el-icon>
                    </div>
                    <div class="sortable-content">
                      <div class="sortable-header">
                        <template v-if="element.type === 'note'">
                          <span class="note-title-sort">题注: {{ element.noteTitle || '阅读材料' }}</span>
                        </template>
                        <template v-else>
                          <span class="question-number">第 {{ getRealQuestionNumber(index) }} 题</span>
                          <span class="question-type-tag">{{ getQuestionTypeName(element.type) }}</span>
                          <span class="question-score-sort">{{ element.score }}分</span>
                        </template>
                      </div>
                      <div class="sortable-preview" v-html="getContentPreview(element.content)"></div>
                    </div>
                  </div>
                </template>
              </draggable>
              <div class="sort-actions">
                <el-button type="primary" @click="saveSorting">保存排序</el-button>
                <el-button @click="cancelSorting">取消</el-button>
              </div>
            </div>
            
            <!-- 正常模式下的试题列表 -->
            <el-collapse v-else v-model="activeQuestion" accordion>
              <el-collapse-item v-for="(question, index) in questions" :key="question.id" :name="index">
                <template #title>
                  <div class="question-collapse-title">
                    <span v-if="question.type === 'note'" class="note-indicator">
                      题注：{{ question.noteTitle || '阅读材料' }}
                    </span>
                    <span v-else>第 {{ getRealQuestionNumber(index) }} 题</span>
                    <el-tag size="small" :type="getQuestionTypeTagType(question.type)" effect="dark">
                      {{ getQuestionTypeName(question.type) }}
                    </el-tag>
                    <span class="question-score" v-if="question.type !== 'note'">{{ question.score }}分</span>
                  </div>
                </template>
                <QuestionEditor v-model="questions[index]" @update:modelValue="(q) => handleQuestionChange(index, q)" />
                <div class="question-actions">
                  <el-button-group>
                    <el-button type="primary" size="small" @click="changeQuestionType(index, 'single')">设为单选题</el-button>
                    <el-button type="success" size="small" @click="changeQuestionType(index, 'multiple')">设为多选题</el-button>
                    <el-button type="info" size="small" @click="changeQuestionType(index, 'blank')">设为填空题</el-button>
                    <el-button type="warning" size="small" @click="changeQuestionType(index, 'objective')">设为客观题</el-button>
                    <el-button type="info" size="small" @click="changeQuestionType(index, 'note')">设为题注</el-button>
                  </el-button-group>
                  <el-button type="danger" size="small" style="margin-left: 10px;" @click="removeQuestion(index)">删除</el-button>
                </div>
              </el-collapse-item>
            </el-collapse>
            
            <div v-if="questions.length === 0" class="no-questions">
              <el-empty description="暂无试题，请点击&quot;添加试题&quot;按钮添加">
                <template #extra>
                  <el-button type="primary" @click="addQuestion">添加试题</el-button>
                </template>
              </el-empty>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Printer, Document, Plus, Folder, View, Reading, Sort } from '@element-plus/icons-vue'
import QuestionEditor from '@/components/QuestionEditor.vue'
import type { Question } from '@/types/exam'
import { recognizeExam } from '@/api/ocr'
import { saveExam as saveExamApi } from '@/api/exam'
import { getAllColleges, queryLessonsByCollegeID } from '@/request/school/query'
import { queryByExamClass } from '@/request/test/test'
import { queryAll } from '@/request/class/class'
import draggable from 'vuedraggable'

const printFrame = ref<HTMLIFrameElement>()

const examInfo = reactive({
  examName: '',
  duration: 60,
  totalScore: 100,
  lesson: '',
  examClass: 0  // 默认为测试(0)，考试为1
})

const questions = ref<Question[]>([])
const activeQuestion = ref([0]) // 当前展开的试题

// 添加类型定义
interface LessonResponse {
  collegeId: string;
  hours: string;
  id: number;
  lessonName: string;
  score: string;
  teacherId: string;
  teacherName: string;
}

interface LessonOption {
  label: string;
  value: string;
}

const lessonOptions = ref<LessonOption[]>([])

// OCR相关状态
const showOcrProgress = ref(false)
const ocrProgress = ref(0)
const ocrStatus = ref('准备识别...')

// 新增已有试卷相关接口
interface College {
  id: number;
  collegeId: string;
  collegeName: string;
}

interface LessonDtoInfo {
  lessonId: string;
  lessonName: string;
}

interface SubjectExam {
  id: string;
  examName: string;
  lesson: string;
  lessonId?: string;
  duration: number;
  totalScore: number;
  examId?: string;
  examClass?: number; // 添加试卷用途字段：0-测试，1-考试
  questions?: Question[];
}

// 新增已有试卷相关状态
const existingExamsDialogVisible = ref(false)
const collegeList = ref<College[]>([])
const subjectList = ref<LessonDtoInfo[]>([])
const selectedCollegeId = ref('')
const selectedSubjectId = ref('')
const existingExamsList = ref<SubjectExam[]>([])

// 添加一个ref来存储当前编辑的试卷id
const currentExamId = ref<string | null>(null)

// 获取题型名称
const getQuestionTypeName = (type: string) => {
  const typeMap = {
    note: '题注',
    single: '单选题',
    multiple: '多选题',
    objective: '客观题',
    blank: '填空题'
  }
  return typeMap[type as keyof typeof typeMap] || '未知题型'
}

// 获取题型标签样式
const getQuestionTypeTagType = (type: string) => {
  const typeMap = {
    note: 'info',
    single: 'primary',
    multiple: 'success',
    objective: 'warning',
    blank: 'info'
  }
  return typeMap[type as keyof typeof typeMap] || 'info'
}

// 获取题目的实际编号（跳过题注）
const getRealQuestionNumber = (index: number) => {
  let realNumber = 0
  for (let i = 0; i <= index; i++) {
    if (questions.value[i].type !== 'note') {
      realNumber++
    }
  }
  return realNumber
}

// 获取总题数（不包括题注）
const getTotalRealQuestions = () => {
  return questions.value.filter(q => q.type !== 'note').length
}

// 添加试题
const addQuestion = () => {
  // 使用序号作为ID，从1开始计数
  const questionId = questions.value.length > 0 
    ? Math.max(...questions.value.map(q => typeof q.id === 'number' ? q.id : 0)) + 1 
    : 1
  
  // 修复类型问题，使用明确的类型值
  const questionType = 'single' as 'single' | 'multiple' | 'objective' | 'blank' | 'note'
  
  const newQuestion: any = {
    id: questionId,
    type: questionType,
    content: '',
    options: [
      { id: `${questionId}_A`, content: '' },
      { id: `${questionId}_B`, content: '' },
      { id: `${questionId}_C`, content: '' },
      { id: `${questionId}_D`, content: '' }
    ],
    answer: '',
    score: 5,
    analysis: '',
  }
  
  // 添加特定字段
  newQuestion.student_answer = '';
  newQuestion.student_score = 0;
  
  // 如果是客观题，添加objectiveAnswer字段
  if (questionType === 'objective') {
    newQuestion.objectiveAnswer = '';
  }
  
  questions.value.push(newQuestion)
  activeQuestion.value = [questions.value.length - 1]
}

// 添加题注
const addNote = () => {
  // 使用序号作为ID，从1开始计数
  const noteId = questions.value.length > 0 
    ? Math.max(...questions.value.map(q => typeof q.id === 'number' ? q.id : 0)) + 1 
    : 1
  
  const newNote: any = {
    id: noteId,
    type: 'note',
    content: '',
    noteTitle: '阅读材料',
    isNote: true,
    score: 0 // 题注不计分
  }
  
  questions.value.push(newNote)
  activeQuestion.value = [questions.value.length - 1]
}

// 删除试题
const removeQuestion = (index: number) => {
  questions.value.splice(index, 1)
  
  // 删除后重新编号所有题目，确保ID连续
  reorderQuestionIds()
  
  // 如果当前没有选中的题目，且还有题目，则选中第一题
  if (activeQuestion.value.length === 0 && questions.value.length > 0) {
    activeQuestion.value = [0]
  }
}

// 重新编号所有试题ID
const reorderQuestionIds = () => {
  const updatedQuestions = questions.value.map((question, index) => {
    const newId = index + 1
    const oldId = question.id
    
    // 创建问题的副本以避免直接修改原对象
    const updatedQuestion = { ...question }
    
    // 更新选项ID和对应的答案引用
    if (updatedQuestion.options && updatedQuestion.options.length > 0) {
      const updatedOptions = updatedQuestion.options.map((option, optIndex) => {
        const oldOptionId = option.id
        const newOptionId = `${newId}_${String.fromCharCode(65 + optIndex)}`
        
        // 返回更新后的选项对象
        return {
          ...option,
          id: newOptionId
        }
      })
      
      // 更新答案中的引用
      if (updatedQuestion.type === 'single' && typeof updatedQuestion.answer === 'string') {
        // 找到与旧选项ID匹配的选项在新选项中的索引
        const oldOptionIndex = updatedQuestion.options.findIndex(opt => opt.id === updatedQuestion.answer)
        if (oldOptionIndex !== -1) {
          // 使用新选项ID更新答案
          updatedQuestion.answer = updatedOptions[oldOptionIndex].id
        }
      } else if (updatedQuestion.type === 'multiple' && Array.isArray(updatedQuestion.answer)) {
        // 多选题答案处理
        updatedQuestion.answer = updatedQuestion.answer.map(answerId => {
          const oldAnswerIndex = updatedQuestion.options.findIndex(opt => opt.id === answerId)
          return oldAnswerIndex !== -1 ? updatedOptions[oldAnswerIndex].id : answerId
        })
      }
      
      // 更新问题的选项
      updatedQuestion.options = updatedOptions
    }
    
    // 更新ID
    updatedQuestion.id = newId
    
    return updatedQuestion
  })
  
  // 用更新后的问题列表替换原列表
  questions.value = updatedQuestions
  
  console.log('题目ID已重新编号:', questions.value.map(q => q.id))
}

// 修改题目类型
const changeQuestionType = (index: number, newType: 'single' | 'multiple' | 'objective' | 'blank' | 'note') => {
  const question = questions.value[index];
  const oldType = question.type;
  
  // 如果类型没变，不做处理
  if (oldType === newType) return;
  
  // 更新题型
  question.type = newType;
  
  // 特殊处理：题注类型
  if (newType === 'note') {
    question.noteTitle = question.noteTitle || '阅读材料';
    question.isNote = true;
    question.score = 0; // 题注不计分
    question.answer = ''; // 题注没有答案
    question.analysis = ''; // 题注没有解析
    return;
  } 
  else if (oldType === 'note') {
    // 从题注切换到其他类型
    question.isNote = false;
    question.score = 5; // 恢复默认分值
  }
  
  // 特殊处理：从其他题型改为选择题类型时，确保有选项
  if ((newType === 'single' || newType === 'multiple') && 
      (oldType === 'objective' || oldType === 'blank' || oldType === 'note')) {
    // 检查是否已有选项
    if (!question.options || question.options.length === 0) {
      question.options = [
        { id: `${question.id}_A`, content: '' },
        { id: `${question.id}_B`, content: '' },
        { id: `${question.id}_C`, content: '' },
        { id: `${question.id}_D`, content: '' }
      ];
    }
    
    // 如果是多选题，重置答案为空数组
    if (newType === 'multiple') {
      question.answer = [];
    } else {
      // 如果是单选题，确保答案是单个选项ID
      if (Array.isArray(question.answer)) {
        question.answer = question.answer[0] || '';
      }
    }
  }
  
  // 特殊处理：从选择题改为客观题或填空题时
  if ((oldType === 'single' || oldType === 'multiple') && 
      (newType === 'objective' || newType === 'blank')) {
    // 如果是客观题，添加objectiveAnswer字段
    if (newType === 'objective') {
      question.objectiveAnswer = '';
    }
    
    // 重置答案字段
    if (Array.isArray(question.answer)) {
      question.answer = '';
    }
  }
  
  // 特殊处理：从单选题改为多选题，或从多选题改为单选题
  if (oldType === 'single' && newType === 'multiple') {
    // 如果有单选答案，将其转换为数组形式
    if (question.answer && !Array.isArray(question.answer)) {
      question.answer = [question.answer];
    } else {
      question.answer = [];
    }
  } else if (oldType === 'multiple' && newType === 'single') {
    // 如果有多选答案，只保留第一个选项
    if (Array.isArray(question.answer) && question.answer.length > 0) {
      question.answer = question.answer[0];
    } else {
      question.answer = '';
    }
  }
  
  ElMessage.success(`已将第${getRealQuestionNumber(index)}题修改为${getQuestionTypeName(newType)}`);
}

// 添加预览模式状态变量
const isFullscreenPreview = ref(false)

// 预览试题
const previewQuestions = () => {
  // 切换全屏预览模式
  isFullscreenPreview.value = !isFullscreenPreview.value
  
  // 如果是退出预览模式，才显示试题内容到控制台
  if (!isFullscreenPreview.value) {
    const formattedQuestions = formatQuestions()
    console.log('当前试题列表:', JSON.stringify(formattedQuestions, null, 2))
    ElMessage.success('试题内容已在控制台显示')
  } else {
    ElMessage.success('已进入全屏预览模式，点击"预览试题"按钮可退出')
  }
}

// 保存试卷
const saveExam = async () => {
  try {
    // 确保使用科目ID而不是科目名称
    const lessonId = examInfo.lesson
    
    // 确认是否有有效的ID
    if (!lessonId) {
      ElMessage.warning('请先选择科目')
      return
    }
    
    // 检查lessonId是否是数字ID
    const isNumericId = /^\d+$/.test(lessonId.toString())
    if (!isNumericId) {
      ElMessage.warning('科目ID格式不正确，请重新选择科目')
      console.error('错误的科目ID格式:', lessonId)
      return
    }
    
    // 计算实际题目数量（不包括题注）
    const realQuestionCount = getTotalRealQuestions()
    
    // 确保有试题内容
    if (realQuestionCount === 0) {
      ElMessage.warning('请至少添加一道试题（题注不计入试题数量）')
      return
    }
    
    // 检查客观题答案和解析是否混淆
    let hasDataIssues = false
    questions.value.forEach((q, index) => {
      // 跳过题注类型
      if (q.type === 'note') return
      
      if (q.answer === q.analysis && q.answer) {
        console.warn(`警告：第${getRealQuestionNumber(index)}题的答案和解析内容相同，可能存在数据问题`)
        hasDataIssues = true
      }
      
      // 检查答案是否为空
      if (q.type === 'objective' && !q.answer) {
        console.warn(`警告：第${getRealQuestionNumber(index)}题是客观题但没有设置答案`)
      }
    })
    
    // 如果检测到数据问题，显示警告但继续保存
    if (hasDataIssues) {
      ElMessage.warning('检测到部分题目的答案和解析内容相同，请检查数据')
    }
    
    console.log('使用的科目ID:', lessonId)
    console.log('科目中文名称:', getLessonName(lessonId))
    
    // 使用格式化函数
    const formattedQuestions = formatQuestions()
    
    // 计算试卷总分（不包括题注类型）
    const calculatedTotalScore = questions.value
      .filter(q => q.type !== 'note')
      .reduce((total, q) => total + (q.score || 0), 0)
    
    // 如果计算出的总分与设置的总分不一致，显示提示
    if (calculatedTotalScore !== examInfo.totalScore) {
      console.warn(`警告：计算得出的总分(${calculatedTotalScore})与设置的总分(${examInfo.totalScore})不一致`)
      
      // 询问用户是否要更新总分
      if (confirm(`试题总分(${calculatedTotalScore})与设置的总分(${examInfo.totalScore})不一致，是否更新为计算得出的总分？`)) {
        examInfo.totalScore = calculatedTotalScore
      }
    }
    
    const examData = {
      id: currentExamId.value,
      lessonId: lessonId, // 确保使用的是科目ID
      examName: examInfo.examName,
      title: examInfo.examName, // 为了兼容后端API，保留title字段
      subject: getLessonName(lessonId), // 科目名称用于显示
      duration: examInfo.duration,
      totalScore: examInfo.totalScore,
      examClass: examInfo.examClass, // 添加试卷用途字段：0-测试，1-考试
      questions: formattedQuestions, // 使用格式化后的试题内容
      questionCount: realQuestionCount, // 添加实际题目数量字段（不包括题注）
      noteCount: questions.value.length - realQuestionCount // 添加题注数量字段
    }
    
    console.log('保存试卷数据:', JSON.stringify(examData))
    // 调用保存API
    const response = await saveExamApi(examData)
    
    // 根据实际API响应结构处理结果
    if (response && response.data) {
      // 如果响应中有data字段
      const result = response.data
      
      if (result === true || (typeof result === 'object' && result.code === 200)) {
        const noteCount = questions.value.length - realQuestionCount
        let successMessage = `试卷保存成功，共 ${realQuestionCount} 道试题`
        if (noteCount > 0) {
          successMessage += `，${noteCount} 个题注`
        }
        ElMessage.success(successMessage)
        
        // 如果返回了新的ID，更新当前ID
        if (typeof result === 'object' && result.data && result.data.id) {
          currentExamId.value = result.data.id
        }
      } else {
        // 处理可能的错误情况
        if (typeof result === 'object' && result.msg) {
          ElMessage.warning(`保存失败: ${result.msg}`)
        } else {
          ElMessage.warning('保存失败，请检查输入数据')
        }
      }
    } else {
      ElMessage.success('试卷保存成功')
    }
  } catch (error) {
    console.error('保存试卷出错:', error)
    ElMessage.error('保存失败')
  }
}

// 打印试卷
const printExam = () => {
  const iframe = printFrame.value
  if (!iframe) return
  
  const doc = iframe.contentDocument
  if (!doc) return
  
  // 克隆预览区域的内容用于打印
  const examPaper = document.querySelector('.exam-paper') as HTMLElement
  if (!examPaper) return
  
  // 处理HTML内容确保文本对齐正确
  const clonedPaper = examPaper.cloneNode(true) as HTMLElement
  
  // 将所有question-content和note-content添加content-html类
  const contentElements = clonedPaper.querySelectorAll('.question-content, .note-content')
  contentElements.forEach(el => {
    el.classList.add('content-html')
    
    // 找到所有带有对齐样式的元素，确保它们是块级元素
    const alignedElements = el.querySelectorAll('[style*="text-align"]')
    alignedElements.forEach(aligned => {
      (aligned as HTMLElement).style.display = 'block'
    })
  })
  
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${examInfo.examName || '未命名试卷'}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
            color: #333;
            padding: 20px;
            font-size: 14px;
            line-height: 1.5;
          }
          
          /* 富文本内容专用样式 */
          .content-html {
            display: block !important;
            width: 100%;
            line-height: 1.6;
            word-wrap: break-word;
            word-break: break-all;
          }
          
          /* 强制所有对齐属性生效 */
          [style*="text-align:center"] {
            text-align: center !important;
            display: block !important;
          }
          
          [style*="text-align:right"] {
            text-align: right !important;
            display: block !important;
          }
          
          [style*="text-align:justify"] {
            text-align: justify !important;
            display: block !important;
          }
          
          /* 页面基本样式 */
          .exam-paper {
            width: 100%;
          }
          
          .exam-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
          }
          
          .exam-title {
            font-size: 22px;
            font-weight: bold;
            margin: 16px 0;
          }
          
          .exam-meta {
            margin: 15px 0;
          }
          
          .student-info {
            text-align: left;
            margin-top: 20px;
          }
          
          .question-item {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .question-header {
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .seat-number {
            float: right;
            margin-top: 10px;
          }
          
          /* 选项样式 */
          .options {
            margin-top: 10px;
            padding-left: 20px;
          }
          
          .option {
            margin: 10px 0;
          }
          
          .option-content {
            display: flex;
            align-items: flex-start;
          }
          
          .option-label {
            font-weight: bold;
            margin-right: 10px;
          }
          
          /* 题注样式 */
          .note-item {
            background-color: #f9f9f9;
            border-left: 4px solid #999;
            padding: 10px;
            margin-bottom: 30px;
          }
          
          .note-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
          }
          
          /* 通用样式 */
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
            page-break-inside: avoid;
          }
          
          table td, table th {
            border: 1px solid #ddd;
            padding: 8px;
          }
          
          img {
            max-width: 100%;
            height: auto;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${(clonedPaper as HTMLElement).outerHTML}
      </body>
    </html>
  `)
  
  doc.close()
  
  // 等待样式加载完成后打印
  setTimeout(() => {
    iframe.contentWindow?.print()
  }, 500)
}

// 获取科目列表
const fetchLessons = async () => {
  try {
    const res = await queryAll()
    if (Array.isArray(res)) {  // 直接是数组
      lessonOptions.value = res.map((item: any) => ({
        label: item.lessonName,
        value: item.id.toString()  // 使用id作为value
      }))
      console.log('获取到的科目列表：', lessonOptions.value)
    } else {
      console.error('获取科目列表返回的数据格式不正确:', res)
      ElMessage.warning('获取科目列表数据格式不正确')
    }
  } catch (error) {
    console.error('获取科目列表失败:', error)
    ElMessage.error('获取科目列表失败')
  }
}

// 修改getLessonName函数的类型
const getLessonName = (value: string) => {
  return lessonOptions.value.find((item: LessonOption) => item.value === value)?.label || '未选择'
}

// 处理OCR识别
const handleOCR = async (file: any) => {
  try {
    showOcrProgress.value = true
    ocrProgress.value = 0
    ocrStatus.value = '正在上传图片...'

    // 创建 FormData
    const formData = new FormData()
    formData.append('image', file.raw)

    // 调用OCR处理
    ocrProgress.value = 30
    ocrStatus.value = '正在识别试卷内容...'
    
    const response = await recognizeExam(formData)
    
    ocrProgress.value = 90
    ocrStatus.value = '正在解析试题...'

    // 解析识别结果并添加到试题列表
    // 安全地访问data属性，避免类型错误
    const responseData = response?.data?.data || {}
    
    if (responseData && Array.isArray(responseData.questions)) {
      const ocrQuestions = responseData.questions
      
      if (ocrQuestions.length > 0) {
        // 计算下一个ID应该是多少
        const nextId = questions.value.length > 0 
          ? Math.max(...questions.value.map(q => typeof q.id === 'number' ? q.id : 0)) + 1 
          : 1
        
        ocrQuestions.forEach((q: any, index: number) => {
          // 为每个题目分配连续的ID
          const questionId = nextId + index
          
          questions.value.push({
            id: questionId,
            type: q.type || 'objective',
            content: q.content,
            options: q.options?.map((opt: string, optIndex: number) => ({
              id: `${questionId}_${String.fromCharCode(65 + optIndex)}`,
              content: opt
            })) || [],
            answer: q.answer || '',
            student_answer: '',
            score: q.score || 5,
            analysis: q.analysis || '',
            student_score: 0
          })
        })
        
        ElMessage.success(`成功识别 ${ocrQuestions.length} 道试题`)
      } else {
        ElMessage.warning('未识别到有效试题')
      }
    } else {
      ElMessage.warning('OCR识别结果格式不正确')
    }

    ocrProgress.value = 100
    ocrStatus.value = '识别完成'

  } catch (error) {
    console.error('OCR识别失败:', error)
    ElMessage.error('试卷识别失败')
  } finally {
    setTimeout(() => {
      showOcrProgress.value = false
    }, 1000)
  }
}

// 查看已有试卷
const showExistingExams = async () => {
  try {
    // 清空选择
    selectedCollegeId.value = ''
    selectedSubjectId.value = ''
    existingExamsList.value = []
    
    // 显示对话框
    existingExamsDialogVisible.value = true
    
    // 加载学院列表
    if (collegeList.value.length === 0) {
      await fetchColleges()
    }
  } catch (error) {
    console.error('打开已有试卷对话框失败:', error)
    // 确保发生错误时对话框状态正确
    existingExamsDialogVisible.value = false
    ElMessage.error('加载学院列表失败')
  }
}

// 获取所有学院
const fetchColleges = async () => {
  try {
    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: '加载学院列表...',
      background: 'rgba(255, 255, 255, 0.7)'
    })
    
    try {
      const res = await getAllColleges()
      
      if (res && Array.isArray(res)) {
        collegeList.value = res
      } else if (res && res.data && Array.isArray(res.data.data)) {
        collegeList.value = res.data.data
      } else {
        console.error('获取学院列表返回的数据格式不正确:', res)
        ElMessage.error('获取学院列表失败')
      }
    } finally {
      // 确保无论成功还是失败都关闭加载状态
      loading.close()
    }
  } catch (error) {
    console.error('获取学院列表出错:', error)
    ElMessage.error('获取学院列表失败')
  }
}

// 处理学院选择变化
const handleCollegeChange = async (collegeId: string) => {
  try {
    // 重置科目相关数据
    selectedSubjectId.value = ''
    existingExamsList.value = []
    
    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: '加载科目列表...',
      background: 'rgba(255, 255, 255, 0.7)'
    })
    
    const res = await queryLessonsByCollegeID(collegeId)
    
    loading.close() // 关闭加载状态
    
    if (Array.isArray(res)) {  // 直接处理数组格式
      subjectList.value = res.map((lesson: LessonResponse) => ({
        lessonId: lesson.id.toString(),
        lessonName: lesson.lessonName
      }))
    } else if (res?.data && Array.isArray(res.data)) {  // 处理包装在data中的数组
      subjectList.value = res.data.map((lesson: LessonResponse) => ({
        lessonId: lesson.id.toString(),
        lessonName: lesson.lessonName
      }))
    } else {
      subjectList.value = []
      console.error('获取科目列表返回的数据格式不正确:', res)
      ElMessage.warning('该学院暂无科目')
    }
    console.log('学院下的科目列表：', subjectList.value)  // 添加调试日志
  } catch (error) {
    console.error('获取科目列表出错:', error)
    ElMessage.error('获取科目列表失败')
  }
}

// 处理科目选择变化
const handleSubjectChange = async (lessonId: string) => {
  try {
    console.log('选中的科目ID:', lessonId)
    const res = await queryByExamClass("2", lessonId)
    
    if (Array.isArray(res)) {
      console.log('获取到的考试列表:', res)
      
      // 移除对可能不存在的examSet字段的访问
      res.forEach((item, index) => {
        console.log(`考试${index+1} id:`, item.id)
      })
      
      existingExamsList.value = res.map((exam: any) => {
        // 直接使用id作为examId，不再尝试访问examSet
        const examId = exam.id?.toString() || ''
        console.log(`考试 ${exam.examName} 使用的examId:`, examId)
        
        return {
          id: exam.id?.toString() || '',
          examId: examId, // 直接使用id
          examName: exam.examName || '',
          lessonId: exam.lessonId?.toString() || '', // 保存lessonId用于导入
          lesson: subjectList.value.find(s => s.lessonId === lessonId)?.lessonName || '未知科目',
          duration: exam.duration || 120,
          totalScore: parseInt(exam.totalScore?.toString() || '100'),
          examClass: exam.examClass !== undefined ? parseInt(exam.examClass.toString()) : 0 // 添加试卷用途，默认为测试
        }
      })
      
      // 打印映射后的考试列表数据
      console.log('映射后的考试列表:', JSON.stringify(existingExamsList.value, null, 2))
    } else {
      existingExamsList.value = []
      console.error('获取考试列表返回的数据格式不正确:', res)
      ElMessage.warning('暂无考试记录')
    }
  } catch (error) {
    console.error('获取考试列表出错:', error)
    ElMessage.error('获取考试列表失败')
  }
}

// 导入试卷详情
const loadExamDetail = async (exam: SubjectExam) => {
  try {
    // 关闭对话框 - 无论后续操作成功与否，先关闭对话框
    existingExamsDialogVisible.value = false

    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: '正在导入试卷...',
      background: 'rgba(255, 255, 255, 0.7)'
    })
    
    try {
      console.log('导入的试卷信息:', exam)
      
      // 设置当前编辑的试卷id
      currentExamId.value = exam.id
      
      // 更新试卷信息
      examInfo.examName = exam.examName
      examInfo.duration = exam.duration
      examInfo.totalScore = exam.totalScore
      examInfo.examClass = exam.examClass !== undefined ? exam.examClass : 0; // 设置试卷用途，默认为测试
      
      // 使用后端返回的lessonId
      if (exam.lessonId) {
        console.log('使用后端返回的lessonId:', exam.lessonId)
        examInfo.lesson = exam.lessonId
      } else {
        // 如果没有lessonId，尝试根据科目名称查找
        console.log('尝试根据科目名称查找lessonId')
        const lessonId = lessonOptions.value.find(opt => opt.label === exam.lesson)?.value
        if (lessonId) {
          examInfo.lesson = lessonId
          console.log('根据科目名称找到lessonId:', lessonId)
        } else {
          console.warn('未找到科目ID:', exam.lesson)
          examInfo.lesson = '' // 如果找不到，设为空
        }
      }

      // 清空当前的试题列表
      questions.value = []

      // 简化导入逻辑：直接尝试解析已有的考试列表数据
      console.log('尝试从已有数据中提取试题信息')
      
      // 使用之前获取的考试列表，找到匹配的考试记录
      const examRecord = existingExamsList.value.find(item => item.id === exam.id)
      
      let importSuccess = false;
      
      if (examRecord && examRecord.questions) {
        // 如果考试记录中已经有questions字段，直接使用
        console.log('从考试列表中找到试题数据:', examRecord.questions)
        
        // 构造一个符合handleExamData函数期望的数据结构
        const mockRes = [{ questions: examRecord.questions }]
        if (handleExamData(mockRes)) {
          // 额外检查：确保客观题的答案正确加载
          const hasObjectiveQuestions = questions.value.some(q => q.type === 'objective')
          if (hasObjectiveQuestions) {
            console.log('检测到试卷包含客观题，进行答案字段额外检查')
            
            questions.value.forEach((q, idx) => {
              if (q.type === 'objective') {
                // 确保两个字段同步
                if (!q.objectiveAnswer && q.answer) {
                  q.objectiveAnswer = q.answer
                } else if (q.objectiveAnswer && !q.answer) {
                  q.answer = q.objectiveAnswer
                }
              }
            })
          }
          
          importSuccess = true;
        }
      } 
      
      // 如果从列表中提取失败，尝试重新查询
      if (!importSuccess) {
        console.log('列表中的考试记录没有questions字段或提取失败，尝试重新获取')
        
        // 重新获取考试列表
        const res = await queryByExamClass("2", examInfo.lesson)
        
        if (Array.isArray(res)) {
          // 找到当前考试ID对应的记录
          const examRecord = res.find(item => item.id == exam.id)
          
          if (examRecord && examRecord.questions) {
            console.log('找到考试记录中的questions字段:', examRecord.questions)
            
            // 使用handleExamData处理找到的考试记录
            const mockRes = [examRecord]
            if (handleExamData(mockRes)) {
              importSuccess = true;
            }
          } else {
            console.warn('未找到考试记录或questions字段为空')
          }
        }
      }
      
      // 如果所有方法都失败了，添加一个空白试题
      if (!importSuccess) {
        console.warn('无法通过任何方式获取试题信息')
        ElMessage.warning('无法获取试题信息，将创建一个空白试卷')
        addQuestion()
      }
      
      ElMessage.success(importSuccess ? '试卷导入成功' : '试卷基本信息导入成功，已添加空白试题')
      
      // 重新编号所有题目ID，确保连续性
      reorderQuestionIds()
      
    } finally {
      // 无论成功或失败，都关闭加载状态
      loading.close()
    }
    
  } catch (error) {
    console.error('导入试卷失败:', error)
    ElMessage.error('导入试卷失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 辅助函数：处理考试数据并解析试题
const handleExamData = (res: any): boolean => {
  if (res && Array.isArray(res) && res.length > 0) {
    const examData = res[0]
    
    // 检查是否有questions字段
    if (examData.questions) {
      let examQuestions = []
      
      // 尝试解析JSON字符串
      if (typeof examData.questions === 'string') {
        try {
          examQuestions = JSON.parse(examData.questions)
        } catch (parseError) {
          console.error('解析questions字符串失败:', parseError)
          return false
        }
      } else if (Array.isArray(examData.questions)) {
        // 如果已经是数组，直接使用
        examQuestions = examData.questions
      }
      
      if (Array.isArray(examQuestions) && examQuestions.length > 0) {
        // 确保每个试题都有必要的字段
        questions.value = examQuestions.map((q: any, index: number) => {
          // 使用递增的ID，从1开始
          const questionId = index + 1
          
          // 题注类型特殊处理
          if (q.type === 'note') {
            return {
              id: questionId,
              type: 'note' as QuestionType,
              content: q.content || '',
              noteTitle: q.noteTitle || '阅读材料',
              isNote: true,
              score: 0, // 题注不计分
              // 添加必需字段以满足类型要求
              options: [],
              answer: '',
              analysis: ''
            };
          }
          
          // 检查答案和解析是否相同
          if (q.answer === q.analysis && q.answer) {
            console.warn(`警告：加载的题目中答案和解析内容相同，可能存在数据问题`)
          }
          
          // 客观题特殊处理 - 确保objectiveAnswer和answer字段同步
          if (q.type === 'objective') {
            // 如果没有objectiveAnswer但有answer，设置objectiveAnswer
            if (!q.objectiveAnswer && q.answer) {
              q.objectiveAnswer = q.answer;
            } 
            // 如果有objectiveAnswer但没有answer，设置answer
            else if (q.objectiveAnswer && !q.answer) {
              q.answer = q.objectiveAnswer;
            }
          }
          
          // 多选题答案确保为数组
          if (q.type === 'multiple' && !Array.isArray(q.answer)) {
            q.answer = q.answer ? [q.answer] : [];
          }
          
          return {
            id: questionId,
            type: q.type || 'single' as QuestionType,
            content: q.content || '',
            options: Array.isArray(q.options) ? q.options.map((opt: any, optIndex: number) => ({
              id: `${questionId}_${String.fromCharCode(65 + optIndex)}`,
              content: opt.content || ''
            })) : [
              { id: `${questionId}_A`, content: '' },
              { id: `${questionId}_B`, content: '' },
              { id: `${questionId}_C`, content: '' },
              { id: `${questionId}_D`, content: '' }
            ],
            answer: q.answer || '',
            objectiveAnswer: q.type === 'objective' ? (q.objectiveAnswer || q.answer || '') : undefined,
            score: q.score || 5,
            analysis: q.analysis || '',
            // 复制其他字段
            student_answer: q.student_answer || '',
            student_score: q.student_score || 0
          }
        })
        
        // 添加成功提示
        if (questions.value.length > 0) {
          const realQuestionCount = getTotalRealQuestions();
          const noteCount = questions.value.length - realQuestionCount;
          let successMessage = `成功导入 ${realQuestionCount} 道试题`;
          if (noteCount > 0) {
            successMessage += ` 和 ${noteCount} 个题注`;
          }
          ElMessage.success(successMessage);
          return true
        }
      }
    }
  }
  
  return false
}

// 监听试题变更，处理客观题答案
const handleQuestionChange = (index: number, updatedQuestion: Question) => {
  // 处理客观题的objectiveAnswer和answer同步问题
  if (updatedQuestion.type === 'objective') {
    // 如果有objectiveAnswer但没有answer，将objectiveAnswer同步给answer
    if (updatedQuestion.objectiveAnswer && !updatedQuestion.answer) {
      updatedQuestion.answer = updatedQuestion.objectiveAnswer
    } 
    // 如果有answer但没有objectiveAnswer，将answer同步给objectiveAnswer
    else if (updatedQuestion.answer && !updatedQuestion.objectiveAnswer) {
      updatedQuestion.objectiveAnswer = typeof updatedQuestion.answer === 'string' ? 
        updatedQuestion.answer : updatedQuestion.answer.join(',')
    }
  }
  
  // 确保多选题答案是数组
  if (updatedQuestion.type === 'multiple' && !Array.isArray(updatedQuestion.answer)) {
    if (typeof updatedQuestion.answer === 'string' && updatedQuestion.answer) {
      updatedQuestion.answer = [updatedQuestion.answer]
    } else {
      updatedQuestion.answer = []
    }
  }
  
  // 确保单选题答案是字符串
  if (updatedQuestion.type === 'single' && Array.isArray(updatedQuestion.answer)) {
    updatedQuestion.answer = updatedQuestion.answer.length > 0 ? 
      updatedQuestion.answer[0] : ''
  }
  
  questions.value[index] = updatedQuestion
}

// 格式化试题内容
const formatQuestions = () => {
  return questions.value.map((q, index) => {
    // 题注类型特殊处理
    if (q.type === 'note') {
      return {
        id: q.id,
        type: 'note',
        content: q.content || '',
        noteTitle: q.noteTitle || '阅读材料',
        isNote: true,
        score: 0, // 题注不计分
        // 添加必要的属性确保类型一致
        options: [],
        answer: '',
        analysis: ''
      };
    }
    
    // 确保每个字段都有有效值
    let answer = q.answer || '';
    
    // 特殊处理客观题答案
    if (q.type === 'objective') {
      // 优先使用objectiveAnswer作为答案（如果存在）
      if (q.objectiveAnswer) {
        answer = q.objectiveAnswer;
      }
    }
    
    // 构建格式化后的试题对象
    const formattedQuestion: Question = {
      id: q.id,
      type: q.type,
      content: q.content || '',
      options: q.options ? q.options.map(opt => ({
        id: opt.id,
        content: opt.content || ''
      })) : [],
      answer: answer,
      score: q.score || 5,
      analysis: q.analysis || '',
    };
    
    // 如果有额外字段，保留它们
    if (q.student_answer !== undefined) {
      (formattedQuestion as any).student_answer = q.student_answer || '';
    }
    
    if (q.student_score !== undefined) {
      (formattedQuestion as any).student_score = q.student_score || 0;
    }
    
    // 保留客观题的objectiveAnswer字段
    if (q.type === 'objective' && q.objectiveAnswer) {
      (formattedQuestion as any).objectiveAnswer = q.objectiveAnswer;
    }
    
    return formattedQuestion;
  })
}

onMounted(async () => {
  // 添加键盘事件监听，用于ESC键退出全屏预览
  document.addEventListener('keydown', handleKeydown)
  
  // 原有功能
  await fetchLessons() // 获取科目列表
  await fetchColleges() // 获取学院列表
})

// 在onMounted之前添加以下代码

// 排序模式状态
const sortModeActive = ref(false)
const questionsBackup = ref<Question[]>([])

// 切换排序模式
const toggleSortMode = () => {
  if (!sortModeActive.value) {
    // 进入排序模式，先备份当前题目列表
    questionsBackup.value = JSON.parse(JSON.stringify(questions.value))
    sortModeActive.value = true
  } else {
    // 退出排序模式，提示是否保存
    ElMessage.warning('您有未保存的排序更改，请选择保存或取消')
  }
}

// 保存排序
const saveSorting = () => {
  // 重新编排所有题目ID
  reorderQuestionIds()
  
  sortModeActive.value = false
  ElMessage.success('题目排序已保存')
}

// 取消排序
const cancelSorting = () => {
  // 还原备份的题目列表
  questions.value = JSON.parse(JSON.stringify(questionsBackup.value))
  sortModeActive.value = false
  ElMessage.info('已取消排序更改')
}

// 拖拽结束处理
const handleDragEnd = () => {
  // 可以在这里添加拖拽结束后的预览逻辑
  console.log('拖拽排序完成，新的排序为:', questions.value.map(q => q.type === 'note' ? `题注:${q.noteTitle}` : `题目:${q.id}`))
}

// 获取内容预览（截取前30个字符）
const getContentPreview = (content: string) => {
  if (!content) return '无内容'
  
  // 移除HTML标签，只保留文本
  const textContent = content.replace(/<[^>]+>/g, '')
  
  // 截取前30个字符
  return textContent.length > 30 
    ? textContent.substring(0, 30) + '...' 
    : textContent
}

// 键盘事件处理 - 用ESC键退出全屏预览模式
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isFullscreenPreview.value) {
    isFullscreenPreview.value = false
    ElMessage.info('已退出预览模式')
  }
}

// 在组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.exam-editor {
  height: 100%;
  background: #fff;
  color: #333;
}

.el-container {
  height: 100%;
}

.preview-area {
  padding: 24px;
  border-right: 1px solid #e6e6e6;
  height: 100%;
  overflow-y: auto;
  background: #f5f7fa;
  box-shadow: inset -5px 0 10px -5px rgba(0, 0, 0, 0.1);
}

.preview-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.preview-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
  margin: 0;
}

.exam-paper {
  background: white;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  min-height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  max-width: 800px;
  margin: 0 auto;
}

.exam-header {
  position: relative;
  margin-bottom: 30px;
}

.seat-number {
  position: absolute;
  top: 0;
  right: 0;
  font-weight: bold;
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 4px 8px;
  border-radius: 4px;
}

.exam-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 24px;
  padding-top: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.exam-meta {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #000;
  padding-bottom: 24px;
}

.meta-row {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-row span {
  margin: 0 24px;
  font-weight: 600;
  display: inline-block;
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.student-info {
  margin-top: 24px;
  text-align: left;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.question-item {
  margin-bottom: 40px;
  page-break-inside: avoid;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.question-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.question-header {
  display: inline;
  font-weight: bold;
  margin-right: 8px;
}

.question-content-wrapper {
  display: block;
  width: 100%;
  margin: 10px 0;
}

.question-content {
  display: block !important;
  width: 100%;
}

.options {
  margin-top: 16px;
  padding-left: 32px;
  width: calc(100% - 32px);
}

.option-content {
  margin: 12px 0;
  display: flex;
  align-items: flex-start;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.option-content:hover {
  background: #f1f3f5;
}

.option-label {
  font-weight: 600;
  flex-shrink: 0;
  margin-right: 12px;
  color: #409EFF;
}

.option-content > span:last-child {
  flex: 1;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.5;
}

.answer-box {
  margin: 16px 0;
  padding: 0 32px;
  width: calc(100% - 64px);
}

.answer-lines {
  min-height: 120px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fcfcfc;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.blank-answer {
  margin: 16px 0;
  padding: 0 32px;
  width: calc(100% - 64px);
}

.blank-hints {
  padding: 10px;
  background: #f8f8f8;
  border-radius: 4px;
  color: #666;
  font-size: 14px;
  text-align: center;
  border: 1px dashed #dcdfe6;
}

/* 编辑区样式 */
.el-main {
  padding: 24px;
  background: #fff;
  overflow-y: auto;
}

.edit-section {
  height: 100%;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
  margin: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #409EFF;
}

.toolbar {
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  align-items: center;
  justify-content: center;
}

.toolbar-group {
  display: flex;
  gap: 8px;
  margin: 0 8px;
}

.toolbar .el-button {
  margin: 0;
  padding: 10px 20px;
  font-weight: 500;
}

.toolbar .el-button .el-icon {
  margin-right: 6px;
}

.exam-info {
  margin-bottom: 24px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.exam-info .el-form-item {
  margin-bottom: 20px;
}

.exam-info .el-select,
.exam-info .el-input,
.exam-info .el-input-number {
  width: 100%;
}

.question-list {
  margin-bottom: 24px;
}

.el-collapse {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.el-collapse-item {
  border-bottom: 1px solid #ebeef5;
}

.question-collapse-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  padding: 8px 0;
}

.question-score {
  color: #ff9800;
  font-weight: bold;
  margin-left: auto;
}

.question-actions {
  margin-top: 16px;
  text-align: right;
  padding: 8px 0;
  border-top: 1px dashed #ebeef5;
}

.no-questions {
  padding: 40px 0;
  text-align: center;
}

.exams-table {
  margin-top: 20px;
}

.exams-table h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

/* 打印样式 */
@media print {
  .exam-editor {
    height: auto;
  }

  .el-aside {
    width: 100% !important;
  }

  .el-main,
  .toolbar,
  .exam-info,
  .el-collapse,
  .preview-header {
    display: none !important;
  }

  .preview-area {
    padding: 0;
    border: none;
    height: auto;
    overflow: visible;
    background: none;
    box-shadow: none;
  }

  .exam-paper {
    box-shadow: none;
    padding: 20px;
    max-width: none;
  }
}

.upload-btn {
  margin-right: 10px;
}

.ocr-progress {
  text-align: center;
  padding: 24px;
}

.ocr-progress p {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  background: #f8f9fa;
  margin-bottom: 0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
  color: #333;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-table th) {
  background: #f8f9fa;
  font-weight: 600;
}

:deep(.el-table--border) {
  border-color: #ebeef5;
}

/* 确保富文本内容样式正确显示 */
:deep(.question-content),
:deep(.option-content span) {
  /* 让所有HTML标签的样式正常生效 */
  text-align: inherit;
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
  color: inherit;
}

/* 对内部的段落和标题元素应用正确的样式 */
:deep(.question-content p),
:deep(.option-content span p) {
  margin: 8px 0;
  text-align: inherit;
}

:deep(.question-content h1),
:deep(.question-content h2),
:deep(.question-content h3),
:deep(.question-content h4),
:deep(.question-content h5),
:deep(.question-content h6) {
  margin: 16px 0 8px;
  font-weight: bold;
}

/* 确保文本对齐方式生效 */
:deep([style*="text-align:center"]),
:deep([align="center"]) {
  text-align: center !important;
}

:deep([style*="text-align:right"]),
:deep([align="right"]) {
  text-align: right !important;
}

:deep([style*="text-align:justify"]),
:deep([align="justify"]) {
  text-align: justify !important;
}

/* 保证图片和表格样式 */
:deep(.question-content img),
:deep(.option-content span img) {
  max-width: 100%;
  height: auto;
}

:deep(.question-content table),
:deep(.option-content span table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

:deep(.question-content table td),
:deep(.question-content table th),
:deep(.option-content span table td),
:deep(.option-content span table th) {
  border: 1px solid #ddd;
  padding: 8px;
}

/* 确保预览区域正确渲染富文本格式 */
.preview-area :deep(.question-content) {
  /* 处理文本对齐 */
  text-align: inherit;
}

.preview-area :deep(.question-content p) {
  margin: 8px 0;
}

/* 保持富文本编辑器的格式 */
.preview-area :deep(.question-content) :deep(p),
.preview-area :deep(.option-content span) :deep(p) {
  margin: 0.5em 0;
}

/* 处理文本对齐样式 */
.preview-area :deep([style*="text-align:center"]), 
.preview-area :deep([align="center"]) {
  text-align: center !important;
  display: block;
}

.preview-area :deep([style*="text-align:right"]), 
.preview-area :deep([align="right"]) {
  text-align: right !important;
  display: block;
}

.preview-area :deep([style*="text-align:left"]), 
.preview-area :deep([align="left"]) {
  text-align: left !important;
  display: block;
}

/* 处理字体样式 */
.preview-area :deep(b), 
.preview-area :deep(strong) {
  font-weight: bold !important;
}

.preview-area :deep(i), 
.preview-area :deep(em) {
  font-style: italic !important;
}

.preview-area :deep(u) {
  text-decoration: underline !important;
}

/* 处理列表样式 */
.preview-area :deep(ul), 
.preview-area :deep(ol) {
  padding-left: 20px;
  margin: 10px 0;
}

.preview-area :deep(li) {
  margin: 5px 0;
}

/* 处理表格样式 */
.preview-area :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.preview-area :deep(table td),
.preview-area :deep(table th) {
  border: 1px solid #ddd;
  padding: 8px;
}

/* 处理图片样式 */
.preview-area :deep(img) {
  max-width: 100%;
  height: auto;
}

/* 处理数学公式 */
.preview-area :deep(.ql-formula) {
  display: inline-block;
  vertical-align: middle;
}

/* 更好的选项样式 */
.preview-area .options {
  margin-top: 10px;
}

.preview-area .option {
  margin: 8px 0;
}

.preview-area .option-content {
  display: flex;
  align-items: flex-start;
}

.preview-area .option-label {
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

/* 针对打印样式的增强 */
@media print {
  .preview-area :deep(table) {
    page-break-inside: avoid;
  }
  
  .preview-area :deep(img) {
    page-break-inside: avoid;
  }
}

/* 题注样式 */
.note-item {
  background-color: #f0f9eb;
  border-left: 4px solid #67c23a;
}

.note-header {
  margin-bottom: 15px;
  border-bottom: 1px dashed #67c23a;
  padding-bottom: 10px;
}

.note-title {
  font-size: 16px;
  font-weight: bold;
  color: #67c23a;
}

.related-count {
  color: #909399;
  font-size: 14px;
  margin-left: 10px;
}

.note-content {
  padding: 10px;
  font-size: 15px;
  line-height: 1.6;
}

.note-indicator {
  display: flex;
  align-items: center;
  color: #67c23a;
  font-weight: bold;
}

/* 修改折叠面板内题注的样式 */
:deep(.el-collapse-item.is-active .question-collapse-title .note-indicator) {
  color: #409EFF;
}

/* 排序模式样式 */
.sort-mode-btn {
  float: right;
  margin-top: 2px;
}

.sort-active {
  color: #409EFF;
}

.sort-container {
  margin-bottom: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.sort-tip {
  color: #606266;
  margin-bottom: 15px;
  font-size: 14px;
  text-align: center;
}

.sortable-item {
  margin-bottom: 10px;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: stretch;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  overflow: hidden;
}

.sortable-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.note-sortable-item {
  background-color: #f0f9eb;
  border-left: 4px solid #67c23a;
}

.drag-handle {
  width: 40px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  color: #909399;
}

.sortable-content {
  flex: 1;
  padding: 10px 15px;
  overflow: hidden;
}

.sortable-header {
  display: flex;
  margin-bottom: 5px;
  align-items: center;
}

.question-number {
  font-weight: 600;
  margin-right: 10px;
}

.question-type-tag {
  background: #ecf5ff;
  color: #409EFF;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
}

.question-score-sort {
  color: #ff9800;
  font-weight: 600;
  margin-left: auto;
}

.note-title-sort {
  color: #67c23a;
  font-weight: 600;
}

.sortable-preview {
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.sort-actions {
  margin-top: 15px;
  text-align: center;
}

.ghost-item {
  opacity: 0.5;
  background: #f0f9ff !important;
  border: 1px dashed #409EFF !important;
}

/* 针对预览区域的富文本格式增强 */
.preview-area :deep(.question-content),
.preview-area :deep(.note-content) {
  /* 基础样式 */
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-all;
}

/* 关键：提高CSS选择器特异性，确保文本对齐方式覆盖默认样式 */
.preview-area :deep(.question-content [style*="text-align:center"]),
.preview-area :deep(.note-content [style*="text-align:center"]),
.preview-area :deep(.option-content [style*="text-align:center"]),
.preview-area :deep([align="center"]) {
  text-align: center !important;
  display: block;
}

.preview-area :deep(.question-content [style*="text-align:right"]),
.preview-area :deep(.note-content [style*="text-align:right"]),
.preview-area :deep(.option-content [style*="text-align:right"]),
.preview-area :deep([align="right"]) {
  text-align: right !important;
  display: block;
}

.preview-area :deep(.question-content [style*="text-align:justify"]),
.preview-area :deep(.note-content [style*="text-align:justify"]),
.preview-area :deep(.option-content [style*="text-align:justify"]),
.preview-area :deep([align="justify"]) {
  text-align: justify !important;
  display: block;
}

.preview-area :deep(.question-content [style*="text-align:left"]),
.preview-area :deep(.note-content [style*="text-align:left"]),
.preview-area :deep(.option-content [style*="text-align:left"]),
.preview-area :deep([align="left"]) {
  text-align: left !important;
  display: block;
}

/* 针对具体HTML标签的对齐方式 */
.preview-area :deep(p[style*="text-align:center"]),
.preview-area :deep(div[style*="text-align:center"]),
.preview-area :deep(h1[style*="text-align:center"]),
.preview-area :deep(h2[style*="text-align:center"]),
.preview-area :deep(h3[style*="text-align:center"]),
.preview-area :deep(h4[style*="text-align:center"]),
.preview-area :deep(h5[style*="text-align:center"]),
.preview-area :deep(h6[style*="text-align:center"]) {
  text-align: center !important;
}

.preview-area :deep(p[style*="text-align:right"]),
.preview-area :deep(div[style*="text-align:right"]),
.preview-area :deep(h1[style*="text-align:right"]),
.preview-area :deep(h2[style*="text-align:right"]),
.preview-area :deep(h3[style*="text-align:right"]),
.preview-area :deep(h4[style*="text-align:right"]),
.preview-area :deep(h5[style*="text-align:right"]),
.preview-area :deep(h6[style*="text-align:right"]) {
  text-align: right !important;
}

/* 强化预览区域的文本对齐样式 - 增加更严格的选择器和!important */
.preview-area :deep(.question-content),
.preview-area :deep(.note-content),
.preview-area :deep(.option-content) {
  line-height: 1.6;
}

/* 直接针对带有style属性的元素应用样式 */
.preview-area :deep([style*="text-align:center"]) {
  display: block !important;
  text-align: center !important;
}

.preview-area :deep([style*="text-align:right"]) {
  display: block !important;
  text-align: right !important;
}

.preview-area :deep([style*="text-align:justify"]) {
  display: block !important;
  text-align: justify !important;
}

/* 针对特定标签的样式覆盖 */
.preview-area :deep(p[style*="text-align:center"]),
.preview-area :deep(div[style*="text-align:center"]),
.preview-area :deep(h1[style*="text-align:center"]),
.preview-area :deep(h2[style*="text-align:center"]),
.preview-area :deep(h3[style*="text-align:center"]),
.preview-area :deep(h4[style*="text-align:center"]),
.preview-area :deep(h5[style*="text-align:center"]),
.preview-area :deep(h6[style*="text-align:center"]),
.preview-area :deep(span[style*="text-align:center"]) {
  display: block !important;
  text-align: center !important;
}

.preview-area :deep(p[style*="text-align:right"]),
.preview-area :deep(div[style*="text-align:right"]),
.preview-area :deep(h1[style*="text-align:right"]),
.preview-area :deep(h2[style*="text-align:right"]),
.preview-area :deep(h3[style*="text-align:right"]),
.preview-area :deep(h4[style*="text-align:right"]),
.preview-area :deep(h5[style*="text-align:right"]),
.preview-area :deep(h6[style*="text-align:right"]),
.preview-area :deep(span[style*="text-align:right"]) {
  display: block !important;
  text-align: right !important;
}

/* 处理内联元素转块级元素的问题 */
.preview-area :deep(.question-content) > *,
.preview-area :deep(.note-content) > * {
  max-width: 100%;
}

/* 覆盖question-content的inline显示属性 */
.preview-area .question-content {
  display: block !important;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: normal;
  max-width: 100% !important;
}

/* 修复显示为inline的问题，这会影响块级元素的对齐方式 */
.question-content {
  display: block !important;
}

/* 增强对特定标签的支持 */
p[style*="text-align:center"], div[style*="text-align:center"], 
h1[style*="text-align:center"], h2[style*="text-align:center"],
h3[style*="text-align:center"], h4[style*="text-align:center"],
h5[style*="text-align:center"], h6[style*="text-align:center"],
span[style*="text-align:center"] {
  text-align: center !important;
  display: block !important;
}

p[style*="text-align:right"], div[style*="text-align:right"], 
h1[style*="text-align:right"], h2[style*="text-align:right"],
h3[style*="text-align:right"], h4[style*="text-align:right"],
h5[style*="text-align:right"], h6[style*="text-align:right"],
span[style*="text-align:right"] {
  text-align: right !important;
  display: block !important;
}

/* 确保问题内容正确显示 */
.question-content-wrapper {
  display: block;
  width: 100%;
  margin: 10px 0;
}

.question-content {
  display: block !important;
  width: 100%;
}

.fullscreen-preview .preview-area {
  padding: 0;
  border: none;
  height: 100%;
  overflow: visible;
  background: none;
  box-shadow: none;
}

.fullscreen-preview .exam-paper {
  box-shadow: none;
  padding: 20px;
  max-width: none;
}

.exit-preview-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.fullscreen-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #fff;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.fullscreen-preview .preview-area {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
}

.fullscreen-preview .preview-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;
  margin-bottom: 30px;
  border-bottom: 2px solid #eaeaea;
}

.fullscreen-preview .preview-header h2 {
  font-size: 24px;
  color: #333;
}

.exit-preview-btn {
  position: absolute;
  right: 0;
  top: 0;
}

/* 富文本内容专用样式 */
.content-html {
  display: block !important;
  width: 100%;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-all;
}

/* 强制所有对齐属性生效 */
.content-html [style*="text-align:center"] {
  text-align: center !important;
  display: block !important;
}

.content-html [style*="text-align:right"] {
  text-align: right !important;
  display: block !important;
}

.content-html [style*="text-align:left"] {
  text-align: left !important;
  display: block !important;
}

.content-html [style*="text-align:justify"] {
  text-align: justify !important;
  display: block !important;
}

/* 特定元素的对齐样式 */
.content-html p[style*="text-align:center"],
.content-html div[style*="text-align:center"],
.content-html h1[style*="text-align:center"],
.content-html h2[style*="text-align:center"],
.content-html h3[style*="text-align:center"],
.content-html h4[style*="text-align:center"],
.content-html h5[style*="text-align:center"],
.content-html h6[style*="text-align:center"],
.content-html span[style*="text-align:center"] {
  text-align: center !important;
  display: block !important;
}

.content-html p[style*="text-align:right"],
.content-html div[style*="text-align:right"],
.content-html h1[style*="text-align:right"],
.content-html h2[style*="text-align:right"],
.content-html h3[style*="text-align:right"],
.content-html h4[style*="text-align:right"],
.content-html h5[style*="text-align:right"],
.content-html h6[style*="text-align:right"],
.content-html span[style*="text-align:right"] {
  text-align: right !important;
  display: block !important;
}
</style> 