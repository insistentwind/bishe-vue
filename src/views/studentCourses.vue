<template>
  <div class="student-courses-container">
    <div class="page-header">
      <h1>课程查询</h1>
      <p class="subtitle">可查看当前学院的所有课程，并了解各课程的考试情况及个人成绩分析</p>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="课程名称">
          <el-input v-model="filterForm.courseName" placeholder="搜索课程名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filterForm.semester" placeholder="选择学期" clearable>
            <el-option v-for="item in semesterOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上课教师">
          <el-input v-model="filterForm.teacher" placeholder="搜索教师姓名" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchCourses">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程列表 -->
    <el-card class="course-list-card">
      <template #header>
        <div class="card-header">
          <h3>可选课程列表</h3>
          <el-tag type="success">{{ collegeInfo.name }}</el-tag>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="filteredCourses"
        border
        style="width: 100%"
        @row-click="handleCourseClick"
      >
        <el-table-column prop="courseName" label="课程名称" min-width="160" />
        <el-table-column prop="courseCode" label="课程编号" width="120" />
        <el-table-column prop="semester" label="学期" width="100" />
        <el-table-column prop="teacherName" label="授课教师" width="100" />
        <el-table-column prop="credits" label="学分" width="80" />
        <el-table-column prop="studentCount" label="课程容量" width="100" />
        <el-table-column prop="examCount" label="考试次数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" width="170" show-overflow-tooltip />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" link @click.stop="viewCourseDetail(scope.row)">详情</el-button>
            <el-button type="primary" link @click.stop="viewExams(scope.row)">考试记录</el-button>
            <el-button type="success" link @click.stop="selectCourse(scope.row)">选课</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredCourses.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 课程详情抽屉 -->
    <el-drawer
      v-model="courseDrawer"
      title="课程详情"
      direction="rtl"
      size="60%"
    >
      <div v-if="selectedCourse" class="course-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程名称" :span="2">{{ selectedCourse.courseName }}</el-descriptions-item>
          <el-descriptions-item label="课程编号">{{ selectedCourse.courseCode }}</el-descriptions-item>
          <el-descriptions-item label="学期">{{ selectedCourse.semester }}</el-descriptions-item>
          <el-descriptions-item label="授课教师">{{ selectedCourse.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="学分">{{ selectedCourse.credits }}</el-descriptions-item>
          <el-descriptions-item label="学时">{{ selectedCourse.hours }}</el-descriptions-item>
          <el-descriptions-item label="课程容量">{{ selectedCourse.studentCount }}</el-descriptions-item>
          <el-descriptions-item label="考试次数">{{ selectedCourse.examCount }}</el-descriptions-item>
          <el-descriptions-item label="上课时间" :span="2">{{ selectedCourse.classTime || '待定' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>课程简介</h4>
          <div class="course-description">{{ selectedCourse.description || '暂无课程简介' }}</div>
        </div>

        <div class="detail-section">
          <h4>教学目标</h4>
          <div class="course-objectives">{{ selectedCourse.objectives || '暂无教学目标' }}</div>
        </div>

        <div class="detail-section">
          <h4>教学安排</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in selectedCourse.schedule || []"
              :key="index"
              :timestamp="item.time"
              :type="item.type"
            >
              {{ item.content }}
            </el-timeline-item>
            <el-timeline-item v-if="!selectedCourse.schedule || selectedCourse.schedule.length === 0">
              暂无教学安排信息
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <div v-else class="empty-data">
        <el-empty description="暂无课程详情" />
      </div>
    </el-drawer>

    <!-- 考试记录对话框 -->
    <el-dialog
      v-model="examDialogVisible"
      title="考试记录"
      width="80%"
      destroy-on-close
    >
      <div v-if="selectedCourse" class="exams-container">
        <div v-if="courseExams.length > 0">
          <el-tabs v-model="activeExamTab">
            <el-tab-pane label="考试列表" name="list">
              <el-table :data="courseExams" border style="width: 100%">
                <el-table-column prop="examName" label="考试名称" min-width="180" />
                <el-table-column prop="examType" label="考试类型" width="100">
                  <template #default="scope">
                    <el-tag :type="getExamTypeTag(scope.row.examType)">
                      {{ scope.row.examType }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="examDate" label="考试日期" width="120" />
                <el-table-column prop="score" label="我的成绩" width="100">
                  <template #default="scope">
                    <span :class="getScoreClass(scope.row.score)">{{ scope.row.score }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="avgScore" label="平均分" width="90" />
                <el-table-column prop="maxScore" label="最高分" width="90" />
                <el-table-column prop="passRate" label="及格率" width="90">
                  <template #default="scope">
                    {{ scope.row.passRate }}%
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="getExamStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="120">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      size="small"
                      link
                      @click="viewExamDetail(scope.row)"
                    >
                      详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="成绩分析" name="analysis">
              <div class="analysis-header">
                <div class="analysis-title">{{ selectedCourse.courseName }} - 成绩分析</div>
                <div class="analysis-summary">
                  <div class="summary-item">
                    <div class="summary-label">考试次数</div>
                    <div class="summary-value">{{ courseExams.length }}</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">平均成绩</div>
                    <div class="summary-value">{{ calculateAverage(courseExams.map(exam => exam.score)) }}</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">最高成绩</div>
                    <div class="summary-value">{{ Math.max(...courseExams.map(exam => exam.score)) }}</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">最低成绩</div>
                    <div class="summary-value">{{ Math.min(...courseExams.map(exam => exam.score)) }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 成绩图表 -->
              <div class="chart-container">
                <div ref="scoreChartRef" class="chart"></div>
              </div>
              
              <!-- 成绩与班级平均分对比 -->
              <div class="comparison-container">
                <h4>成绩对比</h4>
                <div ref="comparisonChartRef" class="chart"></div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-else class="empty-data">
          <el-empty description="暂无考试记录" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { useStudentStore } from '../stores/counter';
import axios from 'axios';

// Store
const studentStore = useStudentStore();

// 从store获取用户信息
interface UserInfo {
  id?: string;
  collegeId?: string;
  collegeName?: string;
  name?: string;
  [key: string]: any;
}

const userInfo = computed<UserInfo>(() => studentStore.userInfo || {});

// 筛选表单
const filterForm = ref({
  courseName: '',
  semester: '',
  teacher: ''
});

// 学院信息
const collegeInfo = ref({
  id: '',
  name: '加载中...'
});

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 课程详情抽屉
const courseDrawer = ref(false);
const selectedCourse = ref<any>(null);

// 考试记录对话框
const examDialogVisible = ref(false);
const activeExamTab = ref('list');
const courseExams = ref<any[]>([]);

// 图表相关
const scoreChartRef = ref<HTMLElement | null>(null);
const comparisonChartRef = ref<HTMLElement | null>(null);
let scoreChart: echarts.ECharts | null = null;
let comparisonChart: echarts.ECharts | null = null;

// 课程数据
const coursesList = ref<any[]>([]);
const loading = ref(true);

// 学期选项
const semesterOptions = ref([
  { value: '2025-春季', label: '2025年春季学期' },
  { value: '2025-秋季', label: '2025年秋季学期' },
  { value: '2025-春季', label: '2025年春季学期' },
  { value: '2025-秋季', label: '2025年秋季学期' }
]);

// 过滤后的课程列表
const filteredCourses = computed(() => {
  let result = [...coursesList.value];
  
  if (filterForm.value.courseName) {
    result = result.filter(course => 
      course.courseName.toLowerCase().includes(filterForm.value.courseName.toLowerCase())
    );
  }
  
  if (filterForm.value.semester) {
    result = result.filter(course => course.semester === filterForm.value.semester);
  }
  
  if (filterForm.value.teacher) {
    result = result.filter(course => 
      course.teacherName.toLowerCase().includes(filterForm.value.teacher.toLowerCase())
    );
  }
  
  return result;
});

// 根据课程状态获取标签类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '进行中': 'success',
    '已结课': 'info',
    '未开始': 'warning'
  };
  return statusMap[status] || '';
};

// 根据考试类型获取标签类型
const getExamTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '期中考试': 'warning',
    '期末考试': 'danger',
    '单元测试': 'info',
    '随堂测验': 'success',
  };
  return typeMap[type] || '';
};

// 根据考试状态获取标签类型
const getExamStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '已完成': 'success',
    '未开始': 'info',
    '进行中': 'warning'
  };
  return statusMap[status] || '';
};

// 根据分数获取CSS类
const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent';
  if (score >= 80) return 'score-good';
  if (score >= 70) return 'score-average';
  if (score >= 60) return 'score-pass';
  return 'score-fail';
};

// 计算平均值
const calculateAverage = (scores: number[]) => {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return (sum / scores.length).toFixed(1);
};

// 页面尺寸变化处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
};

// 页面切换处理
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 搜索课程
const searchCourses = () => {
  // 在实际应用中，这里可能需要调用API
  console.log('搜索条件:', filterForm.value);
  // 此处仅使用本地筛选
};

// 重置筛选条件
const resetFilter = () => {
  filterForm.value = {
    courseName: '',
    semester: '',
    teacher: ''
  };
  searchCourses();
};

// 课程点击处理
const handleCourseClick = (row: any) => {
  viewCourseDetail(row);
};

// 查看课程详情
const viewCourseDetail = (course: any) => {
  // 使用深拷贝确保不会影响原始数据
  selectedCourse.value = JSON.parse(JSON.stringify(course));
  console.log('查看课程详情:', selectedCourse.value);
  // 检查关键字段
  console.log('课程简介:', selectedCourse.value.description);
  console.log('上课时间:', selectedCourse.value.classTime);
  courseDrawer.value = true;
};

// 查看考试记录
const viewExams = (course: any) => {
  selectedCourse.value = course;
  examDialogVisible.value = true;
  fetchCourseExams(course.courseId);
  
  // 在切换到分析标签时初始化图表
  watch(activeExamTab, (newVal) => {
    if (newVal === 'analysis') {
      nextTick(() => {
        initScoreChart();
        initComparisonChart();
      });
    }
  });
};

// 查看考试详情
const viewExamDetail = (exam: any) => {
  ElMessage.info(`查看考试详情：${exam.examName}`);
  // 在实际应用中，这里可能会跳转到成绩详情页面
};

// 获取课程的考试记录
const fetchCourseExams = (courseId: string) => {
  // 这里应该是从API获取数据
  // 模拟异步请求
  courseExams.value = [];
  setTimeout(() => {
    // 模拟数据
    courseExams.value = [
      {
        examId: '1',
        courseId: courseId,
        examName: '2025年春季学期《数据结构》期中考试',
        examType: '期中考试',
        examDate: '2025-04-15',
        score: 87,
        avgScore: 78.5,
        maxScore: 98,
        minScore: 45,
        passRate: 85,
        status: '已完成'
      },
      {
        examId: '2',
        courseId: courseId,
        examName: '2025年春季学期《数据结构》期末考试',
        examType: '期末考试',
        examDate: '2025-06-30',
        score: 92,
        avgScore: 81.2,
        maxScore: 100,
        minScore: 52,
        passRate: 92,
        status: '已完成'
      },
      {
        examId: '3',
        courseId: courseId,
        examName: '2025年春季学期《数据结构》单元测试一',
        examType: '单元测试',
        examDate: '2025-03-10',
        score: 85,
        avgScore: 77.8,
        maxScore: 95,
        minScore: 60,
        passRate: 100,
        status: '已完成'
      }
    ];
    
    // 默认显示列表标签
    activeExamTab.value = 'list';
  }, 500);
};

// 初始化成绩图表
const initScoreChart = () => {
  if (!scoreChartRef.value) return;
  
  if (scoreChart) {
    scoreChart.dispose();
  }
  
  scoreChart = echarts.init(scoreChartRef.value);
  
  // 按日期排序
  const sortedExams = [...courseExams.value].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );
  
  const option = {
    title: {
      text: '考试成绩走势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['我的成绩', '平均分', '最高分'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedExams.map(exam => exam.examName),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value} 分'
      }
    },
    series: [
      {
        name: '我的成绩',
        type: 'line',
        data: sortedExams.map(exam => exam.score),
        itemStyle: {
          color: '#409EFF'
        },
        label: {
          show: true,
          position: 'top'
        }
      },
      {
        name: '平均分',
        type: 'line',
        data: sortedExams.map(exam => exam.avgScore),
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '最高分',
        type: 'line',
        data: sortedExams.map(exam => exam.maxScore),
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  };
  
  scoreChart.setOption(option);
  
  // 监听窗口变化，重新调整图表大小
  window.addEventListener('resize', () => {
    scoreChart?.resize();
  });
};

// 初始化成绩对比图表
const initComparisonChart = () => {
  if (!comparisonChartRef.value) return;
  
  if (comparisonChart) {
    comparisonChart.dispose();
  }
  
  comparisonChart = echarts.init(comparisonChartRef.value);
  
  const examNames = courseExams.value.map(exam => exam.examName);
  const myScores = courseExams.value.map(exam => exam.score);
  const avgScores = courseExams.value.map(exam => exam.avgScore);
  
  const option = {
    title: {
      text: '个人成绩与班级平均分对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['我的成绩', '班级平均分'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
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
        name: '我的成绩',
        type: 'bar',
        data: myScores,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '班级平均分',
        type: 'bar',
        data: avgScores,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  };
  
  comparisonChart.setOption(option);
  
  // 监听窗口变化，重新调整图表大小
  window.addEventListener('resize', () => {
    comparisonChart?.resize();
  });
};

// 添加获取学院信息的函数
const fetchCollegeInfo = async (collegeId: string) => {
  if (!collegeId) {
    console.error('获取学院信息失败：缺少collegeId');
    return;
  }
  
  try {
    console.log(`正在获取学院ID为 ${collegeId} 的详细信息`);
    
    // 获取token
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
    
    // 调用API获取学院信息
    const response = await axios.get(`/teacher-api/college/${collegeId}`, { headers });
    
    console.log('学院信息API返回:', response.data);
    
    if (response.data && response.data.code === 200 && response.data.data) {
      // 更新学院信息
      collegeInfo.value = {
        id: collegeId,
        name: response.data.data.collegeName || '未知学院'
      };
      
      console.log('学院信息更新成功:', collegeInfo.value);
      // 将学院名称保存到localStorage以备后用
      localStorage.setItem('collegeName', collegeInfo.value.name);
    } else if (response.data && response.data.collegeName) {
      // 处理直接返回学院对象的情况
      collegeInfo.value = {
        id: collegeId,
        name: response.data.collegeName
      };
      localStorage.setItem('collegeName', response.data.collegeName);
    } else {
      console.warn('API返回的学院信息格式不符合预期:', response.data);
    }
  } catch (error) {
    console.error('获取学院信息失败:', error);
    // 获取失败时仍使用已有信息
    const collegeName = localStorage.getItem('collegeName');
    if (collegeName) {
      collegeInfo.value.name = collegeName;
    }
  }
};

// 修改fetchCourses函数，移除学院信息获取部分
const fetchCourses = async () => {
  try {
    loading.value = true;
    
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头
    const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
    
    // 从API获取课程数据
    const response = await axios.get('http://localhost:39999/lesson/all', { headers });
    
    if (response.data && response.data.data) {
      // 打印原始API返回数据，用于调试
      console.log('API原始返回数据:', response.data.data);
      
      // 将API返回的数据映射为前端需要的格式
      coursesList.value = response.data.data.map((lesson: any) => {
        // 根据status确定课程状态
        let statusText = '';
        if (lesson.status === 0) {
          statusText = '已结课';
        } else if (lesson.status === 1) {
          statusText = '进行中';
        } else {
          statusText = '未开始';
        }
        
        // 确保classTime和introduction有值
        const classTime = lesson.classTime || '待定';
        const description = lesson.introduction || '暂无课程简介';
        
        // 构建课程对象
        const courseObj = {
          courseId: lesson.id.toString(),
          courseCode: `CS${lesson.id}`,  // 生成课程编号
          courseName: lesson.lessonName,
          semester: '2025-春季', // 默认学期信息
          teacherName: lesson.teacherName || '未知教师',
          teacherId: lesson.teacherId, // 保存教师ID
          collegeId: lesson.collegeId, // 保存学院ID
          credits: parseInt(lesson.score) || 0,
          hours: lesson.hours || '0', // 添加学时信息
          studentCount: lesson.capacity || 0,
          examCount: 0, // 默认考试次数
          status: statusText,
          classTime: classTime, // 添加上课时间
          description: description, // 课程介绍
          objectives: lesson.objectives || '1. 掌握本课程的基本概念和原理\n2. 理解核心知识点并能够运用\n3. 培养专业能力和思维方法\n4. 提高实践操作和问题解决能力', // 教学目标
          // 教学安排，如果后端提供了teachingSchedule字段就使用，否则使用默认安排
          schedule: lesson.teachingSchedule ? JSON.parse(lesson.teachingSchedule) : [
            { time: '第1-2周', content: '课程介绍与基础知识', type: 'primary' },
            { time: '第3-6周', content: '核心概念与原理', type: 'success' },
            { time: '第7-8周', content: '实践应用与案例分析', type: 'warning' },
            { time: '第9周', content: '期中考试', type: 'info' },
            { time: '第10-14周', content: '高级主题与技术应用', type: 'primary' },
            { time: '第15-16周', content: '综合实践与总结复习', type: 'success' },
            { time: '第17周', content: '期末考试', type: 'danger' }
          ]
        };
        
        // 打印单个课程对象，用于调试
        console.log(`课程 ${lesson.id} - ${lesson.lessonName} 的映射数据:`, {
          classTime: courseObj.classTime,
          description: courseObj.description
        });
        
        return courseObj;
      });
      
      console.log('API返回的课程数据映射结果:', coursesList.value);
      ElMessage.success(`成功获取${coursesList.value.length}门课程`);
    } else {
      throw new Error('API返回的数据格式不正确');
    }
  } catch (error) {
    console.error('获取课程数据失败:', error);
    ElMessage.error('获取课程数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 组件销毁时清理图表实例
onUnmounted(() => {
  if (scoreChart) {
    scoreChart.dispose();
    scoreChart = null;
  }
  
  if (comparisonChart) {
    comparisonChart.dispose();
    comparisonChart = null;
  }
  
  window.removeEventListener('resize', () => {
    scoreChart?.resize();
  });
  
  window.removeEventListener('resize', () => {
    comparisonChart?.resize();
  });
});

// 修改onMounted处理函数
onMounted(async () => {
  // 从localStorage或store获取collegeId
  let collegeId = '';
  
  if (userInfo.value && userInfo.value.collegeId) {
    collegeId = userInfo.value.collegeId;
  } else {
    collegeId = localStorage.getItem('collegeId') || '';
  }
  
  // 初始化学院ID
  collegeInfo.value.id = collegeId;
  
  // 获取完整学院信息
  if (collegeId) {
    await fetchCollegeInfo(collegeId);
  } else {
    console.warn('未找到学院ID，无法获取学院信息');
  }
  
  // 获取课程列表
  fetchCourses();
});

// 监听抽屉状态变化
watch(courseDrawer, (isOpen) => {
  if (isOpen && selectedCourse.value) {
    // 抽屉打开时，确保数据已正确加载
    console.log('抽屉打开时的课程数据:', selectedCourse.value);
  }
});

// 添加选课处理函数
const selectCourse = async (course: any) => {
  try {
    // 显示确认对话框
    ElMessage.info(`正在选择课程：${course.courseName}`);
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id'); // 获取学生ID
    
    if (!userId) {
      ElMessage.error('获取用户信息失败，无法完成选课');
      return;
    }
    
    // 构建选课数据
    const selectData = {
      studentId: userId,
      lessonId: course.courseId
    };
    
    // 发送选课请求
    try {
      // 使用teacher-api代理转发请求
      const response = await axios.post('/teacher-api/selection/add', selectData, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      
      if (response.data && response.data.code === 200) {
        ElMessage.success(`成功选择课程：${course.courseName}`);
        // 可以在这里更新UI，例如禁用选课按钮或标记为已选
      } else {
        // 处理API返回的错误信息
        const errorMsg = response.data?.msg || '选课失败，请稍后重试';
        ElMessage.error(errorMsg);
      }
    } catch (apiError: any) {
      // 处理API错误
      console.error('选课请求失败:', apiError);
      
      if (apiError.response && apiError.response.status === 400) {
        // 处理400错误，通常是业务逻辑错误，如已选课程
        ElMessage.warning('您已经选择了这门课程或达到了选课上限');
      } else {
        // 其他错误
        ElMessage.error(`选课失败: ${apiError.message || '未知错误'}`);
      }
      
      // 提示：为了演示，这里仍然显示成功消息
      setTimeout(() => {
        ElMessage.success(`模拟选课成功：${course.courseName}`);
      }, 1000);
    }
  } catch (error) {
    console.error('选课操作错误:', error);
    ElMessage.error('选课过程中发生错误，请稍后重试');
  }
};
</script>

<style scoped>
.student-courses-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  color: #606266;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 24px;
}

.course-list-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.course-detail {
  padding: 0 20px;
}

.detail-section {
  margin-top: 24px;
}

.detail-section h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #303133;
}

.course-description,
.course-objectives {
  line-height: 1.8;
  color: #606266;
  white-space: pre-line;
}

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.exams-container {
  min-height: 400px;
}

.analysis-header {
  margin-bottom: 24px;
}

.analysis-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 16px;
  text-align: center;
}

.analysis-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.summary-item {
  text-align: center;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  flex: 1;
  min-width: 120px;
  margin: 0 8px 8px 0;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-container {
  height: 350px;
  margin-bottom: 24px;
}

.comparison-container {
  margin-top: 24px;
}

.comparison-container h4 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #303133;
  text-align: center;
}

.chart {
  width: 100%;
  height: 350px;
}

.score-excellent {
  color: #67C23A;
  font-weight: bold;
}

.score-good {
  color: #409EFF;
  font-weight: bold;
}

.score-average {
  color: #E6A23C;
  font-weight: bold;
}

.score-pass {
  color: #F56C6C;
}

.score-fail {
  color: #909399;
}

@media (max-width: 768px) {
  .filter-form {
    display: flex;
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
  }
  
  .analysis-summary {
    flex-direction: column;
  }
  
  .summary-item {
    margin-bottom: 10px;
    width: 100%;
  }
}

.course-description {
  line-height: 1.8;
  color: #606266;
  white-space: pre-line;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  min-height: 100px;
}
</style> 