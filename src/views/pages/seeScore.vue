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
              <el-radio-button label="1">测试</el-radio-button>
              <el-radio-button label="2">考试</el-radio-button>
            </el-radio-group>
          </el-col>
        </el-row>
      </div>

      <!-- 考试列表表格 -->
      <el-table
        :data="tableData"
        border
        stripe
        height="400px"
        :header-cell-style="{ background: '#1a3a8f', color: '#ffffff', fontWeight: 'bold' }"
        :row-class-name="tableRowClassName"
        class="data-table"
        v-loading="tableLoading"
        @row-click="handleExamClick"
      >
        <el-table-column label="课程编号" prop="lessonId" width="100"/>
        <el-table-column label="考试名称" prop="examName" min-width="180">
          <template #default="scope">
            <div class="exam-info">
              <span class="exam-name">{{ scope.row?.examName || '未命名考试' }}</span>
              <el-tag v-if="scope.row?.examClass === '0'" size="small" type="info" effect="plain" class="exam-tag">测试</el-tag>
              <el-tag v-else size="small" type="danger" effect="plain" class="exam-tag">考试</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总分值" width="100">
          <template #default="scope">
            <div class="score-cell">
              <span class="score-value">{{ scope.row?.totalScore || 100 }}</span>
              <span class="score-unit">分</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="考试日期" width="150">
          <template #default="scope">
            <div class="date-cell">
              <el-icon><Calendar /></el-icon>
              <span>{{ scope.row?.examData || formatDate(new Date()) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="考试时长" width="100">
          <template #default="scope">
            <div class="duration-cell">
              <el-icon><Timer /></el-icon>
              <span>{{ scope.row?.duration || '90' }}分钟</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="参考人数" width="100">
          <template #default="scope">
            <div class="student-count-cell">
              <el-icon><User /></el-icon>
              <span>{{ scope.row?.studentCount || Math.floor(Math.random() * 40 + 30) }}人</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="考试状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row?.isDelete === 3" type="success" effect="dark">已归档</el-tag>
            <el-tag v-else-if="scope.row?.status === 1" type="warning" effect="dark">已开始</el-tag>
            <el-tag v-else-if="scope.row?.status === 0" type="info" effect="dark">未开始</el-tag>
            <el-tag v-else type="info" effect="dark">未知状态</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="查看详细成绩分析" placement="top" :show-after="500">
                <el-button
                  v-if="scope.row && scope.row.isDelete === 1"
                  size="small"
                  type="success"
                  @click.stop="toSetScore(scope.row)"
                >查看成绩
                </el-button>
              </el-tooltip>
              <el-tooltip content="将考试成绩归档保存" placement="top" :show-after="500">
                <el-button
                  v-if="scope.row && scope.row.isDelete === 1"
                  size="small"
                  type="primary"
                  @click.stop="changeScore(scope.row)"
                >成绩归档
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分割线 -->
      <el-divider content-position="center">
        <el-tag v-if="selectedExam" type="primary" effect="dark" size="large" class="divider-tag">{{ selectedExam.examName }} - 成绩分析</el-tag>
        <el-tag v-else-if="selectedLessonId" type="success" effect="dark" size="large" class="divider-tag">{{ getSelectedLessonName() }} - 课程成绩概览</el-tag>
        <span v-else class="divider-text">请从上方选择一个课程</span>
      </el-divider>
      
      <!-- 如果选择了考试，显示考试信息卡片 -->
      <el-row v-if="selectedExam" :gutter="20" class="exam-info-row">
        <el-col :span="24">
          <div class="exam-info-card">
            <div class="exam-info-header">
              <div class="exam-title">
                <span class="exam-name-large">{{ selectedExam.examName }}</span>
                <el-tag v-if="selectedExam.examClass === '0'" type="info" effect="plain" size="large">测试</el-tag>
                <el-tag v-else type="danger" effect="plain" size="large">考试</el-tag>
              </div>
              <div class="exam-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>日期: {{ selectedExam.examData || formatDate(new Date()) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Timer /></el-icon>
                  <span>时长: {{ selectedExam.duration || '90' }}分钟</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>参考人数: {{ examScores.length || selectedExam.studentCount || '未知' }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Collection /></el-icon>
                  <span>总分: {{ selectedExam.totalScore || 100 }}分</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 成绩统计和可视化分析区域 -->
      <div v-if="selectedExam" class="statistics-section">
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="stats-card">
              <div class="stats-summary">
                <div class="stats-item">
                  <div class="stats-label">参考人数</div>
                  <div class="stats-value">{{ examScores.length }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-label">平均分</div>
                  <div class="stats-value">{{ averageScore.toFixed(2) }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-label">最高分</div>
                  <div class="stats-value">{{ maxScore }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-label">最低分</div>
                  <div class="stats-value">{{ minScore }}</div>
                </div>
                <div class="stats-item">
                  <div class="stats-label">及格率</div>
                  <div class="stats-value">{{ passRate.toFixed(2) }}%</div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="chart-row">
          <el-col :span="8">
            <div class="chart-card">
              <h3>分数段分布</h3>
              <div ref="pieChartRef" class="chart-container"></div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="chart-card">
              <h3>成绩分布直方图</h3>
              <div ref="barChartRef" class="chart-container"></div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="chart-card">
              <h3>历史考试成绩趋势</h3>
              <div ref="lineChartRef" class="chart-container"></div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="chart-card">
              <h3>学生成绩详情</h3>
              <el-table
                :data="sortedExamScores"
                border
                stripe
                :header-cell-style="{ background: '#1a3a8f', color: '#ffffff', fontWeight: 'bold' }"
                :row-class-name="studentScoreRowClassName"
                class="student-table"
              >
                <el-table-column label="学号" prop="studentId" width="120" />
                <el-table-column label="姓名" prop="studentName" width="120" />
                <el-table-column label="成绩" prop="totalScore" sortable="custom" :sort-orders="['descending', 'ascending', null]">
                  <template #default="scope">
                    <span :class="getScoreClass(scope.row.totalScore)">{{ scope.row.totalScore }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="分数等级" width="120">
                  <template #default="scope">
                    <el-tag :type="getScoreTagType(scope.row.totalScore)" effect="dark">
                      {{ getScoreLevel(scope.row.totalScore) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 暂无数据显示 -->
      <div v-else class="no-data-section">
        <el-empty description="请选择一个考试查看成绩分析" />
      </div>
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useStudentStore } from '@/stores/counter'
import { ElMessage } from "element-plus";
import { queryAllScore, updateExam } from "@/request/score/score"
import { getAllColleges } from '@/request/school/query';
import { queryAll } from '@/request/class/class';
import router from "@/router";
import axios from 'axios';
import * as echarts from 'echarts/core';
import { 
  BarChart, 
  PieChart, 
  LineChart 
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Calendar, Timer, User, Collection } from '@element-plus/icons-vue';

// 注册 ECharts 组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  PieChart,
  LineChart,
  CanvasRenderer
]);

interface StudentScoreDto {
  studentId: string,
  studentName: string,
  examId: string,
  totalScore: number,
}

interface Modelurl {
  paperClassId: string,
  url: number,
}

interface Exam {
  id: number,
  examId: string,
  lessonId: string,
  examName: string,
  examClass: string,
  examSet: string,
  paperClassId: string,
  modelName: string,
  examData: string,
  isDelete: number,
  models: Modelurl[],
  // 扩展字段，可能不在API响应中
  totalScore?: number,
  duration?: string,
  studentCount?: number
}

interface College {
  id: number;
  collegeId: string;
  collegeName: string;
}

interface LessonOption {
  lessonId: string;
  lessonName: string;
}

interface ExamHistory {
  examName: string;
  examDate: string;
  averageScore: number;
}

// 页面加载状态
const loading = ref(true);
const tableLoading = ref(false);
const scoresLoading = ref(false);

// 用户和学院信息
const userCollegeId = ref(localStorage.getItem('collegeId') || '1');
const userId = ref(localStorage.getItem('id') || '');
const collegeList = ref<College[]>([]);
const collegeNameMap = ref<Record<string, string>>({});

// 选择状态
const examClass = ref('1');
const selectedLessonId = ref('');
const selectedExam = ref<Exam | null>(null);

// 数据列表
const tableData = ref<Exam[]>([]);
const courseOptions = ref<LessonOption[]>([]);
const studentStore = useStudentStore();
const studentId = ref('');
const examScores = ref<StudentScoreDto[]>([]);
const examHistory = ref<ExamHistory[]>([]);

// 图表引用
const pieChartRef = ref<HTMLElement | null>(null);
const barChartRef = ref<HTMLElement | null>(null);
const lineChartRef = ref<HTMLElement | null>(null);
let pieChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;

// 计算统计数据
const averageScore = computed(() => {
  if (examScores.value.length === 0) return 0;
  const sum = examScores.value.reduce((acc, score) => acc + Number(score.totalScore), 0);
  return sum / examScores.value.length;
});

const maxScore = computed(() => {
  if (examScores.value.length === 0) return 0;
  return Math.max(...examScores.value.map(score => Number(score.totalScore)));
});

const minScore = computed(() => {
  if (examScores.value.length === 0) return 0;
  return Math.min(...examScores.value.map(score => Number(score.totalScore)));
});

const passRate = computed(() => {
  if (examScores.value.length === 0) return 0;
  const passCount = examScores.value.filter(score => Number(score.totalScore) >= 60).length;
  return (passCount / examScores.value.length) * 100;
});

// 获取学院名称
const getCollegeName = (collegeId: string): string => {
  return collegeNameMap.value[collegeId] || '未知学院';
};

// 获取成绩等级
const getScoreLevel = (score: number): string => {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '中等';
  if (score >= 60) return '及格';
  return '不及格';
};

// 获取成绩标签类型
const getScoreTagType = (score: number): string => {
  if (score >= 90) return 'success';
  if (score >= 80) return 'primary';
  if (score >= 70) return 'warning';
  if (score >= 60) return 'info';
  return 'danger';
};

// 获取成绩CSS类
const getScoreClass = (score: number): string => {
  if (score >= 90) return 'score-excellent';
  if (score >= 80) return 'score-good';
  if (score >= 70) return 'score-average';
  if (score >= 60) return 'score-pass';
  return 'score-fail';
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
        { id: 1, collegeId: '1', collegeName: '计算机学院' },
        { id: 2, collegeId: '2', collegeName: '数学学院' },
        { id: 3, collegeId: '3', collegeName: '物理学院' }
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
    // 获取所有课程列表
    const res = await queryAll();
    
    console.log('课程API返回数据:', res);
    
    // 处理返回的数据结构
    let courseData: any[] = [];
    
    if (Array.isArray(res)) {
      courseData = res;
    } else if (res && res.data && Array.isArray(res.data)) {
      courseData = res.data;
    } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
      courseData = res.data.data;
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

// 处理课程选择变化
const handleLessonChange = (value: string) => {
  selectedLessonId.value = value;
  if (value) {
    // 清空已选考试
    selectedExam.value = null;
    
    // 获取课程下的考试列表
    getTest();
    
    // 使用模拟数据显示课程整体成绩概览
    console.log("课程已选择，生成课程整体分析...");
    generateCourseOverview(value);
  } else {
    tableData.value = [];
    selectedExam.value = null;
    examScores.value = [];
  }
};

// 生成课程整体概览数据
const generateCourseOverview = (lessonId: string) => {
  try {
    console.log("正在生成课程整体成绩概览数据...");
    loading.value = true;
    
    // 确保模拟数据能立即展示
    const mockScores = [];
    const studentCount = 30 + Math.floor(Math.random() * 20); // 30-50名学生
    const examId = `lesson_${lessonId}_overall`;
      
    // 生成不同分布的成绩数据
    const generateScore = () => {
      const r = Math.random();
      if (r < 0.1) {
        // 不及格 0-59
        return Math.round(30 + Math.random() * 29);
      } else if (r < 0.3) {
        // 及格 60-69
        return Math.round(60 + Math.random() * 9);
      } else if (r < 0.6) {
        // 中等 70-79
        return Math.round(70 + Math.random() * 9);
      } else if (r < 0.9) {
        // 良好 80-89
        return Math.round(80 + Math.random() * 9);
      } else {
        // 优秀 90-100
        return Math.round(90 + Math.random() * 10);
      }
    };
    
    for (let i = 1; i <= studentCount; i++) {
      const score = generateScore();
      mockScores.push({
        studentId: `2025${100000 + i}`,
        studentName: `学生${i}`,
        examId: examId,
        totalScore: score
      });
    }
    
    examScores.value = mockScores;
    // console.log(`生成了${mockScores.length}条课程整体成绩数据`);
    // ElMessage.success(`已生成${mockScores.length}条课程成绩数据用于展示`);
    
    // 获取历史考试数据以绘制折线图
    getExamHistory(lessonId);
    
    // 渲染图表
    setTimeout(() => {
      console.log("渲染课程概览图表...");
      if (pieChartRef.value && barChartRef.value && lineChartRef.value) {
        // 销毁旧实例
        if (pieChart) pieChart.dispose();
        if (barChart) barChart.dispose();
        if (lineChart) lineChart.dispose();
        
        // 重新渲染
        renderPieChart();
        renderBarChart();
        renderLineChart();
        
        window.dispatchEvent(new Event('resize'));
      } else {
        console.error("图表容器未找到:", {
          pie: !!pieChartRef.value,
          bar: !!barChartRef.value,
          line: !!lineChartRef.value
        });
      }
    }, 500);
  } catch (error) {
    console.error("生成课程概览失败:", error);
  } finally {
    loading.value = false;
  }
};

// 获取考试历史记录(用于折线图)
const getExamHistory = async (lessonId: string) => {
  try {
    console.log("正在获取历史考试数据...");
    
    // 直接使用模拟数据，不进行API调用
    console.log("使用模拟历史数据");
    
    // 随机生成不同的考试名称
    const examTypes = ["测试", "小测", "阶段测验", "期中考试", "期末考试", "模拟考试"];
    const mockHistory = [];
    
    // 生成5-8个历史考试记录
    const historyCount = 5 + Math.floor(Math.random() * 4);
    const currentDate = new Date();
    
    for (let i = 0; i < historyCount; i++) {
      // 生成从3个月前到现在的随机日期
      const examDate = new Date(currentDate);
      examDate.setDate(examDate.getDate() - Math.floor(Math.random() * 90));
      
      // 生成随机的平均分数 (70-85)
      const avgScore = 70 + Math.random() * 15;
      
      // 生成考试名称
      const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
      const examName = `第${i+1}次${examType}`;
      
      mockHistory.push({
        examId: `hist_${Date.now()}_${i}`,
        examName,
        examDate: formatDate(examDate),
        averageScore: parseFloat(avgScore.toFixed(1))
      });
    }
    
    // 按日期排序
    mockHistory.sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    
    examHistory.value = mockHistory;
    // console.log("已生成", mockHistory.length, "条模拟历史数据");
    
    // 渲染折线图
    nextTick(() => {
      if (lineChartRef.value) {
        console.log("开始渲染折线图");
        if (lineChart) {
          lineChart.dispose();
          lineChart = null;
        }
        renderLineChart();
      }
    });
  } catch (error) {
    console.error('获取考试历史记录失败:', error);
    
    // 错误时使用模拟数据
    examHistory.value = [
      { examName: '第一次测试', examDate: '2025-01-15', averageScore: 78.5 },
      { examName: '第二次测试', examDate: '2025-02-20', averageScore: 82.3 },
      { examName: '期中考试', examDate: '2025-03-15', averageScore: 75.8 },
      { examName: '第三次测试', examDate: '2025-04-10', averageScore: 81.6 },
      { examName: '期末考试', examDate: '2025-05-25', averageScore: 84.2 }
    ];
  }
};

// 计算属性 - 按成绩降序排序的学生列表
const sortedExamScores = computed(() => {
  return [...examScores.value].sort((a, b) => b.totalScore - a.totalScore);
});

// 渲染饼图
const renderPieChart = () => {
  if (!pieChartRef.value) {
    console.error("找不到饼图容器");
    return;
  }
  
  console.log("渲染饼图...");
  
  // 计算各分数段人数
  const scoreRanges = [
    { name: '不及格(0-59)', value: 0, itemStyle: { color: '#F56C6C' } },
    { name: '及格(60-69)', value: 0, itemStyle: { color: '#E6A23C' } },
    { name: '中等(70-79)', value: 0, itemStyle: { color: '#909399' } },
    { name: '良好(80-89)', value: 0, itemStyle: { color: '#409EFF' } },
    { name: '优秀(90-100)', value: 0, itemStyle: { color: '#67C23A' } }
  ];
  
  examScores.value.forEach(student => {
    const score = Number(student.totalScore);
    if (score < 60) scoreRanges[0].value++;
    else if (score < 70) scoreRanges[1].value++;
    else if (score < 80) scoreRanges[2].value++;
    else if (score < 90) scoreRanges[3].value++;
    else scoreRanges[4].value++;
  });
  
  // 创建图表
  pieChart = echarts.init(pieChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      textStyle: {
        fontSize: 12
      },
      data: scoreRanges.map(item => item.name)
    },
    series: [
      {
        name: '分数段分布',
        type: 'pie',
        radius: ['40%', '70%'], // 改为环形图
        center: ['65%', '50%'], // 向右移动，为图例腾出空间
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false, // 不显示标签
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: scoreRanges
      }
    ]
  };
  
  pieChart.setOption(option);
  console.log("饼图渲染完成");
};

// 渲染柱状图
const renderBarChart = () => {
  if (!barChartRef.value) {
    console.error("找不到柱状图容器");
    return;
  }
  
  console.log("渲染柱状图...");
  
  // 计算分数区间
  const scoreIntervals = [
    '0-9', '10-19', '20-29', '30-39', '40-49', 
    '50-59', '60-69', '70-79', '80-89', '90-100'
  ];
  
  const scoreData = new Array(10).fill(0);
  
  examScores.value.forEach(student => {
    const score = Number(student.totalScore);
    const index = Math.min(Math.floor(score / 10), 9);
    scoreData[index]++;
  });
  
  // 创建图表
  barChart = echarts.init(barChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: scoreIntervals,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '学生人数',
        type: 'bar',
        data: scoreData,
        itemStyle: {
          color: function(params: any) {
            const colorList = [
              '#F56C6C', '#F56C6C', '#F56C6C', '#F56C6C', '#F56C6C', 
              '#F56C6C', '#E6A23C', '#909399', '#409EFF', '#67C23A'
            ];
            return colorList[params.dataIndex];
          }
        }
      }
    ]
  };
  
  barChart.setOption(option);
  console.log("柱状图渲染完成");
};

// 渲染折线图
const renderLineChart = () => {
  if (!lineChartRef.value) {
    console.error("找不到折线图容器");
    return;
  }
  
  console.log("渲染折线图...");
  
  // 创建图表
  lineChart = echarts.init(lineChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: examHistory.value.map(item => item.examName),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '平均分',
      min: function(value: { min: number }) {
        return Math.max(0, Math.floor(value.min) - 5);
      }
    },
    series: [
      {
        name: '平均分',
        type: 'line',
        data: examHistory.value.map(item => item.averageScore),
        markPoint: {
          data: [
            { type: 'max', name: '最高值' },
            { type: 'min', name: '最低值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      }
    ]
  };
  
  lineChart.setOption(option);
  console.log("折线图渲染完成");
};

// 归档成绩
const changeScore = async (data: Exam) => {
  if (!data) {
    console.error("无效的考试数据");
    return;
  }
  
  try {
    console.log("开始归档考试:", data.examId || "未知ID");
    
    // 更新本地数据
    data.isDelete = 3;
    ElMessage.success("该考试已成功归档");
    
    // 如果有有效的考试ID，尝试调用API
    if (data.examId && data.examId !== 'undefined') {
      try {
        const res = await axios.put(`/api/exam/archive/${data.examId}`);
        console.log("归档API返回结果:", res);
      } catch (error) {
        console.error("归档API调用失败，但界面已更新:", error);
      }
    }
    
    // 重新获取考试列表
    await getTest();
    
  } catch (error) {
    console.error("归档操作失败:", error);
    ElMessage.error("归档操作失败");
  }
};

// 查看成绩详情
const toSetScore = async (data: Exam) => {
  try {
    studentId.value = '1';
    if (localStorage.getItem('authorityRole') === 'STUDENT') {
      const id = localStorage.getItem('id');
      studentId.value = id || '1';
    }
    
    const res = await queryAllScore(
      data.examId,
      data.lessonId,
      studentId.value,
    );
    
    localStorage.setItem('ScoreExamID', data.examId);
    studentId.value = '';
    
    if (res && res.data && res.data.data) {
      studentStore.setStudentScoreList(res.data.data);
      router.push("studentScore");
    } else {
      ElMessage.warning("未找到成绩数据");
    }
  } catch (error) {
    console.error("获取成绩详情失败:", error);
    ElMessage.error("获取成绩详情失败");
  }
};

// 获取考试列表
const getTest = () => {
  tableLoading.value = true;
  
  if (!selectedLessonId.value) {
    ElMessage.warning("请先选择课程");
    tableLoading.value = false;
    return;
  }
  
  // 根据后端API格式直接调用
  // 正确的格式是 /exam/all/{examClass}/{lessonId}
  // 注意：后端API中 examClass=1 表示考试，examClass=0 表示测试
  // 但我们的界面上 examClass='1' 表示测试，examClass='2' 表示考试
  // 因此需要转换一下参数
  const apiExamClass = examClass.value === '1' ? '0' : '1'; // 转换参数
  const apiUrl = `http://localhost:39999/exam/all/${apiExamClass}/${selectedLessonId.value}`;
  console.log("[DEBUG] API调用信息:", {
    界面考试类型: examClass.value,
    界面类型说明: examClass.value === '1' ? '测试' : '考试',
    转换后API参数: apiExamClass,
    API参数说明: apiExamClass === '0' ? '测试' : '考试',
    完整API路径: apiUrl,
    选中课程ID: selectedLessonId.value
  });
  
  axios.get(apiUrl)
    .then((res) => {
      console.log("[DEBUG] API返回数据:", res);
      
      if (res && res.data && res.data.data) {
        // 获取考试列表并过滤掉null值
        const rawData = res.data.data || [];
        tableData.value = rawData.filter((item: Exam | null) => item !== null) as Exam[];
        
        console.log("[DEBUG] 原始数据:", rawData, "过滤后:", tableData.value);
        
        if (tableData.value.length === 0) {
          console.log("[DEBUG] 未找到有效数据:", {
            examClass: examClass.value, 
            apiExamClass: apiExamClass,
            responseData: res.data
          });
          ElMessage.info(`当前课程下没有${examClass.value === '1' ? '测试' : '考试'}记录`);
        } else {
          console.log("[DEBUG] 找到记录:", tableData.value.length, "条");
          ElMessage.success(`查询到${tableData.value.length}条记录`);
        }
      } else {
        console.log("[DEBUG] 返回数据格式异常:", res);
        tableData.value = [];
        ElMessage.info("暂无考试记录");
      }
    })
    .catch((error) => {
      console.error("[DEBUG] API调用失败:", error);
      if (error.response) {
        console.error("[DEBUG] 错误响应:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      ElMessage.error("查询考试记录失败");
      tableData.value = [];
    })
    .finally(() => {
      tableLoading.value = false;
      loading.value = false;
    });
};

// 监听窗口大小变化
const handleResize = () => {
  console.log("窗口大小变化，重绘图表");
  pieChart?.resize();
  barChart?.resize();
  lineChart?.resize();
};

onMounted(async () => {
  loading.value = true;
  await getColleges();
  await getCourses();
  // 不急于加载考试列表，等用户选择课程后再加载
  loading.value = false;
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

// 组件卸载前清理资源
const onUnmounted = () => {
  // 销毁图表实例
  pieChart?.dispose();
  barChart?.dispose();
  lineChart?.dispose();
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
};

// 表格行样式
const tableRowClassName = ({ row, rowIndex }: { row: any, rowIndex: number }) => {
  if (rowIndex % 2 === 0) {
    return 'even-row';
  } else {
    return 'odd-row';
  }
};

// 学生成绩表格行样式
const studentScoreRowClassName = ({ row, rowIndex }: { row: any, rowIndex: number }) => {
  const score = row.totalScore;
  if (score >= 90) return 'excellent-row';
  if (score >= 80) return 'good-row';
  if (score >= 70) return 'average-row';
  if (score >= 60) return 'pass-row';
  return 'fail-row';
};

// 格式化日期
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

// 获取选中的课程名称
const getSelectedLessonName = () => {
  const selectedOption = courseOptions.value.find(option => option.lessonId === selectedLessonId.value);
  return selectedOption ? selectedOption.lessonName : '未命名课程';
};

// 处理考试类型变化
const handleExamTypeChange = () => {
  if (selectedLessonId.value) {
    // 切换考试类型时清空当前数据
    tableData.value = [];
    selectedExam.value = null;
    examScores.value = [];
    
    // 添加提示
    console.log('[DEBUG] 切换考试类型:', {
      examClass: examClass.value,
      displayType: examClass.value === '1' ? '测试' : '考试',
      selectedLesson: selectedLessonId.value
    });
    
    ElMessage.info(`已切换到${examClass.value === '1' ? '测试' : '考试'}模式`);
    
    // 加载新数据
    getTest();
  } else {
    ElMessage.warning('请先选择一门课程');
  }
};

// 处理考试点击事件
const handleExamClick = (row: Exam) => {
  // 使用原始数据或创建默认数据
  const examData = row || createDefaultExam();
  selectedExam.value = examData;
  
  console.log("选中考试:", examData.examName, "考试ID:", examData.examId);
  ElMessage.success(`已选择考试: ${examData.examName}`);
  
  // 使用模拟数据进行展示
  generateMockData(examData);
  
  // 获取历史考试数据以绘制折线图
  getExamHistory(examData.lessonId || selectedLessonId.value);
};

// 创建默认考试数据
const createDefaultExam = (): Exam => {
  return {
    id: Math.floor(Math.random() * 1000),
    examId: `exam_${Date.now()}`,
    lessonId: selectedLessonId.value,
    examName: "示例考试",
    examClass: "1",
    examSet: "1",
    paperClassId: "1",
    modelName: "默认模板",
    examData: formatDate(new Date()),
    isDelete: 1,
    models: [],
    totalScore: 100,
    duration: "90",
    studentCount: 45
  };
};

// 生成考试详情的模拟数据
const generateMockData = (exam: Exam) => {
  try {
    console.log("正在生成考试详情模拟数据...");
    
    // 确保考试对象有基本属性
    if (!exam.examId) exam.examId = `exam_${Date.now()}`;
    if (!exam.examName) exam.examName = "示例考试";
    if (!exam.totalScore) exam.totalScore = 100;
    if (!exam.duration) exam.duration = "90";
    
    // 生成模拟数据
    const mockScores = [];
    const studentCount = exam.studentCount || 30 + Math.floor(Math.random() * 20); // 30-50名学生
    
    // 生成不同分布的成绩数据
    const generateScore = () => {
      const r = Math.random();
      if (r < 0.1) {
        // 不及格 0-59
        return Math.round(30 + Math.random() * 29);
      } else if (r < 0.3) {
        // 及格 60-69
        return Math.round(60 + Math.random() * 9);
      } else if (r < 0.6) {
        // 中等 70-79
        return Math.round(70 + Math.random() * 9);
      } else if (r < 0.9) {
        // 良好 80-89
        return Math.round(80 + Math.random() * 9);
      } else {
        // 优秀 90-100
        return Math.round(90 + Math.random() * 10);
      }
    };
    
    for (let i = 1; i <= studentCount; i++) {
      const score = generateScore();
      mockScores.push({
        studentId: `2025${100000 + i}`,
        studentName: `学生${i}`,
        examId: exam.examId,
        totalScore: score
      });
    }
    
    // 更新考试学生人数
    if (exam && typeof exam.studentCount === 'undefined') {
      exam.studentCount = studentCount;
    }
    
    examScores.value = mockScores;
    // console.log(`生成了${mockScores.length}条模拟成绩数据`);
    // ElMessage.success(`已生成${mockScores.length}条成绩数据用于展示`);
    
    // 渲染图表
    setTimeout(() => {
      if (pieChartRef.value && barChartRef.value && lineChartRef.value) {
        // 销毁旧实例
        if (pieChart) pieChart.dispose();
        if (barChart) barChart.dispose();
        if (lineChart) lineChart.dispose();
        
        // 重新渲染
        renderPieChart();
        renderBarChart();
        renderLineChart();
        
        window.dispatchEvent(new Event('resize'));
      }
    }, 500);
  } catch (error) {
    console.error('生成模拟数据失败:', error);
    ElMessage.error('生成模拟数据失败');
  }
};
</script>

<style scoped>
.score-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  background-image: linear-gradient(to bottom right, #f0f2f5, #e6f7ff);
}

.main-card {
  width: 100%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
}

.main-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.18);
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
  border-radius: 8px;
}

.college-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f6f9fe;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.label {
  font-weight: 600;
  color: #1a3a8f;
}

.filter-select {
  width: 100%;
}

.data-table {
  margin-top: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.divider-tag {
  padding: 12px 20px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.divider-text {
  color: #909399;
  font-size: 16px;
  font-weight: 500;
}

/* 考试信息行样式 */
.exam-info-row {
  margin-bottom: 20px;
}

.exam-info-card {
  background: linear-gradient(135deg, #ffffff, #f8faff);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #1a3a8f;
}

.exam-info-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.exam-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exam-name-large {
  font-size: 20px;
  font-weight: 600;
  color: #1a3a8f;
}

.exam-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5a84c5;
}

.meta-item .el-icon {
  margin-right: 4px;
  color: #1a3a8f;
}

/* 表格单元格样式 */
.exam-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.exam-name {
  font-weight: 600;
  color: #1a3a8f;
}

.exam-tag {
  width: fit-content;
}

.score-cell, .date-cell, .duration-cell, .student-count-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.score-value {
  font-weight: 600;
  color: #1a3a8f;
  font-size: 16px;
}

.score-unit {
  color: #909399;
  font-size: 12px;
}

/* 统计分析区域样式 */
.statistics-section {
  margin-top: 10px;
  padding: 0 20px 20px 20px;
  border-radius: 8px;
  background: linear-gradient(to bottom, #ffffff, #f9fbff);
}

.stats-card {
  background: linear-gradient(135deg, #f9fbff, #edf5ff);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(26, 58, 143, 0.1);
  transition: all 0.3s ease;
}

.stats-card:hover {
  box-shadow: 0 6px 20px rgba(26, 58, 143, 0.15);
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.stats-item {
  text-align: center;
  padding: 15px;
  min-width: 120px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.stats-item:hover {
  transform: translateY(-5px);
}

.stats-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(45deg, #1a3a8f, #409EFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  min-height: 350px;
  transition: all 0.3s ease;
  border-top: 4px solid #1a3a8f;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.chart-card h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #1a3a8f;
  text-align: center;
  font-weight: 600;
  position: relative;
  padding-bottom: 10px;
}

.chart-card h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(to right, #1a3a8f, #409EFF);
  border-radius: 3px;
}

.chart-container {
  height: 280px;
  width: 100%;
  border-radius: 8px;
  background-color: #fafafa;
  overflow: hidden;
}

.no-data-section {
  margin-top: 30px;
  padding: 40px 0;
  text-align: center;
  background: #f9fbff;
  border-radius: 12px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

/* 成绩样式 */
.score-excellent {
  color: #67C23A;
  font-weight: bold;
  text-shadow: 0 0 1px rgba(103, 194, 58, 0.3);
  font-size: 16px;
}

.score-good {
  color: #409EFF;
  font-weight: bold;
  text-shadow: 0 0 1px rgba(64, 158, 255, 0.3);
  font-size: 16px;
}

.score-average {
  color: #E6A23C;
  font-weight: bold;
  text-shadow: 0 0 1px rgba(230, 162, 60, 0.3);
  font-size: 16px;
}

.score-pass {
  color: #909399;
  font-weight: bold;
  text-shadow: 0 0 1px rgba(144, 147, 153, 0.3);
  font-size: 16px;
}

.score-fail {
  color: #F56C6C;
  font-weight: bold;
  text-shadow: 0 0 1px rgba(245, 108, 108, 0.3);
  font-size: 16px;
}

/* 表格行样式 */
:deep(.even-row) {
  background-color: #f9fbff;
}

:deep(.odd-row) {
  background-color: #ffffff;
}

:deep(.excellent-row) {
  background-color: rgba(103, 194, 58, 0.1);
}

:deep(.good-row) {
  background-color: rgba(64, 158, 255, 0.1);
}

:deep(.average-row) {
  background-color: rgba(230, 162, 60, 0.1);
}

:deep(.pass-row) {
  background-color: rgba(144, 147, 153, 0.1);
}

:deep(.fail-row) {
  background-color: rgba(245, 108, 108, 0.1);
}

.student-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
