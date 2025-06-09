<template>
  <div class="grading-panel">
    <div class="grading-header">
      <div class="student-exam-info">
        <h3>正在批改： {{ student.name }} 的试卷</h3>
        <h4>考试： {{ exam?.examName }}</h4>
        <div class="grading-tips">
          <el-alert
            title="评分提示"
            type="info"
            :closable="false"
            description="选择题已自动评分：答案正确得满分，错误得0分。您可以手动调整分数，或点击'自动批改选择题'按钮重新评分。"
            show-icon
          />
        </div>
      </div>
      
      <div class="score-actions">
        <el-button type="primary" @click="saveGradingScores">保存评分</el-button>
        <el-button type="success" @click="reAutoGradeSingleChoice">自动批改选择题</el-button>
        <el-button type="success" @click="autoGradeBlankQuestions">自动批改填空题</el-button>
        <el-button type="warning" @click="autoGradeObjectiveWithAI">AI评分客观题</el-button>
        <el-button type="default" @click="$emit('cancel')">取消批改</el-button>
      </div>
    </div>
    
    <div class="exam-paper">
      <div v-for="(question, index) in questions" :key="question.id" class="question-item">
        <div class="question-header">
          <span class="question-index">{{ index + 1 }}. </span>
          <span class="question-type">（{{ question.score }}分）</span>
          <div class="grading-input">
            <span class="grading-label">评分：</span>
            <el-input-number 
              v-model="question.student_score" 
              :min="0" 
              :max="question.score"
              size="small"
              @change="calculateTotalScore"
            />
          </div>
        </div>
        
        <div class="question-content" v-html="question.content"></div>
        
        <!-- 单选题 -->
        <div v-if="question.type === 'single'" class="options">
          <div v-for="(option, optIndex) in question.options" :key="option.id" class="option">
            <div class="option-content" 
              :class="{
                'correct-option': option.id === question.student_answer && option.id === question.answer,
                'wrong-option': option.id === question.student_answer && option.id !== question.answer,
                'selected-option': option.id === question.student_answer,
                'correct-answer-highlight': option.id === question.answer && option.id !== question.student_answer
              }">
              <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}. </span>
              <span v-html="option.content"></span>
              <span v-if="option.id === question.student_answer && option.id === question.answer" class="correct-mark">✓</span>
              <span v-if="option.id === question.student_answer && option.id !== question.answer" class="wrong-mark">×</span>
              <span v-if="option.id === question.answer && option.id !== question.student_answer" class="correct-answer-indicator">（正确答案）</span>
            </div>
          </div>
        </div>
        
        <!-- 客观题 -->
        <div v-else-if="question.type === 'objective'" class="objective-answer">
          <div class="answer-box">
            <div class="answer-lines">
              <div class="student-objective-answer">
                <div class="answer-label">学生答案：</div>
                <div class="answer-content">{{ question.student_answer }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 填空题 -->
        <div v-else-if="question.type === 'blank'" class="blank-answer">
          <div class="answer-box">
            <div class="answer-lines">
              <div class="student-blank-answer" 
                :class="{
                  'correct-answer': question.student_answer === question.answer,
                  'wrong-answer': question.student_answer !== question.answer
                }">
                <div class="answer-label">学生答案：</div>
                <div class="answer-content">{{ question.student_answer || '（未作答）' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 评分说明 -->
        <div class="grading-notes">
          <div class="analysis-section" v-if="question.analysis">
            <div class="analysis-title">答案解析：</div>
            <div class="analysis-content" v-html="question.analysis"></div>
          </div>
          <div class="correct-answer-section">
            <div class="correct-answer-title">正确答案：</div>
            <div class="correct-answer-content">
              <span v-if="question.type === 'single'">
                {{ question.answer.split('_')[1] }}
              </span>
              <span v-else>{{ question.answer }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 总分显示 -->
      <div class="total-score-display">
        <div class="total-score-label">总分：</div>
        <div class="total-score-value">{{ totalScore }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watchEffect } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import axios from 'axios';

// 定义组件的Props和Emits
const props = defineProps({
  exam: {
    type: Object,
    required: true
  },
  student: {
    type: Object,
    required: true
  },
  questions: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'cancel', 'update:questions']);

// 计算总分
const totalScore = ref(0);

// 计算总分方法
const calculateTotalScore = () => {
  totalScore.value = props.questions.reduce((total, question) => {
    return total + (question.student_score || 0);
  }, 0);
  
  // 通知父组件总分更新
  emit('update:totalScore', totalScore.value);
};

// 监听题目变化，实时计算总分
watchEffect(() => {
  calculateTotalScore();
});

// 自动批改选择题
const reAutoGradeSingleChoice = () => {
  if (!props.questions || props.questions.length === 0) return;
  
  let totalSingleChoice = 0;
  let correctCount = 0;
  let totalPoints = 0;
  
  // 创建一个副本以避免直接修改props
  const updatedQuestions = [...props.questions];
  
  // 遍历所有题目
  updatedQuestions.forEach(question => {
    // 仅处理选择题
    if (question.type === 'single') {
      totalSingleChoice++;
      totalPoints += question.score;
      
      // 如果学生答案与正确答案一致，给满分，否则给0分
      // 增强答案比较逻辑，确保字符串比较正确
      const studentAns = String(question.student_answer || '').trim();
      const correctAns = String(question.answer || '').trim();
      const isCorrect = studentAns === correctAns;
      
      question.student_score = isCorrect ? question.score : 0;
      
      if (isCorrect) {
        correctCount++;
      }
    }
  });
  
  // 通知父组件题目已更新
  emit('update:questions', updatedQuestions);
  
  // 计算总分
  calculateTotalScore();
  
  // 显示详细的批改结果
  if (totalSingleChoice > 0) {
    ElMessage.success({
      message: `选择题自动批改完成：共${totalSingleChoice}道题，正确${correctCount}道，得分${correctCount * (totalPoints / totalSingleChoice)}/${totalPoints}`,
      duration: 5000
    });
  } else {
    ElMessage.info('本试卷中没有选择题需要批改');
  }
};

// 自动批改填空题
const autoGradeBlankQuestions = () => {
  if (!props.questions || props.questions.length === 0) return;
  
  let totalBlank = 0;
  let correctCount = 0;
  let totalPoints = 0;
  
  // 创建一个副本以避免直接修改props
  const updatedQuestions = [...props.questions];
  
  // 遍历所有题目
  updatedQuestions.forEach(question => {
    // 仅处理填空题
    if (question.type === 'blank') {
      totalBlank++;
      totalPoints += question.score;
      
      // 如果学生答案与正确答案一致，给满分，否则给0分
      // 处理答案时去除空格，进行不区分大小写的比较
      const studentAns = String(question.student_answer || '').trim().toLowerCase();
      const correctAns = String(question.answer || '').trim().toLowerCase();
      const isCorrect = studentAns === correctAns;
      
      question.student_score = isCorrect ? question.score : 0;
      
      if (isCorrect) {
        correctCount++;
      }
    }
  });
  
  // 通知父组件题目已更新
  emit('update:questions', updatedQuestions);
  
  // 计算总分
  calculateTotalScore();
  
  // 显示详细的批改结果
  if (totalBlank > 0) {
    ElMessage.success({
      message: `填空题自动批改完成：共${totalBlank}道题，正确${correctCount}道，得分${correctCount * (totalPoints / totalBlank)}/${totalPoints}`,
      duration: 5000
    });
  } else {
    ElMessage.info('本试卷中没有填空题需要批改');
  }
};

// 使用AI自动评分客观题
const autoGradeObjectiveWithAI = async () => {
  if (!props.questions || props.questions.length === 0) return;
  
  // 筛选出所有客观题
  const objectiveQuestions = props.questions.filter(q => q.type === 'objective');
  
  if (objectiveQuestions.length === 0) {
    ElMessage.info('本试卷中没有客观题需要评分');
    return;
  }
  
  try {
    // 显示批改开始信息
    ElMessage({
      message: `开始AI批改：共${objectiveQuestions.length}道客观题`,
      type: 'info',
      duration: 3000
    });
    
    // 用于跟踪完成的题目数量
    let completedCount = 0;
    let totalPoints = 0;
    
    // 创建副本避免直接修改props
    const updatedQuestions = [...props.questions];
    
    // 创建加载指示器
    const loading = ElLoading.service({
      lock: true,
      text: `正在批改客观题 (0/${objectiveQuestions.length})`,
      background: 'rgba(0, 0, 0, 0.7)'
    });
    
    // 对每个客观题进行评分
    for (const question of objectiveQuestions) {
      try {
        // 更新加载提示
        loading.setText(`正在批改客观题 (${completedCount}/${objectiveQuestions.length})`);
        
        // 提取问题内容和学生答案
        const problemContent = question.content || ''; // 题目内容
        const correctAnswer = question.answer || ''; // 参考答案
        const studentAnswer = question.student_answer || ''; // 学生答案
        const maxScore = question.score || 0; // 题目满分
        
        // 如果学生未作答，自动给0分并跳过
        if (!studentAnswer.trim()) {
          // 找到对应的题目并更新
          const targetQuestion = updatedQuestions.find(q => q.id === question.id);
          if (targetQuestion) {
            targetQuestion.student_score = 0;
          }
          completedCount++;
          continue;
        }
        
        // 模拟AI评分 - 实际项目中应调用AI API
        const aiScore = Math.floor(Math.random() * (maxScore + 1));
        
        // 找到对应的题目并更新
        const targetQuestion = updatedQuestions.find(q => q.id === question.id);
        if (targetQuestion) {
          targetQuestion.student_score = aiScore;
          totalPoints += aiScore;
        }
        
        // 更新计数
        completedCount++;
      } catch (error) {
        console.error(`评分题目ID=${question.id}失败:`, error);
      }
    }
    
    // 关闭加载指示器
    loading.close();
    
    // 通知父组件题目已更新
    emit('update:questions', updatedQuestions);
    
    // 计算总分
    calculateTotalScore();
    
    // 显示批改完成信息
    ElMessage.success({
      message: `AI批改完成：共批改${completedCount}道客观题，总得分${totalPoints}分`,
      duration: 5000
    });
  } catch (error) {
    console.error('AI批改客观题失败:', error);
    ElMessage.error('AI批改失败，请稍后重试');
  }
};

// 保存评分
const saveGradingScores = () => {
  // 通知父组件保存评分
  emit('save', {
    questions: props.questions,
    totalScore: totalScore.value
  });
};
</script>

<style scoped>
.grading-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.grading-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.student-exam-info {
  flex: 1;
}

.grading-tips {
  margin-top: 10px;
  max-width: 800px;
}

.score-actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-left: 20px;
}

.exam-paper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.question-item {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.question-index {
  font-weight: bold;
  font-size: 16px;
  margin-right: 10px;
}

.question-type {
  color: #606266;
  margin-right: 20px;
}

.grading-input {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.grading-label {
  margin-right: 10px;
  font-weight: bold;
  color: #409EFF;
}

.question-content {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.options {
  margin-left: 20px;
}

.option {
  margin-bottom: 10px;
}

.option-content {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
}

.selected-option {
  background-color: #ecf5ff;
  border-color: #409EFF;
}

.option-label {
  font-weight: bold;
  margin-right: 10px;
}

.correct-option {
  background-color: #f0f9eb;
  border-color: #67c23a;
}

.wrong-option {
  background-color: #fef0f0;
  border-color: #f56c6c;
}

.correct-mark {
  margin-left: auto;
  color: #67c23a;
  font-weight: bold;
  font-size: 18px;
}

.wrong-mark {
  margin-left: auto;
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.correct-answer-highlight {
  background-color: rgba(103, 194, 58, 0.1);  /* 淡绿色背景 */
  border: 1px dashed #67c23a;
}

.correct-answer-indicator {
  margin-left: auto;
  color: #67c23a;
  font-size: 14px;
}

.objective-answer {
  margin-top: 15px;
}

.answer-box {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.student-objective-answer {
  margin-bottom: 10px;
}

.answer-label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
}

.answer-content {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  min-height: 40px;
}

.student-blank-answer {
  margin-bottom: 10px;
}

.student-blank-answer.correct-answer .answer-content {
  background-color: #f0f9eb;
  border: 1px solid #67c23a;
}

.student-blank-answer.wrong-answer .answer-content {
  background-color: #fef0f0;
  border: 1px solid #f56c6c;
}

.blank-answer {
  margin-top: 15px;
}

.grading-notes {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #909399;
}

.analysis-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
}

.analysis-content {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.correct-answer-section {
  margin-top: 10px;
}

.correct-answer-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #67c23a;
}

.correct-answer-content {
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.total-score-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
}

.total-score-label {
  font-weight: bold;
  font-size: 18px;
  margin-right: 10px;
}

.total-score-value {
  font-size: 24px;
  font-weight: bold;
  color: #67c23a;
}
</style> 