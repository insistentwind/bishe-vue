<template>
  <div class="myclass-container">
    <!-- 页面标题和统计区域 -->
    <div class="page-header">
      <h1>我的课程管理</h1>
      <div class="stats-cards">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <el-icon class="stats-icon" :size="32"><Collection /></el-icon>
            <div class="stats-info">
              <div class="stats-value">{{ tableData.length }}</div>
              <div class="stats-label">总课程数</div>
            </div>
          </div>
        </el-card>
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <el-icon class="stats-icon" :size="32"><Clock /></el-icon>
            <div class="stats-info">
              <div class="stats-value">{{ getTotalHours() }}</div>
              <div class="stats-label">总学时</div>
            </div>
          </div>
        </el-card>
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <el-icon class="stats-icon" :size="32"><Star /></el-icon>
            <div class="stats-info">
              <div class="stats-value">{{ getTotalScore() }}</div>
              <div class="stats-label">总学分</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 搜索和操作区域 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-area">
        <el-input 
          v-model="input" 
          placeholder="请输入课程名称或ID进行搜索" 
          clearable
          prefix-icon="Search"
          @keyup.enter="selectLesson"
        />
        <el-button type="primary" @click="selectLesson">
          <el-icon><Search /></el-icon>搜索课程
        </el-button>
        <el-button type="success" @click="fetchData">
          <el-icon><Refresh /></el-icon>刷新列表
        </el-button>
      </div>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">课程列表</span>
          <el-tag type="primary" effect="dark" size="large" round>{{ tableData.length }}个课程</el-tag>
        </div>
      </template>
      
      <el-table 
        :data="paginatedData" 
        style="width: 100%" 
        border 
        stripe
        highlight-current-row
        v-loading="loading"
        :row-class-name="tableRowClassName"
      >
        <el-table-column label="课程号" width="180">
          <template #default="scope">
            <div class="course-id-cell">
              <el-avatar :size="32" class="course-icon" :style="{ backgroundColor: getRandomColor(scope.row.lessonId) }">
                {{ (scope.row.lessonName || '课').substring(0, 1) }}
              </el-avatar>
              <span>{{ scope.row.lessonId || scope.row.id }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="课程名称" width="200">
          <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div class="popover-content">
                  <p><b>课程编号：</b>{{ scope.row.lessonId || scope.row.id }}</p>
                  <p><b>学时：</b>{{ scope.row.hours }}</p>
                  <p><b>学分：</b>{{ scope.row.score }}</p>
                  <p v-if="scope.row.introduction"><b>介绍：</b>{{ scope.row.introduction }}</p>
                </div>
              </template>
              <template #reference>
                <el-tag size="large" :type="getTagType(scope.$index)" class="course-name-tag" effect="plain">
                  {{ scope.row.lessonName }}
                </el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        
        <el-table-column label="任课教师" width="180">
          <template #default="scope">
            <div class="teacher-cell">
              <el-icon color="#409EFF" :size="18"><UserFilled /></el-icon>
              <span>{{ scope.row.teacherName || '未分配' }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="学时" width="100" align="center">
          <template #default="scope">
            <el-tag type="info" effect="plain" class="hours-tag">{{ scope.row.hours }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="学分" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getScoreTagType(scope.row.score)" effect="dark" class="score-tag">{{ scope.row.score }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button v-if="!scope.row.teacherId || scope.row.teacherId===''" type="primary" plain size="small" @click="showTeacher(scope.row.lessonId)">
                <el-icon><Plus /></el-icon>添加教师
              </el-button>
              <el-button type="success" plain size="small" @click="selectStudent(scope.row.lessonId || scope.row.id, scope.row.lessonName)">
                <el-icon><View /></el-icon>查看学生
              </el-button>
              <el-button type="info" plain size="small" @click="viewCourseDetail(scope.row)">
                <el-icon><InfoFilled /></el-icon>课程详情
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <template #empty>
          <div class="empty-data">
            <el-empty description="暂无课程数据" />
            <el-button type="primary" @click="fetchData">刷新数据</el-button>
          </div>
        </template>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-sizes="[5, 10, 20, 50]"
          v-model:page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.length"
          background
        />
      </div>
    </el-card>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="courseDetailVisible"
      title="课程详情"
      width="700px"
      align-center
    >
      <div class="course-detail-container">
        <!-- 基本信息卡片 -->
        <el-card class="course-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <div class="course-info-grid">
            <div class="info-item">
              <div class="info-label">课程ID</div>
              <div class="info-value">{{ selectedCourse.lessonId || selectedCourse.id }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">课程名称</div>
              <div class="info-value">{{ selectedCourse.lessonName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">学时</div>
              <div class="info-value">{{ selectedCourse.hours }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">学分</div>
              <div class="info-value">{{ selectedCourse.score }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">任课教师</div>
              <div class="info-value">{{ selectedCourse.teacherName || '未分配' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">开课时间</div>
              <div class="info-value">{{ selectedCourse.classTime || '暂未设置' }}</div>
            </div>
          </div>
        </el-card>
        
        <!-- 课程介绍卡片 -->
        <el-card class="course-desc-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>课程介绍</span>
            </div>
          </template>
          <div class="course-description">
            {{ selectedCourse.introduction || '暂无课程介绍' }}
          </div>
        </el-card>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="courseDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="selectStudent(selectedCourse.lessonId || selectedCourse.id, selectedCourse.lessonName)">
            查看学生
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 学生列表弹窗 -->
    <el-dialog
      v-model="studentsDialogVisible"
      :title="`${currentLessonName} - 选课学生列表`"
      width="800px"
      destroy-on-close
    >
      <div class="students-table-container">
        <el-table
          :data="paginatedStudents"
          style="width: 100%"
          border
          stripe
          v-loading="studentsLoading"
        >
          <el-table-column label="学号" prop="username" width="120" />
          <el-table-column label="姓名" prop="name" width="120" />
          <el-table-column label="学院" width="180">
            <template #default="scope">
              <span>{{ getCollegeName(scope.row.collegeId) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="性别" width="80">
            <template #default="scope">
              <el-tag size="small" :type="scope.row.sex === 1 ? 'primary' : 'danger'">
                {{ scope.row.sex === 1 ? '男' : (scope.row.sex === 0 ? '女' : '未知') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="联系方式">
            <template #default="scope">
              <div v-if="scope.row.phone || scope.row.email" class="contact-info">
                <div v-if="scope.row.phone">
                  <el-icon><Phone /></el-icon> {{ scope.row.phone }}
                </div>
                <div v-if="scope.row.email">
                  <el-icon><Message /></el-icon> {{ scope.row.email }}
                </div>
              </div>
              <span v-else>暂无联系方式</span>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 空数据显示 -->
        <template v-if="studentsList.length === 0 && !studentsLoading">
          <div class="empty-students">
            <el-empty description="暂无学生选修此课程" />
          </div>
        </template>
        
        <!-- 分页 -->
        <div class="students-pagination" v-if="studentsList.length > 0">
          <el-pagination
            v-model:current-page="studentsCurrentPage"
            v-model:page-size="studentsPageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="studentsTotal"
            background
          />
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="studentsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportStudentList">
            <el-icon><Download /></el-icon> 导出名单
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, computed} from 'vue';
import { Collection, UserFilled, Clock, Star, Plus, Search, View, Refresh, InfoFilled, Download, Phone, Message } from '@element-plus/icons-vue'
import {queryAll,queryAllByTeacherId, update,addByInfo,deleteById,addByTeacherId,queryById,queryByTeacherId, getLessonById} from "@/request/class/class";
import {ElMessage} from "element-plus";
import router from "@/router";
import {queryAll as queryStudents} from "@/request/student/student";

interface Lesson {
  id: string
  lessonId: string
  lessonName: string
  hours: string
  score: string
}
interface LessonDto {
  id: string
  lessonId: string
  introduction: string
  classTime: string
  lessonName: string
  hours: string
  score: string
  teacherId: string
  teacherName: string
}
interface Teacher {
  id: number
  collegeId: string
  teacherId: string
  teacherName: string
  teacherPassword: string
  idCardNo: string
  mobilePhone: string
  authorityId: string
  status: string
  description: string
}

interface LessonInfo {
  lessonId: string
  lessonName: string
  hours: string
  score: string
}
const form = ref<Lesson>({
  id: '-1',
  lessonId: '',
  lessonName: '',
  hours: '',
  score: '',
});
const form1 = ref<LessonInfo>({
  lessonId: '',
  lessonName: '',
  hours: '',
  score: ''
});
const centerDialogVisible = ref(false)
const centerDialogVisible1 = ref(false)
const centerDialogVisible2 = ref(false)
const input = ref<string>('')
const teacherInput=ref<string>('')
const teacher=ref<Teacher[]>([]);
const selectStudent = async (lessonId: string, lessonName?: string) => {
  if (!lessonId) {
    ElMessage.warning('课程ID不能为空');
    return;
  }
  
  console.log('查看课程的学生列表，课程ID:', lessonId);
  
  // 记录当前课程名称用于显示
  if (lessonName) {
    currentLessonName.value = lessonName;
  } else {
    // 如果没有传入课程名称，尝试从tableData中查找
    const course = tableData.value.find(item => item.lessonId === lessonId || item.id === lessonId);
    currentLessonName.value = course ? course.lessonName : `课程ID: ${lessonId}`;
  }
  
  // 显示弹窗并加载数据
  studentsDialogVisible.value = true;
  await fetchStudentsByLessonId(lessonId);
}
const showTeacher=(lessonId:string)=>{
  localStorage.setItem('lessonId', lessonId)
  centerDialogVisible2.value=true;
}
const selectTeacher=async (teacherId:string)=>{
  const res= await queryByTeacherId(teacherId);
  console.log(res.data);
  if (res.data.length == 0) {
    ElMessage.error("教师不存在");
  } else {
    ElMessage.success("请选择教师");
    teacher.value = res.data
  }
}
const addTeacherToClass=async (teacherId:string)=>{
  try {
    const res = await addByTeacherId({
      lessonId: localStorage.getItem('lessonId') || '',
      teacherId: teacherId,
    });
    
    console.log('添加教师返回数据:', res);
    
    // 判断返回值类型
    if (res === true || (res && res.code === 200)) {
      ElMessage.success("添加成功");
      teacherInput.value = '';
      centerDialogVisible2.value = false;
      await fetchData();
    } else {
      ElMessage.error(typeof res === 'object' && res?.msg ? res.msg : "添加失败");
      teacherInput.value = '';
    }
  } catch (error) {
    console.error("添加教师出错:", error);
    ElMessage.error("添加教师失败，请检查网络连接");
  }
}
const selectLesson=async ()=>{
  if(input.value==null||input.value.length==0){
    await fetchData();
  }else {
    const res=await queryById(input.value);
    if(res.data.length==0) {
      ElMessage.error("课程不存在")
    }else {
      ElMessage.success("查询成功");
      tableData.value = res.data
      console.log(res.data)
    }
    input.value='';
  }
}

const deleteLesson=async (id:string)=>{
  console.log(id)
  const res =await deleteById(id);
  console.log(res.data);
  if (res.data) {
    ElMessage.success("删除成功");
    await fetchData();
  } else {
    ElMessage.error("删除失败");
  }
}

const addLesson=()=>{
  centerDialogVisible1.value=true;
}
const add= async (data:LessonInfo)=>{
  const res=await addByInfo(data);
  console.log(res.data);
  if (res.data) {
    ElMessage.success("新增成功");
    centerDialogVisible1.value = false;
    form1.value.lessonId='';
    form1.value.lessonName='';
    form1.value.hours='';
    form1.value.score='';
    await fetchData();
  } else {
    ElMessage.error("新增失败");
    centerDialogVisible1.value = false;
  }
}
const tableData= ref<LessonDto[]>([]);
// 添加新的变量
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const courseDetailVisible = ref(false);
const selectedCourse = ref<LessonDto>({
  id: '',
  lessonId: '',
  lessonName: '',
  introduction: '',
  classTime: '',
  hours: '',
  score: '',
  teacherId: '',
  teacherName: ''
});

// 计算总学时
const getTotalHours = () => {
  return tableData.value.reduce((total, course) => {
    return total + (parseInt(course.hours) || 0);
  }, 0);
};

// 计算总学分
const getTotalScore = () => {
  return tableData.value.reduce((total, course) => {
    return total + (parseFloat(course.score) || 0);
  }, 0);
};

// 定义课程详情接口用于类型断言
interface CourseDetail {
  id?: string;
  lessonId?: string;
  lessonName?: string;
  introduction?: string;
  classTime?: string;
  hours?: string;
  score?: string;
  teacherId?: string;
  teacherName?: string;
  [key: string]: any; // 允许其他属性
}

// 查看课程详情
const viewCourseDetail = async (course: LessonDto) => {
  // 先设置基本信息，防止UI加载时显示空白
  selectedCourse.value = {...course};
  
  // 显示弹窗，后续异步获取详情
  courseDetailVisible.value = true;
  
  // 获取更详细的课程信息
  try {
    const lessonId = course.lessonId || course.id;
    if (!lessonId) {
      ElMessage.warning('课程ID不存在，无法获取详情');
      return;
    }
    
    console.log('正在获取课程详情，课程ID:', lessonId);
    
    // 使用try-catch处理可能的网络错误
    const response = await getLessonById(lessonId);
    console.log('课程详情响应:', response);
    
    // 处理不同响应格式
    let courseDetail: CourseDetail | null = null;
    
    // 由于响应拦截器，我们可能直接获取到了data部分
    if (response && typeof response === 'object') {
      // 类型断言为any，然后再具体处理
      const anyResponse = response as any;
      // 如果直接是课程对象
      courseDetail = anyResponse as CourseDetail;
    }
    
    if (courseDetail) {
      // 合并当前课程信息和获取到的详情
      selectedCourse.value = {
        ...selectedCourse.value,
        // 保留当前已有数据，只更新新获取的字段
        introduction: courseDetail.introduction || '暂无课程介绍',
        classTime: courseDetail.classTime || '暂未设置上课时间',
      };
      
      console.log('更新后的课程详情:', selectedCourse.value);
      ElMessage.success('获取课程详情成功');
    } else {
      console.warn('获取课程详情失败，使用默认值');
      // 确保这些字段有默认值
      if (!selectedCourse.value.introduction) {
        selectedCourse.value.introduction = '暂无课程介绍';
      }
      if (!selectedCourse.value.classTime) {
        selectedCourse.value.classTime = '暂未设置上课时间';
      }
    }
  } catch (error) {
    console.error('获取课程详情出错:', error);
    ElMessage.warning('获取详细信息失败，请检查网络连接');
    
    // 确保这些字段有默认值
    if (!selectedCourse.value.introduction) {
      selectedCourse.value.introduction = '暂无课程介绍';
    }
    if (!selectedCourse.value.classTime) {
      selectedCourse.value.classTime = '暂未设置上课时间';
    }
  }
};

// 计算分页数据
const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return tableData.value.slice(startIndex, endIndex);
});

// 修改fetchData函数，添加加载状态
const fetchData = () => {
  loading.value = true;
  const teacher_id = localStorage.getItem('id') || '';
  console.log('当前教师ID:', teacher_id);
  
  queryAllByTeacherId(teacher_id).then((res) => {
    console.log('后端返回数据:', res);
    
    // 直接检查返回值是否为数组
    if (Array.isArray(res)) {
      // 后端直接返回数组
      tableData.value = res;
      console.log('直接使用数组数据:', tableData.value);
    } else if (res && res.code === 200) {
      // 后端返回标准Result结构
      if (Array.isArray(res.data)) {
        tableData.value = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        tableData.value = res.data.data;
      } else if (res.data) {
        tableData.value = [res.data];
      } else {
        tableData.value = [];
      }
      console.log('处理后的数据:', tableData.value);
    } else {
      // 未知格式或请求失败
      console.error('无法识别的数据格式:', res);
      ElMessage.warning('获取数据失败，返回格式异常');
      tableData.value = [];
    }
    
    // 显示数据条数
    if (tableData.value.length > 0) {
      ElMessage.success(`成功获取 ${tableData.value.length} 条课程信息`);
    } else {
      ElMessage.info('暂无课程信息');
    }
    
    // 重置到第一页
    currentPage.value = 1;
    loading.value = false;
  }).catch((error) => {
    console.error("获取数据出错:", error);
    ElMessage.error("获取数据失败，请检查网络连接");
    tableData.value = [];
    loading.value = false;
  });
};
const updateLesson=(data:Lesson)=>{
  centerDialogVisible.value=true;
  form.value.id=data.id
  form.value.lessonId=data.lessonId
  form.value.lessonName=data.lessonName
  form.value.hours=data.hours
  form.value.score=data.score
}

const change= async (data:Lesson)=>{
  const res=await update(data);
  console.log(res.data);
  if (res.data) {
    ElMessage.success("修改成功");
    centerDialogVisible.value = false;
    await fetchData();
  } else {
    ElMessage.error("修改失败");
    centerDialogVisible.value = false;
  }
}

// 添加学院名称映射函数
const getCollegeName = (collegeId: string) => {
  const collegeMap: Record<string, string> = {
    '1': '计算机学院',
    '2': '机械工程学院',
    '3': '电气工程学院',
    '4': '材料科学与工程学院',
    '5': '经济管理学院',
    '6': '文学院',
    '7': '外国语学院',
    '8': '数学学院',
    '9': '物理学院',
    '10': '化学学院',
    // 可以根据需要添加更多学院
  };
  
  return collegeMap[collegeId] || `学院(${collegeId})`;
};

// 修改学生接口，增加username和name字段
interface Student {
  id?: number;
  studentId: string;
  studentName: string;
  username?: string;
  name?: string;
  collegeId?: string;
  classId?: string;
  className?: string;
  collegeName?: string;
  grade?: string;
  gender?: string;
  sex?: number;
  phone?: string;
  email?: string;
}

// 添加学生列表状态和相关变量
const studentsDialogVisible = ref(false);
const currentLessonName = ref('');
const studentsList = ref<Student[]>([]);
const studentsLoading = ref(false);
const studentsTotal = ref(0);
const studentsCurrentPage = ref(1);
const studentsPageSize = ref(10);

// 计算分页后的学生数据
const paginatedStudents = computed(() => {
  const startIndex = (studentsCurrentPage.value - 1) * studentsPageSize.value;
  const endIndex = startIndex + studentsPageSize.value;
  return studentsList.value.slice(startIndex, endIndex);
});

// 修改获取课程学生列表函数
const fetchStudentsByLessonId = async (lessonId: string) => {
  studentsLoading.value = true;
  studentsList.value = []; // 清空之前的数据
  
  try {
    // 使用原始API路径 /choose/all/{lessonId}
    const res = await queryStudents(lessonId);
    console.log('学生列表响应:', res);
    
    if (Array.isArray(res)) {
      studentsList.value = res;
    } else if (res && typeof res === 'object') {
      if (Array.isArray(res.data)) {
        studentsList.value = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        studentsList.value = res.data.data;
      } else if (res.data && res.data.records && Array.isArray(res.data.records)) {
        studentsList.value = res.data.records;
      }
    }
    
    // 处理返回的数据可能不包含学院、性别等字段
    studentsList.value = studentsList.value.map(student => {
      // 创建一个安全的版本，保证返回的学生记录具有必要的字段
      const safeStudent: Student = {
        studentId: student.username || student.studentId || '未知学号', // 使用username作为学号
        studentName: student.name || student.studentName || '未知姓名', // 使用name作为姓名
        collegeId: student.collegeId || '',
        gender: student.gender || '未知',
        sex: typeof student.sex === 'number' ? student.sex : (student.sex === '1' ? 1 : (student.sex === '0' ? 0 : undefined)),
        phone: student.phone || '',
        email: student.email || ''
      };
      
      // 添加可能存在的其他字段
      if (student.id !== undefined) safeStudent.id = student.id;
      if (student.username !== undefined) safeStudent.username = student.username;
      if (student.name !== undefined) safeStudent.name = student.name;
      
      // 处理接口返回的字段差异
      if ((student as any).mobilePhone) {
        safeStudent.phone = (student as any).mobilePhone;
      }
      if ((student as any).studentEmail) {
        safeStudent.email = (student as any).studentEmail;
      }
      
      return safeStudent;
    });
    
    // 重置分页
    studentsCurrentPage.value = 1;
    studentsTotal.value = studentsList.value.length;
    
    if (studentsList.value.length > 0) {
      ElMessage.success(`共找到 ${studentsList.value.length} 名学生`);
    } else {
      ElMessage.info('该课程暂无学生选课');
    }
  } catch (error) {
    console.error('获取学生列表失败:', error);
    ElMessage.error('获取学生列表失败，请稍后重试');
  } finally {
    studentsLoading.value = false;
  }
}

// 修改导出功能，使用正确的字段
const exportStudentList = () => {
  if (studentsList.value.length === 0) {
    ElMessage.warning('没有学生数据可导出');
    return;
  }
  
  try {
    // 创建CSV内容
    let csvContent = "学号,姓名,学院,性别,联系电话,邮箱\n";
    
    studentsList.value.forEach(student => {
      const studentId = student.username || student.studentId || '';
      const studentName = student.name || student.studentName || '';
      const college = getCollegeName(student.collegeId || '');
      const gender = student.sex === 1 ? '男' : (student.sex === 0 ? '女' : '未知');
      const phone = student.phone || '';
      const email = student.email || '';
      
      csvContent += `${studentId},${studentName},${college},${gender},${phone},${email}\n`;
    });
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentLessonName.value}_学生名单.csv`);
    link.style.visibility = 'hidden';
    
    // 添加到DOM、触发下载并移除
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('学生名单导出成功');
  } catch (error) {
    console.error('导出名单失败:', error);
    ElMessage.error('导出名单失败');
  }
}

// 为表格添加彩色条纹和标签颜色
const getTagType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'danger', 'info'];
  return types[index % types.length];
};

// 根据学分值生成标签类型
const getScoreTagType = (score: string) => {
  const scoreNum = parseFloat(score);
  if (scoreNum >= 4) return 'success';
  if (scoreNum >= 2) return 'primary';
  return 'warning';
};

// 根据学分值生成颜色
const getScoreColor = (score: string) => {
  const scoreNum = parseFloat(score);
  if (scoreNum >= 4) return '#67C23A';
  if (scoreNum >= 2) return '#409EFF';
  return '#E6A23C';
};

// 根据ID生成随机但固定的颜色
const getRandomColor = (id: string) => {
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };
  
  return id ? stringToColor(id) : '#409EFF';
};

// 设置表格行样式
const tableRowClassName = ({ row, rowIndex }: { row: any, rowIndex: number }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
};

onMounted(async () => {
  await fetchData();
});
</script>

<style scoped>
.myclass-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #303133;
  font-weight: 600;
  position: relative;
  padding-left: 15px;
}

.page-header h1:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, #409EFF, #87CEFA);
  border-radius: 2px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stats-card {
  flex: 1;
  min-width: 200px;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stats-content {
  display: flex;
  align-items: center;
  padding: 5px;
}

.stats-icon {
  color: #409EFF;
  margin-right: 20px;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 8px;
}

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.search-area {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-area .el-input {
  max-width: 400px;
}

.table-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 表格相关样式 */
.course-id-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.course-icon {
  color: white;
  font-weight: bold;
}

.teacher-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-name-tag {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
}

.hours-tag {
  font-size: 14px;
}

.score-tag {
  font-size: 14px;
  padding: 2px 10px;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 表格行样式 */
:deep(.even-row) {
  background-color: #fafafa;
}

:deep(.odd-row) {
  background-color: #ffffff;
}

:deep(.el-table tr:hover > td) {
  background-color: rgba(64, 158, 255, 0.1) !important;
}

/* 减小表格行间距 */
:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-table .cell) {
  padding-left: 8px;
  padding-right: 8px;
}

.popover-content {
  padding: 5px;
}

.popover-content p {
  margin: 6px 0;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.empty-data .el-button {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.students-table-container {
  max-height: 400px;
  overflow: auto;
}

.empty-students {
  padding: 20px;
  text-align: center;
}

.students-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

/* 课程详情样式 */
.course-detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.course-info-card {
  flex: 1;
}

.course-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.info-item:hover {
  background-color: #eef5fe;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.info-label {
  font-weight: bold;
  color: #606266;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-value {
  font-size: 16px;
  color: #303133;
}

.course-desc-card {
  flex: 1;
}

.course-description {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  min-height: 80px;
}
</style>
