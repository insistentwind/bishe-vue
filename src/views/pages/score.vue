<template>
  <div class="score-container" v-loading="loading">
    <el-card class="main-card" shadow="hover">
      <!-- 顶部筛选区域 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="college-info">
              <span class="label">当前学院：</span>
              <el-tag type="info" effect="plain" size="large">
                {{ getCollegeName(userCollegeId) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="selectedLessonId"
              placeholder="选择课程"
              clearable
              @change="handleLessonChange"
              class="filter-select"
            >
              <el-option
                v-for="option in courseOptions"
                :key="option.lessonId"
                :label="option.lessonName"
                :value="option.lessonId"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-radio-group v-model="examClass" size="large" @change="handleExamTypeChange">
              <el-radio-button label="0">测试</el-radio-button>
              <el-radio-button label="1">考试</el-radio-button>
            </el-radio-group>
          </el-col>
        </el-row>
      </div>

      <!-- 标签页区域 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="考试列表" name="exams">
          <!-- 考试列表表格 -->
          <el-table
            :data="tableData"
            border
            stripe
            :header-cell-style="{background:'#f5f7fa', color:'#303133', fontWeight: 'bold'}"
            class="data-table"
            v-loading="tableLoading"
          >
            <el-table-column label="课程编号" prop="lessonId" width="120"/>
            <el-table-column label="考试名称" prop="examName"/>
            <el-table-column label="答题卡模版" width="120">
              <template #default="scope">
                <el-tag v-if="scope.row && scope.row.paperClassId && scope.row.paperClassId !== ''" type="success" effect="plain">
                  {{ scope.row.modelName || '未命名模版' }}
                </el-tag>
                <el-tag v-else type="danger" effect="plain">暂无</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="考试日期" width="120">
              <template #default="scope">
                {{ scope.row && scope.row.examDate ? scope.row.examDate : '未设置' }}
              </template>
            </el-table-column>
            <el-table-column label="考试状态" width="120">
              <template #default="scope">
                <el-tag v-if="scope.row && scope.row.status === 1" type="warning" effect="dark">进行中</el-tag>
                <el-tag v-else-if="scope.row && scope.row.isDelete === 1" type="success" effect="dark">已完成</el-tag>
                <el-tag v-else type="info" effect="dark">未开始</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button
                    v-if="scope.row && scope.row.isDelete !== 1"
                    size="small"
                    type="primary"
                    @click="viewStudents(scope.row)"
                  >
                    <i class="el-icon-view"></i> 学生列表
                  </el-button>
                  <el-button
                    v-if="scope.row && scope.row.isDelete !== 1"
                    size="small"
                    type="danger"
                    @click="finishGrading(scope.row)"
                  >
                    <i class="el-icon-check"></i> 结束批阅
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="学生列表" name="students" v-if="selectedExam">
          <!-- 学生列表表格 -->
          <div class="selected-exam-info">
            <h3>当前选择的考试: {{ selectedExam.examName }}</h3>
          </div>
          
          <el-table
            :data="studentList"
            border
            stripe
            :header-cell-style="{background:'#f5f7fa', color:'#303133', fontWeight: 'bold'}"
            class="data-table"
            v-loading="studentsLoading"
          >
            <el-table-column label="学号" prop="username" width="120"/>
            <el-table-column label="姓名" prop="name"/>
            <el-table-column label="总分" prop="totalScore" width="100">
              <template #default="scope">
                <span :class="{'high-score': scope.row.totalScore >= 60, 'low-score': scope.row.totalScore < 60}">
                  {{ scope.row.totalScore }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag type="success" v-if="scope.row.status === 1">已批阅</el-tag>
                <el-tag type="warning" v-else>未批阅</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="260">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    type="primary"
                    @click="viewStudentDetail(scope.row)"
                  >
                    <i class="el-icon-document"></i> 成绩详情
                  </el-button>
                  
                  <el-button
                    v-if="scope.row.status === 0"
                    size="small"
                    type="success"
                    @click="gradeExam(scope.row)"
                  >
                    <i class="el-icon-edit"></i> 批改试卷
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="back-button">
            <el-button type="info" @click="backToExams">返回考试列表</el-button>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="成绩详情" name="details" v-if="selectedStudent">
          <!-- 成绩详情页 -->
          <div class="selected-student-info">
            <h3>学生: {{ selectedStudent.name }} ({{ selectedStudent.username }})</h3>
            <h4>考试: {{ selectedExam?.examName }}</h4>
            <h4>总分: {{ selectedStudent.totalScore }}</h4>
          </div>
          
          <el-table
            :data="scoreDetails"
            border
            stripe
            :header-cell-style="{background:'#f5f7fa', color:'#303133', fontWeight: 'bold'}"
            class="data-table"
            v-loading="detailsLoading"
          >
            <el-table-column label="题号" prop="questionNum" width="80"/>
            <el-table-column label="题型" prop="questionType">
              <template #default="scope">
                <el-tag>{{ getQuestionTypeName(scope.row.questionType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="分值" prop="score" width="80"/>
            <el-table-column label="得分" prop="gotScore" width="80">
              <template #default="scope">
                <span :class="{'full-score': scope.row.gotScore === scope.row.score, 'partial-score': scope.row.gotScore > 0 && scope.row.gotScore < scope.row.score, 'zero-score': scope.row.gotScore === 0}">
                  {{ scope.row.gotScore }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="学生答案" prop="studentAnswer"/>
            <el-table-column label="正确答案" prop="correctAnswer"/>
            <el-table-column label="备注" prop="remark"/>
          </el-table>
          
          <div class="back-button">
            <el-button type="info" @click="backToStudents">返回学生列表</el-button>
          </div>
        </el-tab-pane>
        
        <!-- 新增课程分析标签页 -->
        <el-tab-pane label="课程分析" name="courseAnalysis">
          <div class="course-analysis-container">
            <div class="course-selection-section">
              <h3 class="section-title">课程选择</h3>
              <el-select 
                v-model="selectedCourseForAnalysis" 
                placeholder="请选择要分析的课程" 
                @change="handleCourseAnalysisChange"
                class="analysis-select"
              >
                <el-option 
                  v-for="course in courseOptions" 
                  :key="course.lessonId" 
                  :label="course.lessonName" 
                  :value="course.lessonId"
                />
              </el-select>
            </div>
            
            <div v-if="selectedCourseForAnalysis" class="analysis-content" v-loading="analysisLoading">
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-card class="course-info-card" shadow="hover">
                    <h3 class="course-name">{{ getCourseName(selectedCourseForAnalysis) }} 总体分析</h3>
                  </el-card>
                </el-col>
                
                <!-- 统计指标卡片 -->
                <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in courseStats" :key="index">
                  <el-card class="stat-card" shadow="hover">
                    <div class="stat-content">
                      <div class="stat-title">{{ stat.title }}</div>
                      <div class="stat-value" :class="stat.class">{{ stat.value }}</div>
                      <div class="stat-desc">{{ stat.description }}</div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
              
              <!-- 图表展示区域 -->
              <el-row :gutter="20" class="chart-row">
                <el-col :span="24">
                  <el-card class="chart-card" shadow="hover">
                    <div class="chart-title">考试成绩分布</div>
                    <div ref="courseChartRef" class="course-chart"></div>
                  </el-card>
                </el-col>
              </el-row>
              
              <!-- 考试列表 -->
              <el-row :gutter="20" class="exam-list-row">
                <el-col :span="24">
                  <el-card class="exam-list-card" shadow="hover">
                    <div class="card-header">
                      <h3 class="card-title">该课程考试列表</h3>
                    </div>
                    <el-table
                      :data="courseExams"
                      border
                      stripe
                      :header-cell-style="{background:'#f5f7fa', color:'#303133', fontWeight: 'bold'}"
                      class="data-table"
                    >
                      <el-table-column label="考试名称" prop="examName"/>
                      <el-table-column label="考试类型" width="120">
                        <template #default="scope">
                          <el-tag :type="scope.row.examClass === '1' ? 'danger' : 'info'">
                            {{ scope.row.examClass === '1' ? '考试' : '测试' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="考试日期" prop="examDate" width="150"/>
                      <el-table-column label="平均分" prop="averageScore" width="100"/>
                      <el-table-column label="最高分" prop="maxScore" width="100"/>
                      <el-table-column label="最低分" prop="minScore" width="100"/>
                      <el-table-column label="及格率" prop="passRate" width="100">
                        <template #default="scope">
                          {{ scope.row.passRate + '%' }}
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-card>
                </el-col>
              </el-row>
            </div>
            
            <div v-else class="empty-analysis">
              <el-empty description="请选择课程进行分析"></el-empty>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 批改试卷标签页 -->
        <el-tab-pane label="批改试卷" name="paperGrading" v-if="selectedStudent && examQuestions.length > 0">
          <div class="grading-header">
            <div class="student-exam-info">
              <h3>正在批改： {{ selectedStudent.name }} 的试卷</h3>
              <h4>考试： {{ selectedExam?.examName }}</h4>
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
              <el-button type="default" @click="cancelGrading">取消批改</el-button>
            </div>
          </div>
          
          <div class="exam-paper">
            <div v-for="(question, index) in examQuestions" :key="question.id" class="question-item">
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
              <div class="total-score-value">{{ totalGradingScore }}</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { scoreQueryByExamClass, queryByExamClass } from "@/request/test/test";
import { updateExam, getStudentScore } from "@/request/score/score";
import { queryAllByTeacherId } from "@/request/class/class";
import { getAllColleges } from '@/request/school/query';
import router from "@/router";
import type { Exam } from '@/types/score';
import axios from 'axios';
// 引入 ECharts
import * as echarts from 'echarts';

// 页面加载状态
const loading = ref(false);
const tableLoading = ref(false);
const studentsLoading = ref(false);
const detailsLoading = ref(false);

// 用户和学院信息
const userCollegeId = ref(localStorage.getItem('collegeId') || '1');
const userId = ref(localStorage.getItem('id') || '');
const collegeList = ref<any[]>([]);
const collegeNameMap = ref<Record<string, string>>({});

// 选择状态
const examClass = ref('0');
const selectedLessonId = ref('');
const activeTab = ref('exams');
const selectedExam = ref<Exam | null>(null);
const selectedStudent = ref<any | null>(null);

// 数据列表
const tableData = ref<Exam[]>([]);
const courseOptions = ref<any[]>([]);
const studentList = ref<any[]>([]);
const scoreDetails = ref<any[]>([]);

// 新增的状态
const examQuestions = ref<any[]>([]);
const totalGradingScore = ref(0);
const gradingLoading = ref(false);

// 课程分析相关
const selectedCourseForAnalysis = ref('');
const analysisLoading = ref(false);
const courseStats = ref<any[]>([]);
const courseExams = ref<any[]>([]);
const courseChartRef = ref<HTMLElement | null>(null);
let courseChart: echarts.ECharts | null = null;

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';  // 替换为正确的DeepSeek API地址
const DEEPSEEK_API_KEY = 'sk-323d247d88ac49b58fddc15e3c3d0cd0'; // 在实际部署时应从环境变量获取

// 获取学院名称
const getCollegeName = (collegeId: string): string => {
  return collegeNameMap.value[collegeId] || '未知学院';
};

// 获取学院列表
const getColleges = async () => {
  try {
    const res = await getAllColleges();
    
    if (res && Array.isArray(res)) {
      collegeList.value = res;
    } else if (res && res.data && Array.isArray(res.data)) {
      collegeList.value = res.data;
    } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
      collegeList.value = res.data.data;
    } else {
      // 备用方案
      collegeList.value = [
        { collegeId: '1', collegeName: '计算机学院' },
        { collegeId: '2', collegeName: '数学学院' },
        { collegeId: '3', collegeName: '物理学院' }
      ];
    }
    
    // 创建学院名称映射
    collegeList.value.forEach(college => {
      collegeNameMap.value[college.collegeId] = college.collegeName;
    });
    
    console.log('学院映射:', collegeNameMap.value);
  } catch (error) {
    console.error('获取学院列表失败:', error);
    ElMessage.error('获取学院信息失败');
    
    // 错误时使用默认映射
    collegeNameMap.value = {
      '1': '计算机学院',
      '2': '数学学院',
      '3': '物理学院'
    };
  }
};

// 获取课程列表
const getCourses = async () => {
  try {
    loading.value = true;
    // 使用queryAllByTeacherId获取课程列表
    const res = await queryAllByTeacherId(userId.value);
    
    console.log('课程API返回数据:', res);
    
    // 处理返回的数据结构
    let courseData: any[] = [];
    
    // 使用类型断言处理可能的响应格式
    const response = res as any;
    
    if (response && response.data && Array.isArray(response.data)) {
      // 如果response.data直接是数组
      courseData = response.data;
    } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
      // 如果response.data.data是数组
      courseData = response.data.data;
    } else if (response && Array.isArray(response)) {
      // 如果response直接是数组
      courseData = response;
    } else if (response && response.code === 200 && Array.isArray(response.data)) {
      // 匹配用户提供的数据结构 {code: 200, data: [...]}
      courseData = response.data;
    }
    
    if (courseData.length > 0) {
      // 根据API返回的实际字段映射
      courseOptions.value = courseData.map((course: any) => ({
        lessonId: course.id.toString(), // 使用id作为lessonId
        lessonName: course.lessonName
      }));
      
      ElMessage.success(`成功加载${courseOptions.value.length}门课程`);
      console.log('处理后的课程列表:', courseOptions.value);
    } else {
      ElMessage.warning('暂无课程数据');
      courseOptions.value = [];
    }
  } catch (error) {
    console.error('获取课程失败:', error);
    ElMessage.error('获取课程列表失败');
    courseOptions.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取考试列表
const getExams = async () => {
  try {
    if (!selectedLessonId.value) {
      ElMessage.warning('请先选择一门课程');
      return;
    }
    
    tableLoading.value = true;
    console.log(`正在获取${examClass.value === '0' ? '测试' : '考试'}数据，lessonId=${selectedLessonId.value}`);
    
    // 使用正确的API URL格式
    const apiUrl = `/teacher-api/exam/all/${examClass.value}/${selectedLessonId.value}`;
    console.log('使用API URL:', apiUrl);
    
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
    
    const res = await axios.get(apiUrl, { headers });
    
    console.log('API返回原始数据:', res);
    
    // 处理返回的数据
    let examData: any[] = [];
    
    // 使用类型断言处理可能的响应格式
    const response = res as any;
    
    if (response && Array.isArray(response)) {
      // 如果response直接是数组
      examData = response;
    } else if (response && response.data && Array.isArray(response.data)) {
      // 如果response.data直接是数组
      examData = response.data;
    } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
      // 如果response.data.data是数组
      examData = response.data.data;
    } else if (response && response.code === 200 && Array.isArray(response.data)) {
      // 匹配{code: 200, data: [...]}格式
      examData = response.data;
    }
    
    console.log('处理后的数据:', examData);
    
    // 过滤掉数组中的null和undefined值
    const filteredData = examData ? examData.filter(item => item !== null && item !== undefined) : [];
    console.log('过滤null后的数据:', filteredData);
    
    // 检查过滤后是否还有数据
    if (filteredData.length === 0) {
      // 原始数据不为空但过滤后为空，说明全是null值
      if (examData && examData.length > 0) {
        console.warn('API返回的数据全部为null值');
        ElMessage.warning('收到的数据格式异常，请联系管理员');
      }
      
      tableData.value = [];
      // 显示更友好的提示，并给出可能的解决方案
      const typeText = examClass.value === '0' ? '测试' : '考试';
      ElMessage.info({
        message: `当前课程下没有${typeText}记录，请尝试其他课程或切换类型`,
        duration: 5000
      });
      tableLoading.value = false;
      return;
    }
    
    // 规范化每个考试记录的字段
    try {
      tableData.value = filteredData.map((exam: any) => {
        // 确保所有必要的字段都存在，并处理字段名称不一致的情况
        return {
          id: exam.id || 0,
          examId: exam.examId || '',
          lessonId: exam.lessonId || '',
          examName: exam.examName || '',
          examClass: exam.examClass || examClass.value,
          examSet: exam.examSet || '',
          paperClassId: exam.paperClassId || '',
          modelName: exam.modelName || '',
          // 处理日期字段的不一致
          examDate: exam.examDate || exam.examData || '',
          examData: exam.examDate || exam.examData || '', // 兼容性字段
          isDelete: exam.isDelete !== undefined ? exam.isDelete : 0,
          status: exam.status !== undefined ? exam.status : 0,
          totalScore: exam.totalScore || 100,
          duration: exam.duration || 120,
          questions: exam.questions || ''
        };
      });
      
      console.log('最终处理后的表格数据:', tableData.value);
      ElMessage.success(`成功加载${tableData.value.length}个${examClass.value === '0' ? '测试' : '考试'}`);
    } catch (mapError) {
      console.error('数据格式处理错误:', mapError);
      ElMessage.error('数据格式异常，无法正确显示');
      tableData.value = [];
    }
  } catch (error: any) {
    console.error('获取考试/测试失败:', error);
    
    // 显示更详细的错误信息
    const errorMessage = error.message || '未知错误';
    const typeText = examClass.value === '0' ? '测试' : '考试';
    
    ElMessage.error({
      message: `获取${typeText}列表失败: ${errorMessage}。这可能是因为此课程没有${typeText}记录`,
      duration: 5000
    });
    
    tableData.value = [];
    
    // 添加帮助提示
    ElMessage.info({
      message: '建议: 尝试切换考试/测试类型，或选择其他课程',
      duration: 5000
    });
  } finally {
    tableLoading.value = false;
  }
};

// 获取学生列表
const getStudentList = async (examId: string) => {
  try {
    if (!examId || examId === 'undefined' || examId === 'null') {
      ElMessage.warning('考试ID不能为空');
      console.error('无效的考试ID:', examId);
      return;
    }
    
    studentsLoading.value = true;
    console.log('正在获取考试ID为', examId, '的学生列表');
    
    // 从localStorage获取JWT令牌
    const token = localStorage.getItem('token');
    
    if (!token) {
      ElMessage.error('未找到身份验证令牌，请重新登录');
      router.push('/login'); // 可能需要根据您的路由配置调整
      return;
    }
    
    // 创建请求配置，添加Authorization头
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('发送API请求，带有JWT令牌');
    
    // 尝试修改API路径格式 - 使用不同的路径格式尝试
    try {
      // 使用正确的API路径获取学生列表
      try {
        const url = `/teacher-api/score/students/${examId}`;
        console.log('尝试API URL (获取学生列表):', url);
        
        const response = await axios.get(url, config);
        console.log('API响应状态:', response.status);
        console.log('API响应数据:', response.data);
        
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            processStudentData(response);
            console.log('成功获取学生列表数据');
          } else {
            console.warn('API响应成功但data字段为空:', response.data);
          }
        } else {
          console.warn('API响应状态码不是200:', response.data);
        }
      } catch (err1: any) {
        console.log('标准API路径尝试失败:', err1.message);
        
        // 尝试其他可能的API路径
        try {
          // 尝试其他可能的路径格式
          const alternativeUrls = [
            `/teacher-api/exam/students/${examId}`,
            `/teacher-api/score/students?examId=${examId}`,
            `/teacher-api/exam/${examId}/students`
          ];
          
          for (const testUrl of alternativeUrls) {
            try {
              console.log('尝试替代API URL:', testUrl);
              
              const response = await axios.get(testUrl, config);
              if (response.data && response.data.code === 200) {
                if (response.data.data) {
                  processStudentData(response);
                  console.log('成功从替代URL获取学生列表');
                  break; // 找到有效URL，跳出循环
                }
              }
            } catch (error: any) {
              console.log(`尝试 ${testUrl} 失败:`, error.message);
            }
          }
        } catch (err2: any) {
          console.log('所有API路径尝试都失败');
          
          // 展示模拟数据以继续开发
          showMockStudents();
        }
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError);
      showMockStudents();
    }
  } catch (error: any) {
    console.error('获取学生列表失败:', error);
    
    // 检查是否是身份验证问题
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      ElMessage.error({
        message: '身份验证失败，请重新登录',
        duration: 5000
      });
      
      // 可能需要重定向到登录页面
      // router.push('/login');
      return;
    }
    
    // 显示详细错误信息，特别关注500错误
    if (error.response && error.response.status === 500) {
      console.error('服务器内部错误详情:', error.response);
      
      // 尝试提取服务器返回的错误信息
      let serverErrorMsg = '未知服务器错误';
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          serverErrorMsg = error.response.data;
          
          // 特殊处理NullPointerException
          if (serverErrorMsg.includes("NullPointerException")) {
            ElMessage.error({
              message: '后端服务器发生空指针错误，请联系开发人员修复',
              duration: 5000
            });
            // 显示模拟数据
            showMockStudents();
            return;
          }
        } else if (error.response.data.message) {
          serverErrorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          serverErrorMsg = error.response.data.error;
        }
      }
      
      ElMessage.error({
        message: `服务器内部错误: ${serverErrorMsg}`,
        duration: 5000
      });
      
      // 显示模拟数据，以便继续开发前端
      showMockStudents();
      return;
    }
    
    // 显示详细错误信息
    const errorMessage = error.message || '未知错误';
    ElMessage.error({
      message: `获取学生列表失败: ${errorMessage}`,
      duration: 5000
    });
    
    studentList.value = [];
  } finally {
    studentsLoading.value = false;
  }
};

// 处理学生数据的公共函数
const processStudentData = (response: any) => {
  // 处理返回数据
  let studentsData: any[] = [];
  
  if (response && response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
    studentsData = response.data.data;
  } else if (response && Array.isArray(response.data)) {
    studentsData = response.data;
  } else if (response && response.data && Array.isArray(response.data)) {
    studentsData = response.data;
  }
  
  // 过滤掉数组中的null和undefined值
  studentsData = studentsData.filter(item => item !== null && item !== undefined);
  console.log('过滤null后的学生数据:', studentsData);
  
  if (studentsData.length > 0) {
    // 确保每个学生记录都有必要的字段，并按照后端返回字段进行映射
    // 保留id和studentId字段用于API调用
    studentList.value = studentsData.map((student: any) => ({
      id: student.id || student.studentId || '', // 保留学生ID
      studentId: student.studentId || student.id || '', // 保留studentId 
      username: student.username || '', // 学号
      name: student.name || '',     // 学生姓名
      totalScore: student.totalScore !== undefined ? student.totalScore : 0,
      status: student.status !== undefined ? student.status : 0 // status表示是否已批改
    }));
    
    console.log('处理后的学生列表:', studentList.value);
    ElMessage.success(`成功加载${studentList.value.length}个学生记录`);
  } else {
    studentList.value = [];
    ElMessage.info('此考试暂无学生参加');
  }
};

// 显示模拟数据
const showMockStudents = () => {
  // 创建一些模拟学生数据
  const mockStudents = [
    { username: '2025001', name: '张三', totalScore: 85, status: 1 },
    { username: '2025002', name: '李四', totalScore: 92, status: 1 },
    { username: '2025003', name: '王五', totalScore: 78, status: 1 },
    { username: '2025004', name: '赵六', totalScore: 45, status: 0 },
    { username: '2025005', name: '钱七', totalScore: 67, status: 0 }
  ];
  
  studentList.value = mockStudents;
  ElMessage.warning('使用模拟数据替代真实API响应');
};

// 获取学生成绩详情
const getStudentScoreDetails = async (username: string, examId: string) => {
  try {
    detailsLoading.value = true;
    
    // 确保获取的是学生ID
    const studentId = selectedStudent.value?.id || selectedStudent.value?.studentId;
    
    if (!studentId) {
      console.warn('无法获取学生ID，可能会导致API调用失败');
      ElMessage.warning('无法获取学生ID');
      detailsLoading.value = false;
      return;
    }
    
    // 确保有考试ID
    if (!examId) {
      console.warn('无法获取考试ID，可能会导致API调用失败');
      ElMessage.warning('无法获取考试ID');
      detailsLoading.value = false;
      return;
    }
    
    console.log('获取成绩详情使用的参数: 考试ID=', examId, '学生ID=', studentId);
    
    // 从localStorage获取JWT令牌
    const token = localStorage.getItem('token');
    
    // 创建请求配置，添加Authorization头
    const config = {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
    
    try {
      // 使用正确的API路径: /score/{examId}/{studentId}
      const url = `/teacher-api/score/${examId}/${studentId}`;
      console.log('请求成绩详情API路径:', url);
      
      const response = await axios.get(url, config);
      console.log('成绩详情API响应:', response.data);
      
      if (response.data && response.data.code === 200) {
        if (response.data.data) {
          // 解析答题数据
          let scoreData = [];
          
          // 如果返回的answer是JSON字符串，解析它
          if (response.data.data.answer && typeof response.data.data.answer === 'string') {
            try {
              // 尝试解析JSON字符串
              const parsedAnswers = JSON.parse(response.data.data.answer);
              if (Array.isArray(parsedAnswers)) {
                scoreData = parsedAnswers;
              } else {
                console.warn('解析后的answer不是数组:', parsedAnswers);
              }
            } catch (parseError) {
              console.error('解析answer字段失败:', parseError);
            }
          } else if (Array.isArray(response.data.data)) {
            // 如果直接返回的是数组
            scoreData = response.data.data;
          } else {
            // 其他可能的数据结构
            console.warn('未识别的数据结构:', response.data.data);
          }
          
          // 处理scoreData，将其映射为前端展示格式
          if (scoreData.length > 0) {
            scoreDetails.value = scoreData.map((item: any) => {
              return {
                questionNum: item.id || '',
                questionType: item.type === 'single' ? 1 : (item.type === 'blank' ? 2 : 3),
                score: item.score || 0,
                gotScore: item.student_score || 0,
                studentAnswer: item.student_answer || '',
                correctAnswer: item.answer || '',
                remark: item.analysis || ''
              };
            });
            
            ElMessage.success('成功加载成绩详情');
          } else {
            ElMessage.warning('成绩数据为空');
            scoreDetails.value = [];
          }
        } else {
          ElMessage.warning('API返回数据为空');
          scoreDetails.value = [];
        }
      } else {
        console.error('API请求失败:', response.data);
        ElMessage.error('获取成绩详情失败');
        // 使用模拟数据
        useScoreMockData();
      }
    } catch (apiError) {
      console.error('API请求异常:', apiError);
      // 确保关闭加载消息
      ElMessage.closeAll(); 
      ElMessage.error('API请求异常，使用模拟数据');
      // 使用模拟数据
      useScoreMockData();
    }
  } catch (error) {
    console.error('获取成绩详情失败:', error);
    ElMessage.error('获取成绩详情失败');
    scoreDetails.value = [];
  } finally {
    detailsLoading.value = false;
  }
};

// 使用模拟数据作为备选
const useScoreMockData = () => {
  // 生成模拟题目数据
  const mockScores = [];
  const totalQuestions = 10;
  
  for (let i = 1; i <= totalQuestions; i++) {
    const questionType = i <= 5 ? 1 : (i <= 8 ? 2 : 3); // 1-5选择题，6-8填空题，9-10简答题
    const score = questionType === 1 ? 10 : (questionType === 2 ? 15 : 20);
    const gotScore = Math.floor(Math.random() * (score + 1)); // 随机得分
    
    mockScores.push({
      questionNum: i,
      questionType: questionType,
      score: score,
      gotScore: gotScore,
      studentAnswer: '学生答案示例',
      correctAnswer: '正确答案示例',
      remark: gotScore < score ? '有待改进' : '答得不错'
    });
  }
  
  scoreDetails.value = mockScores;
  ElMessage.warning('使用模拟数据展示成绩详情');
};

// 题型名称映射
const getQuestionTypeName = (type: number): string => {
  const typeMap: Record<number, string> = {
    1: '选择题',
    2: '填空题',
    3: '简答题',
    4: '计算题',
    5: '编程题'
  };
  
  return typeMap[type] || '未知题型';
};

// 处理课程选择变化
const handleLessonChange = (value: string) => {
  selectedLessonId.value = value;
  if (value) {
    getExams();
  } else {
    tableData.value = [];
  }
};

// 处理考试类型变化
const handleExamTypeChange = () => {
  if (selectedLessonId.value) {
    // 切换考试类型时清空当前数据
    tableData.value = [];
    
    // 添加提示
    ElMessage.info(`已切换到${examClass.value === '0' ? '测试' : '考试'}模式`);
    
    // 加载新数据
    getExams();
  }
};

// 处理标签页变化
const handleTabChange = (tab: any) => {
  if (tab.props.name === 'exams') {
    selectedExam.value = null;
    selectedStudent.value = null;
    examQuestions.value = []; // 清空试题数据
  } else if (tab.props.name === 'students' && !selectedExam.value) {
    activeTab.value = 'exams';
    ElMessage.warning('请先选择一个考试');
  } else if (tab.props.name === 'details' && !selectedStudent.value) {
    activeTab.value = 'students';
    ElMessage.warning('请先选择一个学生');
  } else if (tab.props.name === 'paperGrading' && (!selectedStudent.value || examQuestions.value.length === 0)) {
    activeTab.value = 'students';
    ElMessage.warning('请先选择一个学生并加载试卷数据');
  }
};

// 查看学生列表
const viewStudents = (exam: Exam) => {
  console.log('选中的考试详情:', exam);
  
  // 检查考试对象的数据结构
  if (!exam) {
    ElMessage.error('选中的考试数据无效');
    return;
  }
  
  // 存储考试对象
  selectedExam.value = exam;
  
  // 尝试获取考试ID (检查多个可能的字段名)
  const examId = exam.examId || exam.id?.toString() || '';
  
  console.log('将使用的考试ID:', examId);
  
  if (!examId) {
    ElMessage.warning('无法获取考试ID，将使用临时ID继续');
    console.warn('考试对象中没有有效的ID字段:', selectedExam.value);
    // 继续执行，使用临时ID
  }
  
  // 显示加载中消息
  ElMessage.info({
    message: '正在加载试卷批改界面...',
    duration: 1500
  });
  
  // 调用学生列表获取函数
  getStudentList(examId);
  
  // 切换到学生列表标签页
  activeTab.value = 'students';
};

// 查看学生成绩详情
const viewStudentDetail = (student: any) => {
  selectedStudent.value = student;
  if (selectedExam.value) {
    // 尝试获取考试ID (检查多个可能的字段名)
    const examId = selectedExam.value.examId || selectedExam.value.id?.toString() || '';
    
    if (!examId) {
      ElMessage.warning('无法获取考试ID，无法查看成绩详情');
      console.error('考试对象中没有有效的ID字段:', selectedExam.value);
      return;
    }
    
    console.log('查看成绩详情使用的考试ID:', examId);
    getStudentScoreDetails(student.username, examId);
    activeTab.value = 'details';
  } else {
    ElMessage.warning('请先选择一个考试');
  }
};

// 批改试卷
const gradeExam = async (student: any) => {
  try {
    console.log('正在准备批改学生试卷:', student);
    console.log('当前选中的考试信息:', selectedExam.value);
    
    // 检查学生数据
    if (!student) {
      ElMessage.warning('学生数据无效');
      return;
    }
    
    // 完整打印学生对象，以便调试
    console.log('学生对象完整数据:', JSON.stringify(student));
    
    // 优先使用id字段，这是学生的唯一标识符
    const studentId = student.id || student.studentId;
    
    if (!studentId) {
      ElMessage.warning('无法获取学生ID');
      console.error('学生对象中没有有效的ID字段:', student);
      return;
    }
    
    console.log('使用的学生ID:', studentId, '(类型:', typeof studentId, ')');
    
    // 检查考试数据
    if (!selectedExam.value) {
      ElMessage.warning('考试对象为空，请重新选择考试');
      activeTab.value = 'exams';
      return;
    }
    
    // 尝试从考试对象中获取examId
    const examId = selectedExam.value.examId || selectedExam.value.id?.toString() || 
                  selectedExam.value.examSet || '';
    
    console.log('尝试使用的考试ID:', examId);
    
    if (!examId) {
      ElMessage.warning('无法获取考试ID，将使用临时ID继续');
      console.warn('考试对象中没有有效的ID字段:', selectedExam.value);
      // 继续执行，使用临时ID
    }
    
    // 显示加载中消息
    ElMessage.info({
      message: '正在加载试卷批改界面...',
      duration: 1500
    });
    
    // 存储当前学生信息
    selectedStudent.value = student;
    
    // 设置加载状态
    gradingLoading.value = true;
    
    try {
      gradingLoading.value = true;
      console.log('准备批改学生试卷...');

      // 确保有学生ID和试卷ID
      const studentId = selectedStudent.value?.id || selectedStudent.value?.studentId;
      const examId = selectedExam.value?.examId || selectedExam.value?.id;

      if (!studentId) {
        ElMessage.warning('未选择学生，无法获取答题数据');
        return;
      }

      if (!examId) {
        ElMessage.warning('未选择考试，无法获取答题数据');
        return;
      }

      // 获取学生答题数据
      ElMessage({
        message: '正在获取学生答题数据...',
        duration: 0,
        showClose: true
      });

      let studentAnswers: any[] = [];
      let apiSuccess = false;
      let messageInstance: any = null; // 存储消息实例以便关闭
      
      try {
        // 修改API请求路径为新的格式: /score/{examId}/{studentId}
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
        
        console.log(`尝试获取学生答题数据: /score/${examId}/${studentId}`);
        
        // 使用axios发起API请求
        const response = await axios.get(`/teacher-api/score/${examId}/${studentId}`, { headers });
        
        // 处理API响应
        if (response && response.data && response.data.code === 200) {
          apiSuccess = true;
          
          // 关闭加载提示
          ElMessage.closeAll(); // 关闭所有消息，包括正在获取数据的提示
          
          // 根据新的API返回格式解析数据
          if (response.data.data) {
            // 检查是否存在answer字段，且为字符串格式
            if (response.data.data.answer && typeof response.data.data.answer === 'string') {
              try {
                // 尝试解析answer字段中的JSON字符串
                console.log('尝试解析answer字段:', response.data.data.answer.substring(0, 100) + '...');
                studentAnswers = JSON.parse(response.data.data.answer);
                console.log('解析answer成功，题目数量:', studentAnswers.length);
                
                if (!Array.isArray(studentAnswers)) {
                  console.error('解析后的answer不是数组');
                  throw new Error('数据格式错误：解析后的answer不是数组');
                }
              } catch (parseError) {
                console.error('解析answer字段失败:', parseError);
                throw new Error('答题数据格式错误，请检查API返回格式');
              }
            } else if (Array.isArray(response.data.data)) {
              // 如果直接返回数组
              studentAnswers = response.data.data;
            } else {
              // 如果是其他格式，记录详细信息辅助调试
              console.warn('未识别的数据结构，response.data.data类型:', typeof response.data.data);
              console.warn('返回数据的键:', Object.keys(response.data.data));
              throw new Error('API返回的数据格式不符合预期');
            }
            
            console.log('成功获取学生答题数据:', studentAnswers);
            ElMessage.success('成功获取学生答题数据');
          } else {
            throw new Error('API返回数据为空');
          }
        } else {
          throw new Error(`API请求失败: ${response?.data?.message || '未知错误'}`);
        }
      } catch (apiError: any) {
        console.error('API请求失败:', apiError);
        
        // 尝试备用URL格式
        try {
          console.log('尝试备用API路径...');
          const token = localStorage.getItem('token');
          const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
          
          // 尝试另一种可能的API路径格式
          const altResponse = await axios.get(`/teacher-api/score/detail?examId=${examId}&studentId=${studentId}`, { headers });
          
          if (altResponse && altResponse.data && altResponse.data.code === 200) {
            apiSuccess = true;
            
            if (altResponse.data.data) {
              if (typeof altResponse.data.data === 'string') {
                studentAnswers = JSON.parse(altResponse.data.data);
              } else if (altResponse.data.data.answer && typeof altResponse.data.data.answer === 'string') {
                // 尝试解析answer字段中的JSON字符串
                try {
                  console.log('通过备用路径尝试解析answer字段');
                  studentAnswers = JSON.parse(altResponse.data.data.answer);
                  
                  if (!Array.isArray(studentAnswers)) {
                    console.error('备用路径：解析后的answer不是数组');
                    throw new Error('数据格式错误：解析后的answer不是数组');
                  }
                } catch (parseError) {
                  console.error('备用路径：解析answer字段失败:', parseError);
                  throw new Error('备用路径：答题数据格式错误');
                }
              } else if (Array.isArray(altResponse.data.data)) {
                studentAnswers = altResponse.data.data;
              } else {
                console.warn('备用路径：未识别的数据结构:', typeof altResponse.data.data);
                throw new Error('备用路径：API返回的数据格式不符合预期');
              }
              console.log('通过备用路径成功获取学生答题数据');
              ElMessage.success('成功获取学生答题数据');
            } else {
              throw new Error('备用API返回数据为空');
            }
          } else {
            throw new Error('备用API请求也失败');
          }
        } catch (altError) {
          console.error('备用API请求也失败:', altError);
          apiSuccess = false;
        }
      }
      
      if (!apiSuccess) {
        // 如果API请求失败，提示用户并使用模拟数据
        // 确保关闭之前的加载消息
        ElMessage.closeAll();
        
        await ElMessageBox.confirm(
          `无法从后端获取学生答题数据，可能的原因：
          1. 后端API未实现或路径不匹配
          2. 网络连接问题
          3. 该学生尚未参加考试
          
          是否使用模拟数据进行演示？`,
          '获取答题数据失败',
          {
            confirmButtonText: '使用模拟数据',
            cancelButtonText: '取消批改',
            type: 'warning',
          }
        )
          .then(() => {
            // 如果用户选择继续，使用模拟数据
            console.log('用户选择继续使用模拟数据');
          })
          .catch(() => {
            // 如果用户选择取消，返回学生列表
            console.log('用户取消批改');
            cancelGrading();
            return;
          });
        
        // 使用JavaScript对象替代JSON字符串，避免解析错误
        studentAnswers = [
          {
            score: 5,
            answer: "", // 存储正确答案
            student_answer: "这是学生的主观题作答", // 添加学生答案字段
            options: [
              {id: "1744816521132_A", content: ""},
              {id: "1744816521132_B", content: ""},
              {id: "1744816521132_C", content: ""},
              {id: "1744816521132_D", content: ""}
            ],
            student_score: 0,
            id: 1744816521132,
            type: "objective",
            analysis: "<p>sadasfasf阿是发顺丰</p>",
            content: "<p><strong style=\"color: rgb(230, 0, 0);\"><em>输入你的作</em></strong><strong class=\"ql-font-serif\" style=\"color: rgb(230, 0, 0);\"><em>文题</em></strong><em class=\"ql-font-serif\">目</em><span class=\"ql-font-serif\">和想法</span></p>"
          },
          {
            score: 5,
            answer: "1744816521290_A", // 正确答案
            student_answer: "1744816521290_C", // 学生选择的答案
            options: [
              {id: "1744816521290_A", content: "<p>阿是发顺丰萨芬</p>"},
              {id: "1744816521290_B", content: "<p>阿是发顺丰</p>"},
              {id: "1744816521290_C", content: "<p>啊沙发上</p>"},
              {id: "1744816521290_D", content: "<p>阿萨法</p>"}
            ],
            student_score: 0,
            id: 1744816521290,
            type: "single",
            analysis: "<p>阿是发顺丰</p>",
            content: "<p>啊发顺丰</p>"
          },
          {
            score: 5,
            answer: "1744816522155_A", // 正确答案
            student_answer: "1744816522155_D", // 学生选择的答案
            options: [
              {id: "1744816522155_A", content: "<p>阿是发顺丰</p>"},
              {id: "1744816522155_B", content: "<p>阿是发顺丰</p>"},
              {id: "1744816522155_C", content: "<p>阿是发顺丰</p>"},
              {id: "1744816522155_D", content: "<p>啊沙发上</p>"}
            ],
            student_score: 0,
            id: 1744816522155,
            type: "single",
            analysis: "<p>阿是发顺丰</p>",
            content: ""
          }
        ];
        
        ElMessage.warning('使用模拟数据进行批改演示（后端接口可能未实现或路径不匹配）');
      }
      
      // 确保student_score字段存在并设置初始评分
      examQuestions.value = studentAnswers.map((q: any) => {
        // 对于选择题，如果答案正确初始设置为满分，否则为0分
        let initialScore = 0;
        if (q.type === 'single') {
          console.log(`选择题比较 - ID:${q.id}, 学生答案:"${q.student_answer}", 正确答案:"${q.answer}"`);
          console.log(`答案比较结果: ${q.student_answer === q.answer}`);
          
          // 增强答案比较逻辑，确保字符串比较正确
          const studentAns = String(q.student_answer).trim();
          const correctAns = String(q.answer).trim();
          
          console.log(`处理后比较: "${studentAns}" === "${correctAns}" => ${studentAns === correctAns}`);
          
          if (studentAns === correctAns) {
            initialScore = q.score;
            console.log(`✓ 答案正确，设置初始得分: ${initialScore}分`);
          } else {
            console.log(`✗ 答案错误，设置初始得分: 0分`);
          }
        }
        
        return {
          ...q,
          // 使用已有的评分或根据答案正确与否设置初始评分
          student_score: q.student_score !== undefined ? q.student_score : initialScore
        };
      });
      
      // 自动批改选择题
      autoGradeSingleChoiceQuestions();
      
      // 自动批改填空题
      autoGradeBlankQuestions();
      
      // 计算初始总分
      calculateTotalScore();
      
      // 切换到批改试卷标签页
      activeTab.value = 'paperGrading';
      
      ElMessage.success('试卷加载成功，请进行批改');
    } catch (parseError) {
      console.error('处理试题数据失败:', parseError);
      ElMessage.error({
        message: '试卷数据处理失败，请联系开发人员检查API实现',
        duration: 5000
      });
    }
  } catch (error: any) {
    console.error('批改试卷操作错误:', error);
    ElMessage.error('启动批改功能失败: ' + (error.message || '未知错误'));
  } finally {
    gradingLoading.value = false;
  }
};

// 自动批改选择题
const autoGradeSingleChoiceQuestions = () => {
  if (!examQuestions.value || examQuestions.value.length === 0) return;
  
  let totalSingleChoice = 0;
  let correctCount = 0;
  let totalPoints = 0;
  
  // 遍历所有题目
  examQuestions.value.forEach(question => {
    // 仅处理选择题
    if (question.type === 'single') {
      totalSingleChoice++;
      totalPoints += question.score;
      
      // 如果学生答案与正确答案一致，给满分，否则给0分
      // 增强答案比较逻辑，确保字符串比较正确
      const studentAns = String(question.student_answer).trim();
      const correctAns = String(question.answer).trim();
      const isCorrect = studentAns === correctAns;
      
      // 只在首次批改时设置分数，避免覆盖教师手动修改的分数
      if (question.student_score === undefined) {
        question.student_score = isCorrect ? question.score : 0;
      }
      
      if (isCorrect) {
        correctCount++;
      }
    }
  });
  
  // 更新总分
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
  if (!examQuestions.value || examQuestions.value.length === 0) return;
  
  let totalBlank = 0;
  let correctCount = 0;
  let totalPoints = 0;
  
  // 遍历所有题目
  examQuestions.value.forEach(question => {
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
  
  // 更新总分
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

// 计算总分
const calculateTotalScore = () => {
  totalGradingScore.value = examQuestions.value.reduce((total, question) => {
    return total + (question.student_score || 0);
  }, 0);
};

// 保存评分
const saveGradingScores = async () => {
  try {
    // 设置加载状态
    gradingLoading.value = true;
    
    // 计算总分
    calculateTotalScore();
    
    // 获取必要的参数
    const studentId = selectedStudent.value?.id || selectedStudent.value?.studentId;
    const examId = selectedExam.value?.examId || selectedExam.value?.id;
    
    if (!studentId || !examId) {
      ElMessage.error('缺少学生ID或考试ID，无法保存评分');
      return;
    }
    
    // 准备保存的数据
    const scoreData = {
      examId: examId,
      studentId: studentId,
      totalScore: totalGradingScore.value,
      answer: JSON.stringify(examQuestions.value) // 将整个答题数据作为JSON字符串保存
    };
    
    console.log('准备提交的评分数据:', scoreData);
    
    try {
      // 从localStorage获取JWT令牌
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
      
      // 发送评分数据到后端API
      const response = await axios.post('/teacher-api/score/save', scoreData, { headers });
      
      if (response.data && response.data.code === 200) {
        ElMessage.success('评分保存成功');
        
        // 更新学生的总分和状态
        if (selectedStudent.value) {
          selectedStudent.value.totalScore = totalGradingScore.value;
          selectedStudent.value.status = 1; // 设置为已批阅
        }
        
        // 返回学生列表
        activeTab.value = 'students';
      } else {
        throw new Error(response.data?.message || '保存评分失败');
      }
    } catch (apiError: any) {
      console.error('保存评分API调用失败:', apiError);
      
      // 如果是网络错误，给出明确提示
      if (apiError.message && apiError.message.includes('Network Error')) {
        ElMessage.error('网络连接错误，请检查网络后重试');
      } else {
        ElMessage.error(`保存评分失败: ${apiError.message || '未知错误'}`);
      }
      
      // 提示用户可能需要的操作
      ElMessage.warning('提示：可能需要联系管理员检查API接口是否正确实现');
    }
  } catch (error: any) {
    console.error('保存评分失败:', error);
    ElMessage.error(`保存评分失败: ${error.message || '未知错误'}`);
  } finally {
    gradingLoading.value = false;
  }
};

// 取消批改
const cancelGrading = () => {
  // 清空试题数据
  examQuestions.value = [];
  
  // 返回学生列表
  activeTab.value = 'students';
};

// 返回到考试列表
const backToExams = () => {
  activeTab.value = 'exams';
  selectedExam.value = null;
  selectedStudent.value = null;
};

// 返回到学生列表
const backToStudents = () => {
  activeTab.value = 'students';
  selectedStudent.value = null;
};

// 结束批阅
const finishGrading = async (data: Exam) => {
  try {
    const updateData = {
      ...data,
      isDelete: 1
    };
    
    const res = await updateExam(updateData);
    if (res && res.data) {
      ElMessage.success('该考试批阅已完成');
      await getExams();
    } else {
      ElMessage.error('操作失败');
    }
  } catch (error) {
    console.error('更新考试状态失败:', error);
    ElMessage.error('操作失败，请重试');
  }
};

// 获取题型名称 - 新增补充函数
const getQuestionTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'single': '单选题',
    'objective': '主观题'
  };
  
  return typeMap[type] || '未知题型';
};

// 添加批改按钮和功能
const reAutoGradeSingleChoice = () => {
  // 重新自动批改会覆盖所有选择题的分数
  if (!examQuestions.value || examQuestions.value.length === 0) return;
  
  examQuestions.value.forEach(question => {
    if (question.type === 'single') {
      // 增强答案比较逻辑，确保字符串比较正确
      const studentAns = String(question.student_answer).trim();
      const correctAns = String(question.answer).trim();
      const isCorrect = studentAns === correctAns;
      
      question.student_score = isCorrect ? question.score : 0;
    }
  });
  
  // 更新总分
  calculateTotalScore();
  
  ElMessage.success('已重新自动批改选择题');
};

// 初始化课程分析图表
const initCourseChart = () => {
  if (courseChartRef.value) {
    courseChart = echarts.init(courseChartRef.value);
    window.addEventListener('resize', () => {
      courseChart && courseChart.resize();
    });
  }
};

// 获取课程名称
const getCourseName = (id: string) => {
  const course = courseOptions.value.find(course => course.id === id);
  return course ? course.name : '未知课程';
};

// 处理课程分析变更
const handleCourseAnalysisChange = async (id: string) => {
  if (!id) return;
  
  analysisLoading.value = true;
  try {
    // 获取课程的所有考试
    const response = await axios.get(`/teacher-api/exam/all/${id}`);
    courseExams.value = response.data || [];
    
    // 计算课程统计数据
    if (courseExams.value.length > 0) {
      // 计算总考试数
      const examCount = courseExams.value.length;
      
      // 计算平均分
      const totalScore = courseExams.value.reduce((sum, exam) => sum + (exam.averageScore || 0), 0);
      const averageScore = examCount > 0 ? (totalScore / examCount).toFixed(2) : '0';
      
      // 获取最高分
      const maxScore = Math.max(...courseExams.value.map(exam => exam.maxScore || 0));
      
      // 计算班级平均分
      const classAverage = courseExams.value.reduce((sum, exam) => sum + (exam.classAverage || 0), 0);
      const classAverageScore = examCount > 0 ? (classAverage / examCount).toFixed(2) : '0';
      
      courseStats.value = [
        { label: '总考试数', value: examCount },
        { label: '平均分', value: averageScore },
        { label: '最高分', value: maxScore },
        { label: '班级平均分', value: classAverageScore }
      ];
      
      // 更新图表
      updateCourseChart();
    } else {
      courseStats.value = [];
      if (courseChart) {
        courseChart.clear();
      }
    }
  } catch (error) {
    console.error('获取课程分析数据失败:', error);
    ElMessage.error('获取课程分析数据失败');
    courseStats.value = [];
    courseExams.value = [];
    if (courseChart) {
      courseChart.clear();
    }
  } finally {
    analysisLoading.value = false;
  }
};

// 更新课程分析图表
const updateCourseChart = () => {
  if (!courseChart) return;
  
  const examNames = courseExams.value.map(exam => exam.name || '未命名考试');
  const averageScores = courseExams.value.map(exam => exam.averageScore || 0);
  const maxScores = courseExams.value.map(exam => exam.maxScore || 0);
  
  const option = {
    title: {
      text: `${getCourseName(selectedCourseForAnalysis.value)} 成绩分析`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均分', '最高分'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: examNames,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '平均分',
        type: 'bar',
        data: averageScores
      },
      {
        name: '最高分',
        type: 'line',
        data: maxScores
      }
    ]
  };
  
  courseChart.setOption(option);
};

// 在组件挂载时初始化图表
onMounted(() => {
  getColleges();
  getCourses();
  initCourseChart();
});

// 初始化
onMounted(async () => {
  loading.value = true;
  try {
    await getColleges();
    await getCourses();
    loading.value = false;
  } catch (error) {
    console.error('页面初始化失败:', error);
    ElMessage.error('页面加载失败，请刷新重试');
    loading.value = false;
  }
});

// 使用DeepSeek AI自动评分客观题
const autoGradeObjectiveWithAI = async () => {
  if (!examQuestions.value || examQuestions.value.length === 0) return;
  
  // 筛选出所有客观题
  const objectiveQuestions = examQuestions.value.filter(q => q.type === 'objective');
  
  if (objectiveQuestions.length === 0) {
    ElMessage.info('本试卷中没有客观题需要评分');
    return;
  }
  
  try {
    // 显示批改开始信息
    ElMessage({
      message: `开始AI批改：共${objectiveQuestions.length}道客观题`,
      type: 'info',
      duration: 0,
      showClose: true
    });
    
    // 用于跟踪完成的题目数量
    let completedCount = 0;
    let totalPoints = 0;
    
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
          question.student_score = 0;
          completedCount++;
          continue;
        }
        
        // 调用AI评分函数
        const aiScore = await getAIScore(problemContent, correctAnswer, studentAnswer, maxScore);
        
        // 更新题目分数
        question.student_score = aiScore;
        totalPoints += aiScore;
        
        // 更新计数
        completedCount++;
      } catch (error) {
        console.error(`评分题目ID=${question.id}失败:`, error);
        // 评分失败时设为0分，但不计入完成数
        question.student_score = 0;
      }
    }
    
    // 关闭加载指示器
    loading.close();
    
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

// 调用DeepSeek API进行评分
const getAIScore = async (
  problem: string,
  correctAnswer: string,
  studentAnswer: string,
  maxScore: number
): Promise<number> => {
  try {
    // 检查是否提供了API密钥
    if (!DEEPSEEK_API_KEY) {
      console.warn('未配置DeepSeek API密钥，将随机生成评分');
      // 模拟评分：生成0到满分之间的随机分数
      const randomScore = Math.floor(Math.random() * (maxScore + 1));
      return randomScore;
    }
    
    // 构建请求体
    const promptTemplate = `
      作为教育评分系统，你的任务是评估学生对客观题的回答。
      
      # 评分规则：
      1. 题目满分为${maxScore}分
      2. 根据学生回答的准确性、完整性和相关性给出评分
      3. 仅返回一个数字作为评分结果，范围从0到${maxScore}
      
      # 题目内容：
      ${problem}
      
      # 标准答案：
      ${correctAnswer}
      
      # 学生回答：
      ${studentAnswer}
      
      # 请给出评分（只需返回数字，不需要任何解释）：
    `;
    
    // 调用DeepSeek API
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个教育评分助手。请根据题目要求为学生答案评分，只返回分数数字。' },
          { role: 'user', content: promptTemplate }
        ],
        temperature: 0.1, // 低温度确保结果更确定
        max_tokens: 10 // 只需要返回分数
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 获取API返回的结果
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const scoreText = response.data.choices[0].message.content.trim();
      // 提取分数（假设返回的只是一个数字）
      const scoreMatch = scoreText.match(/\d+(\.\d+)?/);
      if (scoreMatch) {
        const score = Math.min(parseFloat(scoreMatch[0]), maxScore);
        return score;
      }
    }
    
    // 如果无法从API响应中获取有效分数，返回0分
    console.warn('无法从API响应中获取有效分数:', response.data);
    return 0;
  } catch (error) {
    console.error('调用DeepSeek API失败:', error);
    // 出错时返回0分
    return 0;
  }
};
</script>

<style scoped>
.score-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-card {
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.college-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-weight: 600;
  color: #606266;
}

.filter-select {
  width: 100%;
}

.data-table {
  margin-top: 15px;
  margin-bottom: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.selected-exam-info,
.selected-student-info {
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

.back-button {
  margin-top: 20px;
  text-align: center;
}

.high-score {
  color: #67c23a;
  font-weight: bold;
}

.low-score {
  color: #f56c6c;
  font-weight: bold;
}

.full-score {
  color: #67c23a;
  font-weight: bold;
}

.partial-score {
  color: #e6a23c;
  font-weight: bold;
}

.zero-score {
  color: #f56c6c;
  font-weight: bold;
}

/* 新增批改试卷相关样式 */
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

.student-answer-mark {
  margin-left: auto;
  color: #409EFF;
  font-weight: bold;
  font-size: 18px;
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
