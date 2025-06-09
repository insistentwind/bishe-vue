<template>
  <div class="take-exam-container">
    <div class="page-header">
      <h1>参加考试</h1>
      <div class="description">选择课程和考试，开始你的考试之旅</div>
    </div>
    
    <!-- 学院信息展示 -->
    <el-card class="info-card" v-loading="collegeLoading">
      <div class="college-info">
        <div class="info-title">学院信息</div>
        <div class="info-content">
          <span class="label">当前学院：</span>
          <span class="value">{{ collegeInfo.name }}</span>
        </div>
      </div>
    </el-card>

    <!-- 课程选择 -->
    <el-card class="selection-card" v-loading="courseLoading">
      <div class="course-selection">
        <div class="info-title">课程选择</div>
        <div class="course-select">
          <el-select 
            v-model="selectedCourseId" 
            placeholder="请选择课程" 
            @change="handleCourseChange"
            clearable
            style="width: 100%;"
          >
            <el-option 
              v-for="course in courseList" 
              :key="course.id" 
              :label="course.name" 
              :value="course.id" 
            />
          </el-select>
        </div>
      </div>
    </el-card>

    <!-- 考试列表 -->
    <el-card class="exam-list-card" v-if="selectedCourseId" v-loading="examListLoading">
      <div class="card-header">
        <div class="info-title">可参加的考试</div>
      </div>
      
      <el-empty v-if="!examList.length && !examListLoading" description="暂无可参加的考试"></el-empty>
      
      <div v-else class="exam-list">
        <el-table :data="examList" style="width: 100%" v-loading="examListLoading">
          <el-table-column prop="examName" label="考试名称" min-width="180"></el-table-column>
          <el-table-column prop="examType" label="考试类型" width="120">
            <template #default="scope">
              <el-tag :type="getExamTypeTag(scope.row.examType)">
                {{ scope.row.examType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="160"></el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="160"></el-table-column>
          <el-table-column prop="duration" label="考试时长" width="100">
            <template #default="scope">
              {{ scope.row.duration }}分钟
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operation" label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small" 
                :disabled="!canTakeExam(scope.row)"
                @click="startExam(scope.row)"
              >
                开始考试
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 考试进行弹窗 -->
    <el-dialog
      v-model="examDialogVisible"
      :title="currentExam.examName"
      width="90%"
      :destroy-on-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      fullscreen
    >
      <template #header>
        <div class="exam-dialog-header">
          <h3>{{ currentExam.examName }}</h3>
          <div class="exam-timer">
            剩余时间: {{ formatTime(remainingTime) }}
          </div>
        </div>
      </template>
      
      <div class="exam-content" v-loading="examContentLoading">
        <template v-if="!examQuestions.length && !examContentLoading">
          <el-empty description="暂无试题数据"></el-empty>
        </template>
        
        <div v-else class="questions-container">
          <!-- 试题导航 -->
          <div class="question-nav">
            <div class="nav-title">题目导航</div>
            <div class="nav-items">
              <div 
                v-for="(question, index) in examQuestions" 
                :key="index"
                class="question-nav-item"
                :class="{
                  'active': currentQuestionIndex === index,
                  'answered': isQuestionAnswered(index),
                  'single': question.type === 'single',
                  'multiple': question.type === 'multiple',
                  'blank': question.type === 'blank',
                  'objective': question.type === 'objective'
                }"
                @click="navigateToQuestion(index)"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="nav-legend">
              <div class="legend-item">
                <div class="legend-color current"></div>
                <span>当前题目</span>
              </div>
              <div class="legend-item">
                <div class="legend-color answered"></div>
                <span>已答题目</span>
              </div>
              <div class="legend-item">
                <div class="legend-color unanswered"></div>
                <span>未答题目</span>
              </div>
            </div>
          </div>
          
          <!-- 试题内容 -->
          <div class="question-content-wrapper">
            <div class="question-content" v-if="currentQuestion">
              <div class="question-header">
                <div class="question-type">
                  {{ getQuestionTypeText(currentQuestion.type) }}（{{ currentQuestion.score }}分）
                </div>
                <div class="question-number">
                  第 {{ currentQuestionIndex + 1 }}/{{ examQuestions.length }} 题
                </div>
              </div>
              
              <div class="question-title" v-html="currentQuestion.content"></div>
              
              <!-- 单选题 -->
              <div v-if="currentQuestion.type === 'single'" class="question-options">
                <el-radio-group v-model="answers[currentQuestionIndex]">
                  <div 
                    v-for="option in currentQuestion.options" 
                    :key="option.id"
                    class="option-wrapper"
                    :class="{ 'selected': answers[currentQuestionIndex] === option.id }"
                  >
                    <el-radio 
                      :label="option.id"
                      class="custom-radio"
                    >
                      <div class="option-content">
                        <span class="option-label">{{ option.id.split('_')[1] }}</span>
                        <span class="option-text" v-html="option.content"></span>
                      </div>
                    </el-radio>
                  </div>
                </el-radio-group>
              </div>
              
              <!-- 多选题 -->
              <div v-else-if="currentQuestion.type === 'multiple'" class="question-options">
                <el-checkbox-group v-model="answers[currentQuestionIndex]">
                  <div 
                    v-for="option in currentQuestion.options" 
                    :key="option.id"
                    class="option-wrapper"
                    :class="{ 'selected': answers[currentQuestionIndex]?.includes(option.id) }"
                  >
                    <el-checkbox 
                      :label="option.id"
                      class="custom-checkbox"
                    >
                      <div class="option-content">
                        <span class="option-label">{{ option.id.split('_')[1] }}</span>
                        <span class="option-text" v-html="option.content"></span>
                      </div>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              
              <!-- 填空题 -->
              <div v-else-if="currentQuestion.type === 'blank'" class="question-answer">
                <el-input 
                  v-model="answers[currentQuestionIndex]" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请输入答案"
                ></el-input>
              </div>
              
              <!-- 客观题/简答题 -->
              <div v-else-if="currentQuestion.type === 'objective'" class="question-answer">
                <el-input 
                  v-model="answers[currentQuestionIndex]" 
                  type="textarea" 
                  :rows="6" 
                  placeholder="请输入答案"
                ></el-input>
              </div>
              
              <!-- 默认输入框 -->
              <div v-else class="question-answer">
                <el-input 
                  v-model="answers[currentQuestionIndex]" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请输入答案"
                ></el-input>
              </div>
              
              <!-- 导航按钮 -->
              <div class="question-navigation">
                <el-button @click="prevQuestion" :disabled="currentQuestionIndex === 0">
                  <el-icon><ArrowLeft /></el-icon> 上一题
                </el-button>
                <el-button @click="nextQuestion" :disabled="currentQuestionIndex === examQuestions.length - 1">
                  下一题 <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirmSubmitExam" type="danger" size="large">提交考试</el-button>
          <el-button @click="temporaryExit" type="warning" size="large">暂时退出</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 提交确认对话框 -->
    <el-dialog
      v-model="submitConfirmVisible"
      title="确认提交"
      width="30%"
      :append-to-body="true"
    >
      <div class="submit-confirm-content">
        <p>未答题目: {{ getUnansweredCount() }}道</p>
        <p>确定要提交考试吗？提交后将无法修改答案。</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="submitConfirmVisible = false">取消</el-button>
          <el-button type="primary" @click="submitExam">确定提交</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 暂时退出确认对话框 -->
    <el-dialog
      v-model="exitConfirmVisible"
      title="暂时退出考试"
      width="30%"
      :append-to-body="true"
    >
      <div class="exit-confirm-content">
        <el-alert
          title="您的考试进度将被保存"
          type="warning"
          description="您可以稍后继续完成考试，但请注意考试时间限制仍然有效。"
          show-icon
          :closable="false"
          class="mb-20"
        />
        <p>确定要暂时退出考试吗？</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exitConfirmVisible = false">取消</el-button>
          <el-button type="warning" @click="confirmTemporaryExit">确认退出</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useStudentStore } from '../stores/counter';
import { useRouter } from 'vue-router';

// Store和路由
const studentStore = useStudentStore();
const router = useRouter();

// 用户信息
const userInfo = ref({
  id: '',
  name: '',
  collegeId: '',
  major: '',
  avatar: ''
});

// 学院信息
const collegeInfo = ref({
  id: '',
  name: '加载中...'
});
const collegeLoading = ref(false);

// 课程信息
const courseList = ref<any[]>([]);
const courseLoading = ref(false);
const selectedCourseId = ref('');
const selectedCourseName = ref('');

// 考试列表
const examList = ref<any[]>([]);
const examListLoading = ref(false);

// 当前考试
const currentExam = ref<any>({});
const examDialogVisible = ref(false);
const examContentLoading = ref(false);

// 试题相关
const examQuestions = ref<any[]>([]);
const currentQuestionIndex = ref(0);
const currentQuestion = computed(() => examQuestions.value[currentQuestionIndex.value] || null);
const answers = ref<any[]>([]);

// 计时器
const remainingTime = ref(0);
const timerInterval = ref<any>(null);

// 提交确认
const submitConfirmVisible = ref(false);
// 添加暂时退出确认对话框
const exitConfirmVisible = ref(false);

// 根据考试类型获取标签类型
const getExamTypeTag = (type: string) => {
  if (type === '考试') return 'danger';
  if (type === '测试') return 'info';
  
  const typeMap: Record<string, string> = {
    '期中考试': 'warning',
    '期末考试': 'danger',
    '单元测试': 'info',
    '随堂测验': 'success'
  };
  return typeMap[type] || '';
};

// 根据状态获取标签类型
const getStatusTag = (status: string) => {
  const statusMap: Record<string, string> = {
    'NOT_STARTED': 'info',
    'IN_PROGRESS': 'warning',
    'COMPLETED': 'success',
    'EXPIRED': 'danger'
  };
  return statusMap[status] || '';
};

// 根据状态获取文本
const getStatusText = (status: string | number) => {
  // 如果status是数字类型
  if (typeof status === 'number') {
    return status === 0 ? '未开始' : status === 1 ? '已开始' : '未知状态';
  }
  
  // 如果status是字符串数字
  if (status === '0') return '未开始';
  if (status === '1') return '已开始';
  
  // 处理字符串状态
  const statusMap: Record<string, string> = {
    'NOT_STARTED': '未开始',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'EXPIRED': '已过期'
  };
  return statusMap[status] || '未知状态';
};

// 判断是否可以参加考试
const canTakeExam = (exam: any) => {
  // 修改为始终返回true，确保按钮可点击
  return true;
  
  // 原始逻辑：
  // const now = new Date();
  // const startTime = new Date(exam.examDate);
  // const endTime = new Date(startTime.getTime() + exam.duration * 60 * 1000);
  // return now >= startTime && now <= endTime;
};

// 获取试题类型文本
const getQuestionTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'single': '单选题',
    'multiple': '多选题',
    'blank': '填空题',
    'objective': '主观题'
  };
  return typeMap[type] || '未知类型';
};

// 格式化时间
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 判断题目是否已回答
const isQuestionAnswered = (index: number) => {
  const answer = answers.value[index];
  if (answer === undefined || answer === null) return false;
  
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }
  
  return answer !== '';
};

// 获取未回答题目数量
const getUnansweredCount = () => {
  return examQuestions.value.length - answers.value.filter((answer, index) => isQuestionAnswered(index)).length;
};

// 导航到指定题目
const navigateToQuestion = (index: number) => {
  currentQuestionIndex.value = index;
};

// 上一题
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

// 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < examQuestions.value.length - 1) {
    currentQuestionIndex.value++;
  }
};

// 开始考试
const startExam = async (exam: any) => {
  try {
    // 初始化答案数组
    answers.value = [];
    
    // 设置当前考试信息
    currentExam.value = exam;
    
    // 检查是否有未完成的考试
    checkUnfinishedExam(exam);
    
    // 先显示对话框，确保UI立即响应
    examDialogVisible.value = true;
    
    // 设置加载状态
    examContentLoading.value = true;
    
    console.log(`开始考试: ${exam.examId}, 课程ID: ${selectedCourseId.value}`);
    console.log('显示考试对话框状态:', examDialogVisible.value);
    
    // 设置模拟数据
    examQuestions.value = [
      {
        id: '1001',
        type: 'single',
        content: '<p>以下哪个是Vue的核心特性?</p>',
        score: 5,
        options: [
          { id: '1001_A', content: '双向数据绑定' },
          { id: '1001_B', content: '服务器端渲染' },
          { id: '1001_C', content: '静态类型检查' },
          { id: '1001_D', content: '原生移动应用开发' }
        ],
        answer: '',
        student_answer: '',
        student_score: 0,
        analysis: '<p>Vue的核心特性是数据的双向绑定</p>'
      },
      {
        id: '1002',
        type: 'multiple',
        content: '<p>以下哪些是JavaScript框架?</p>',
        score: 5,
        options: [
          { id: '1002_A', content: 'Vue' },
          { id: '1002_B', content: 'React' },
          { id: '1002_C', content: 'Angular' },
          { id: '1002_D', content: 'Python' }
        ],
        answer: '',
        student_answer: '',
        student_score: 0,
        analysis: '<p>Vue、React和Angular都是JavaScript框架，Python是一种编程语言</p>'
      },
      {
        id: '1003',
        type: 'blank',
        content: '<p>请简述Vue的生命周期钩子函数有哪些?</p>',
        score: 10,
        options: [],
        answer: '',
        student_answer: '',
        student_score: 0,
        analysis: '<p>Vue的生命周期钩子函数包括：beforeCreate, created, beforeMount, mounted, beforeUpdate, updated, beforeDestroy, destroyed</p>'
      },
      {
        id: '1004',
        type: 'objective',
        content: '<p>简要说明Vue组件通信的几种方式</p>',
        score: 10,
        options: [],
        answer: '',
        student_answer: '',
        student_score: 0,
        analysis: '<p>Vue组件通信的方式包括：props、$emit、vuex、provide/inject等</p>'
      }
    ];
    
    // 初始化答案数组
    answers.value = Array(examQuestions.value.length).fill(null).map((_, index) => {
      const question = examQuestions.value[index];
      if (question.type === 'multiple') {
        return [];
      }
      return '';
    });
    
    // 重置当前题目索引
    currentQuestionIndex.value = 0;
    
    // 设置剩余时间
    remainingTime.value = exam.duration * 60; // 转换为秒
    
    // 开启计时器
    startTimer();
    
    // 加载完成
    examContentLoading.value = false;
    
    // 尝试获取实际题目数据
    try {
      await fetchExamQuestions(exam.examId);
    } catch (error) {
      console.error('获取题目失败，使用默认模拟数据:', error);
      // 已经设置了默认数据，无需再次设置
    }
  } catch (error) {
    console.error('开始考试失败:', error);
    ElMessage.error('开始考试失败，请重试');
  }
};

// 开启计时器
const startTimer = () => {
  timerInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      // 时间到，自动提交考试
      clearInterval(timerInterval.value);
      ElMessageBox.alert('考试时间已结束，系统将自动提交您的答案', '提示', {
        confirmButtonText: '确定',
        callback: () => {
          submitExam();
        }
      });
    }
  }, 1000);
};

// 确认提交考试
const confirmSubmitExam = () => {
  submitConfirmVisible.value = true;
};

// 提交考试
const submitExam = async () => {
  try {
    console.log('提交考试答案:', answers.value);
    
    // 准备提交数据 - 只更新 student_answer 字段
    const submitData = examQuestions.value.map((question, index) => {
      return {
        ...question,
        student_answer: answers.value[index] || ''
      };
    });
    
    console.log('提交的试卷数据:', submitData);
    
    // 实际提交考试答案到后端 - 使用正确的接口路径
    const apiUrl = 'http://localhost:39999/exam/submit';
    console.log('准备提交考试答案到:', apiUrl);
    console.log('提交的请求数据:', {
      examId: currentExam.value.examId,
      studentId: 2,
      answer: submitData
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        examId: currentExam.value.examId,
        studentId: 2,
        answer: submitData
      })
    });
    
    console.log('接口响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('接口响应错误:', errorText);
      throw new Error(`提交失败: ${response.status}, ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('提交响应详细数据:', responseData);
    
    if (responseData.code === 200) {
      ElMessage.success('考试提交成功');
      ElMessageBox.alert('您的答案已提交，感谢参与考试', '提交成功', {
        confirmButtonText: '确定',
        callback: () => {
          // 清除计时器
          clearInterval(timerInterval.value);
          
          // 关闭对话框
          submitConfirmVisible.value = false;
          examDialogVisible.value = false;
          
          // 重新加载考试列表
          fetchExamList(selectedCourseId.value);
        }
      });
    } else {
      throw new Error(responseData.msg || '提交失败');
    }
  } catch (error: any) {
    console.error('提交考试失败:', error);
    ElMessage.error(`提交考试失败: ${error.message}`);
    
    // 如果是网络错误或后端未就绪，仍然关闭对话框
    ElMessageBox.confirm('提交遇到问题，是否仍要退出考试？', '提示', {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning'
    }).then(() => {
      // 清除计时器
      clearInterval(timerInterval.value);
      
      // 关闭对话框
      submitConfirmVisible.value = false;
      examDialogVisible.value = false;
    }).catch(() => {
      // 用户选择继续考试
      submitConfirmVisible.value = false;
    });
  }
};

// 获取考试题目
const fetchExamQuestions = async (examId: string) => {
  try {
    console.log(`获取考试题目，考试ID: ${examId}`);
    
    // 从已加载的考试列表中查找考试及其题目
    const currentExamData = examList.value.find(exam => exam.examId.toString() === examId.toString());
    
    if (currentExamData && currentExamData.questions && currentExamData.questions.length > 0) {
      console.log('从已加载的数据中获取题目:', currentExamData.questions);
      examQuestions.value = currentExamData.questions;
    } else {
      // 如果没有找到或者题目为空，尝试从API获取
      const response = await fetch(`http://localhost:39999/exam/questions/${examId}`);
      
      if (!response.ok) {
        throw new Error(`获取考试题目失败: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('考试题目API返回:', responseData);
      
      if (responseData.code === 200 && responseData.data) {
        examQuestions.value = responseData.data;
      } else {
        throw new Error('API返回的数据格式不正确');
      }
    }
    
    // 初始化答案数组
    answers.value = Array(examQuestions.value.length).fill(null).map((_, index) => {
      const question = examQuestions.value[index];
      if (question.type === 'multiple') {
        return [];
      }
      return '';
    });
    
    // 重置当前题目索引
    currentQuestionIndex.value = 0;
    
    console.log('试题数量:', examQuestions.value.length);
    console.log('初始化答案数组:', answers.value);
  } catch (error) {
    console.error('获取考试题目失败:', error);
    ElMessage.error('获取考试题目失败，使用模拟数据');
    
    // 使用模拟数据
    examQuestions.value = [
      {
        "score": 5,
        "answer": "",
        "options": [
          {"id": "1744816521132_A", "content": "选项A内容"},
          {"id": "1744816521132_B", "content": "选项B内容"},
          {"id": "1744816521132_C", "content": "选项C内容"},
          {"id": "1744816521132_D", "content": "选项D内容"}
        ],
        "student_answer": "",
        "student_score": 0,
        "id": 1744816521132,
        "type": "objective",
        "analysis": "<p>这是试题分析</p>",
        "content": "<p><strong>这是一道主观题，请作答</strong></p>"
      },
      {
        "score": 5,
        "answer": "1744816521290_C",
        "options": [
          {"id": "1744816521290_A", "content": "<p>选项A内容</p>"},
          {"id": "1744816521290_B", "content": "<p>选项B内容</p>"},
          {"id": "1744816521290_C", "content": "<p>选项C内容</p>"},
          {"id": "1744816521290_D", "content": "<p>选项D内容</p>"}
        ],
        "student_answer": "",
        "student_score": 0,
        "id": 1744816521290,
        "type": "single",
        "analysis": "<p>这是单选题分析</p>",
        "content": "<p>这是一道单选题</p>"
      },
      {
        "score": 5,
        "answer": "写出你的答案",
        "options": [
          {"id": "1745399260928_A", "content": ""},
          {"id": "1745399260928_B", "content": ""},
          {"id": "1745399260928_C", "content": ""},
          {"id": "1745399260928_D", "content": ""}
        ],
        "student_answer": "",
        "student_score": 0,
        "id": 1745399260928,
        "type": "blank",
        "analysis": "<p>这是填空题分析</p>",
        "content": "<p>这是一道填空题，请作答</p>"
      }
    ];
    
    // 初始化答案数组
    answers.value = Array(examQuestions.value.length).fill(null).map((_, index) => {
      const question = examQuestions.value[index];
      if (question.type === 'multiple') {
        return [];
      }
      return '';
    });
    
    // 重置当前题目索引
    currentQuestionIndex.value = 0;
  }
};

// 清理计时器
onBeforeUnmount(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});

// 处理课程变化
const handleCourseChange = async (courseId: string) => {
  if (!courseId) {
    selectedCourseName.value = '';
    examList.value = [];
    return;
  }
  
  // 查找选中的课程名称
  const selectedCourse = courseList.value.find(course => course.id === courseId);
  if (selectedCourse) {
    selectedCourseName.value = selectedCourse.name;
  }
  
  // 获取课程考试列表
  await fetchExamList(courseId);
};

// 获取课程考试列表
const fetchExamList = async (courseId: string) => {
  examListLoading.value = true;
  examList.value = [];
  
  try {
    console.log(`获取课程考试列表，课程ID: ${courseId}`);
    
    // 更新为正确的接口格式
    const response = await fetch(`http://localhost:39999/exam/all/1/${courseId}`);
    if (!response.ok) {
      throw new Error(`获取课程考试列表失败: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('课程考试列表API返回:', responseData);
    
    // 处理后端返回的数据
    if (responseData.code === 200 && responseData.data) {
      examList.value = responseData.data.map((exam: any) => ({
        examId: exam.id,
        examName: exam.examName || exam.name,
        examType: exam.examClass === 1 ? '考试' : '测试',
        startTime: exam.examDate || exam.startTime,
        endTime: exam.examDate, // 暂时使用相同日期
        duration: exam.duration || 60,
        status: exam.status || 'NOT_STARTED',
        totalScore: exam.totalScore || 100,
        questions: exam.questions ? JSON.parse(exam.questions) : []
      }));
    } else {
      // 如果接口未返回数据，使用模拟数据
      examList.value = [
        {
          examId: '101',
          examName: '期中考试',
          examType: '考试',
          startTime: '2025-10-20 14:00',
          endTime: '2025-10-20 16:00',
          duration: 120,
          status: 'NOT_STARTED',
          totalScore: 100,
          questions: []
        },
        {
          examId: '102',
          examName: '第一次单元测试',
          examType: '测试',
          startTime: '2025-10-25 10:00',
          endTime: '2025-10-25 11:00',
          duration: 60,
          status: 'NOT_STARTED',
          totalScore: 50,
          questions: []
        }
      ];
    }
    
    console.log('可参加的考试列表:', examList.value);
  } catch (error) {
    console.error('获取课程考试列表失败:', error);
    ElMessage.error('获取课程考试列表失败，使用模拟数据');
    
    // 使用模拟数据
    examList.value = [
      {
        examId: '101',
        examName: '期中考试',
        examType: '考试',
        startTime: '2025-10-20 14:00',
        endTime: '2025-10-20 16:00',
        duration: 120,
        status: 'NOT_STARTED',
        totalScore: 100,
        questions: []
      },
      {
        examId: '102',
        examName: '第一次单元测试',
        examType: '测试',
        startTime: '2025-10-25 10:00',
        endTime: '2025-10-25 11:00',
        duration: 60,
        status: 'NOT_STARTED',
        totalScore: 50,
        questions: []
      }
    ];
  } finally {
    examListLoading.value = false;
  }
};

// 获取学院信息
const fetchCollegeInfo = async (collegeId: string | number) => {
  collegeLoading.value = true;
  try {
    console.log(`开始获取学院信息，学院ID: ${collegeId}`);
    
    // 使用正确的接口URL
    const response = await fetch(`http://localhost:39999/college/${collegeId}`);
    if (!response.ok) {
      throw new Error(`获取学院信息失败: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('学院信息API返回:', responseData);
    
    // 检查返回的数据结构
    if (responseData.code === 200 && responseData.data) {
      // 后端返回了标准响应结构
      collegeInfo.value = {
        id: responseData.data.collegeId || collegeId.toString(),
        name: responseData.data.collegeName || '未知学院'
      };
    } else {
      // 直接使用返回的数据
      collegeInfo.value = {
        id: responseData.collegeId || collegeId.toString(),
        name: responseData.collegeName || '未知学院'
      };
    }
    
    console.log('设置的学院信息:', collegeInfo.value);
  } catch (error) {
    console.error('获取学院信息失败:', error);
    ElMessage.error('获取学院信息失败');
    
    // 尝试从localStorage获取学院名称
    const collegeName = localStorage.getItem('collegeName');
    collegeInfo.value = {
      id: collegeId.toString(),
      name: collegeName || '未知学院'
    };
  } finally {
    collegeLoading.value = false;
  }
};

// 获取学院课程列表
const fetchCollegeCourses = async (collegeId: string | number) => {
  courseLoading.value = true;
  try {
    console.log(`开始获取学院课程，学院ID: ${collegeId}`);
    
    // 使用正确的接口URL
    const response = await fetch(`http://localhost:39999/lesson/byCollegeId/${collegeId}`);
    if (!response.ok) {
      throw new Error(`获取学院课程失败: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('学院课程API返回:', responseData);
    
    // 检查返回的数据结构
    if (responseData.code === 200 && responseData.data) {
      // 标准响应结构
      courseList.value = responseData.data.map((course: any) => ({
        id: course.lessonId || course.courseId || course.id,
        name: course.lessonName || course.courseName || course.name,
        credit: course.credit,
        teacherName: course.teacherName || course.teacher
      }));
    } else if (Array.isArray(responseData)) {
      // 直接返回数组
      courseList.value = responseData.map((course: any) => ({
        id: course.lessonId || course.courseId || course.id,
        name: course.lessonName || course.courseName || course.name,
        credit: course.credit,
        teacherName: course.teacherName || course.teacher
      }));
    } else {
      courseList.value = [];
      console.warn('未获取到课程数据或数据格式不正确');
    }
    
    console.log('获取到的课程列表:', courseList.value);
  } catch (error) {
    console.error('获取学院课程失败:', error);
    ElMessage.error('获取学院课程失败');
    courseList.value = [];
  } finally {
    courseLoading.value = false;
  }
};

// 生命周期钩子
onMounted(async () => {
  // 从store和localStorage获取用户信息
  const storeUserInfo = studentStore.userInfo;
  console.log('从store获取的用户信息:', storeUserInfo);
  
  // 从localStorage获取备用信息
  const localStorageInfo = {
    id: localStorage.getItem('id'), // 注意：这里存储的可能是用户名而非真正的ID
    name: localStorage.getItem('name'),
    collegeId: localStorage.getItem('collegeId'),
    avatar: localStorage.getItem('avatar'),
    studentId: localStorage.getItem('studentId') // 尝试获取专门存储的学生ID
  };
  console.log('从localStorage获取的信息:', localStorageInfo);
  
  // 提取用户ID - 尝试使用正确的数据源获取学生ID
  // 登录时应该将真正的学生ID存入localStorage的'studentId'字段
  const actualStudentId = localStorageInfo.studentId || localStorageInfo.id || '';
  
  // 合并store和localStorage的数据，优先使用store中的数据
  userInfo.value = {
    id: actualStudentId, // 使用真正的学生ID
    name: storeUserInfo.name || localStorageInfo.name || '用户',
    collegeId: storeUserInfo.collegeId || localStorageInfo.collegeId || '',
    major: '',
    avatar: storeUserInfo.avatar || localStorageInfo.avatar || ''
  };
  
  // 在控制台确认用户ID
  console.log('合并后的用户信息:', userInfo.value);
  console.log('用于提交考试的学生ID:', userInfo.value.id);
  
  // 测试获取考试学生列表接口
  testFetchExamStudents();
  
  // 如果有学院ID，则获取学院信息和课程
  if (userInfo.value.collegeId) {
    await fetchCollegeInfo(userInfo.value.collegeId);
    await fetchCollegeCourses(userInfo.value.collegeId);
  } else {
    console.warn('未获取到学院ID，无法加载学院和课程信息');
    ElMessage.warning('未获取到学院信息');
  }
});

// 测试获取考试学生列表接口
const testFetchExamStudents = async () => {
  try {
    // 测试不同的接口路径格式
    const examId = 8; // 使用测试的考试ID
    const urls = [
      `http://localhost:39999/exam/students/${examId}`,
      `http://localhost:39999/api/exam/students/${examId}`,
      `http://localhost:39999/exam/all/students/${examId}`,
      `http://localhost:39999/exam/student/list/${examId}`
    ];
    
    console.log('===== 测试获取考试学生列表接口 =====');
    
    for (const url of urls) {
      try {
        console.log(`尝试请求: ${url}`);
        const response = await fetch(url);
        console.log(`${url} 响应状态:`, response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`${url} 响应数据:`, data);
          console.log(`✅ 成功: ${url}`);
        } else {
          const text = await response.text();
          console.warn(`❌ 失败: ${url}, 原因:`, text);
        }
      } catch (error) {
        console.error(`❌ 错误: ${url}`, error);
      }
    }
    
    console.log('===== 测试结束 =====');
  } catch (error) {
    console.error('测试接口时出现错误:', error);
  }
};

// 暂时退出考试
const temporaryExit = () => {
  exitConfirmVisible.value = true;
};

// 确认暂时退出并保存记录
const confirmTemporaryExit = async () => {
  try {
    // 准备保存的数据
    const examData = {
      examId: currentExam.value.examId,
      studentId: userInfo.value.id,
      answers: answers.value,
      remainingTime: remainingTime.value,
      timestamp: new Date().toISOString()
    };
    
    // 保存到localStorage
    localStorage.setItem(`exam_temp_${currentExam.value.examId}`, JSON.stringify(examData));
    
    // 尝试保存到后端
    try {
      console.log('尝试保存考试状态到后端:', examData);
      await fetch(`http://localhost:39999/exam/temp/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(examData)
      });
    } catch (err) {
      console.warn('保存到后端失败，已保存到本地:', err);
    }
    
    // 清除计时器
    clearInterval(timerInterval.value);
    
    // 关闭对话框
    exitConfirmVisible.value = false;
    examDialogVisible.value = false;
    
    ElMessage.success('已保存考试进度');
  } catch (error) {
    console.error('保存考试状态失败:', error);
    ElMessage.error('保存考试状态失败');
  }
};

// 在开始考试时，检查是否有未完成的考试
const checkUnfinishedExam = (exam: any) => {
  try {
    // 从localStorage获取临时保存的考试数据
    const savedExamData = localStorage.getItem(`exam_temp_${exam.examId}`);
    
    if (savedExamData) {
      const examData = JSON.parse(savedExamData);
      
      // 确认是否为当前用户的数据
      if (examData.studentId === userInfo.value.id) {
        ElMessageBox.confirm(
          '检测到您有未完成的考试记录，是否继续上次的考试？',
          '恢复考试',
          {
            confirmButtonText: '继续上次考试',
            cancelButtonText: '重新开始',
            type: 'warning',
          }
        ).then(() => {
          // 恢复上次考试状态
          answers.value = examData.answers || Array(examQuestions.value.length).fill('');
          remainingTime.value = examData.remainingTime || exam.duration * 60;
          ElMessage.success('已恢复上次考试状态');
        }).catch(() => {
          // 清除之前的记录，重新开始
          localStorage.removeItem(`exam_temp_${exam.examId}`);
          ElMessage.info('将重新开始考试');
        });
      }
    }
  } catch (error) {
    console.error('检查未完成考试失败:', error);
  }
};
</script>

<style scoped>
.take-exam-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef4ff 100%);
  min-height: 100vh;
  position: relative;
}

.take-exam-container::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  border-radius: 50%;
  filter: blur(50px);
  z-index: 0;
  animation: float 15s ease-in-out infinite;
}

.take-exam-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(245, 108, 108, 0.1));
  border-radius: 50%;
  filter: blur(40px);
  z-index: 0;
  animation: float 18s ease-in-out infinite reverse;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 20px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}

.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 30px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  text-align: center;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.page-header:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(31, 38, 135, 0.15);
}

.page-header h1 {
  font-size: 32px;
  color: #1a3a8f;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #1a3a8f, #409EFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  color: #606266;
  font-size: 16px;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.info-card, .selection-card, .exam-list-card {
  position: relative;
  z-index: 1;
  margin-bottom: 25px;
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.info-card:hover, .selection-card:hover, .exam-list-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.info-title {
  font-size: 22px;
  color: #1a3a8f;
  margin-bottom: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 15px;
}

.info-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background: linear-gradient(to bottom, #409EFF, #67C23A);
  border-radius: 3px;
}

.info-content {
  display: flex;
  align-items: center;
  background-color: #f5f9ff;
  padding: 15px 20px;
  border-radius: 12px;
  border-left: 4px solid #409EFF;
}

.label {
  font-size: 16px;
  color: #606266;
  margin-right: 10px;
  font-weight: 500;
}

.value {
  font-size: 18px;
  font-weight: 600;
  color: #1a3a8f;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.college-info, .course-selection {
  padding: 20px 25px;
}

.course-select {
  max-width: 500px;
}

.course-select :deep(.el-select) {
  width: 100%;
}

.course-select :deep(.el-input__wrapper) {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 12px 15px;
  transition: all 0.3s ease;
}

.course-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.course-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF, 0 5px 15px rgba(64, 158, 255, 0.2);
}

.card-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.exam-list-card :deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.exam-list-card :deep(.el-table__header-wrapper th) {
  background-color: #1a3a8f;
  color: white;
}

.exam-list-card :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.exam-list-card :deep(.el-table__row:hover) {
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.exam-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 25px;
  background: linear-gradient(135deg, #1a3a8f, #409EFF);
  border-radius: 12px 12px 0 0;
}

.exam-dialog-header h3 {
  font-size: 24px;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.exam-timer {
  font-size: 22px;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

.exam-content {
  padding: 30px;
  height: calc(100vh - 200px);
  overflow-y: auto;
  background-color: #f5f7fa;
}

.questions-container {
  display: flex;
  height: 100%;
  gap: 30px;
}

.question-nav {
  width: 220px;
  background: linear-gradient(135deg, #ffffff, #f9fafc);
  border-radius: 16px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.question-nav:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.nav-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a3a8f;
  text-align: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px dashed #d0e1fd;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  justify-content: center;
}

.question-nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  background-color: #f0f2f5;
  color: #606266;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.question-nav-item:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.question-nav-item.active {
  background: linear-gradient(135deg, #409EFF, #4c6fff);
  color: white;
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.4);
  transform: translateY(-3px) scale(1.1);
  border: 2px solid white;
  z-index: 1;
}

.question-nav-item.answered {
  background: linear-gradient(135deg, #67C23A, #50a517);
  color: white;
  box-shadow: 0 8px 20px rgba(103, 194, 58, 0.4);
}

.question-nav-item.single::after,
.question-nav-item.multiple::after,
.question-nav-item.blank::after,
.question-nav-item.objective::after {
  content: "";
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
}

.question-nav-item.single::after {
  background: linear-gradient(135deg, #409EFF, #4c6fff);
}

.question-nav-item.multiple::after {
  background: linear-gradient(135deg, #E6A23C, #f5a31a);
}

.question-nav-item.blank::after {
  background: linear-gradient(135deg, #F56C6C, #ff4757);
}

.question-nav-item.objective::after {
  background: linear-gradient(135deg, #909399, #606266);
}

.nav-legend {
  margin-top: 25px;
  border-top: 2px dashed #d0e1fd;
  padding-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.legend-color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
}

.legend-color.current {
  background: linear-gradient(135deg, #409EFF, #4c6fff);
}

.legend-color.answered {
  background: linear-gradient(135deg, #67C23A, #50a517);
}

.legend-color.unanswered {
  background: linear-gradient(135deg, #f0f2f5, #dcdfe6);
}

.question-content-wrapper {
  flex: 1;
  max-width: calc(100% - 250px);
}

.question-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.question-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, #409EFF, #67C23A);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.question-type {
  color: #409EFF;
  font-size: 18px;
  font-weight: bold;
  position: relative;
  padding-left: 15px;
}

.question-type::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background: linear-gradient(to bottom, #409EFF, #67C23A);
  border-radius: 3px;
}

.question-number {
  color: #606266;
  font-size: 16px;
  padding: 8px 15px;
  background-color: #f0f7ff;
  border-radius: 30px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.question-title {
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 30px;
  color: #303133;
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 12px;
  border-left: 4px solid #409EFF;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.question-options {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-wrapper {
  margin-bottom: 15px;
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background-color: #f9f9f9;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  width: 100%;
  border: 1px solid #ebeef5;
}

.option-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.option-wrapper.selected {
  background: linear-gradient(135deg, #ecf5ff, #e6f2ff);
  border-left: 6px solid #409EFF;
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 10px 30px rgba(64, 158, 255, 0.15);
}

.option-content {
  display: flex;
  align-items: flex-start;
  padding: 25px 30px;
}

.option-label {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  height: 45px;
  line-height: 1;
  background-color: #fff;
  color: #409EFF;
  border-radius: 50%;
  margin-right: 25px;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid #e6f1ff;
  transition: all 0.3s ease;
}

.selected .option-label {
  background: linear-gradient(135deg, #409EFF, #4c6fff);
  color: white;
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.4);
  transform: scale(1.1);
}

.custom-radio, .custom-checkbox {
  margin: 0;
  width: 100%;
  padding: 0;
  height: 100%;
}

.custom-radio .el-radio__input, .custom-checkbox .el-checkbox__input {
  margin-left: 20px;
}

.option-text {
  flex: 1;
  font-size: 16px;
  line-height: 1.8;
  padding: 8px 20px 8px 0;
}

.question-answer {
  margin-bottom: 30px;
}

.question-answer :deep(.el-textarea__inner) {
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
}

.question-answer :deep(.el-textarea__inner:focus) {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08), 0 0 0 2px rgba(64, 158, 255, 0.2);
  border-color: #409EFF;
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.question-navigation .el-button {
  padding: 12px 30px;
  border-radius: 30px;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.question-navigation .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.submit-confirm-content {
  text-align: center;
  margin: 30px 0;
  padding: 20px;
  background-color: #fff8f8;
  border-radius: 12px;
  border-left: 4px solid #F56C6C;
}

.dialog-footer {
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fb, #f0f2f5);
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.dialog-footer .el-button {
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dialog-footer .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .questions-container {
    flex-direction: column;
  }
  
  .question-nav {
    width: 100%;
    position: relative;
    top: 0;
    margin-bottom: 20px;
  }
  
  .question-content-wrapper {
    max-width: 100%;
  }
}
</style> 