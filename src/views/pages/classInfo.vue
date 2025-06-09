<template>
  <div class="class-info-container">
    <el-card class="student-info-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="header-icon"><el-icon><UserFilled /></el-icon></span>
            <span>学生信息</span>
          </div>
          <el-tag effect="dark" type="primary">{{ currentSemester }}</el-tag>
        </div>
      </template>
      
      <el-descriptions :column="3" border size="large">
        <el-descriptions-item label="学号">{{ studentInfo.studentId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ studentInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ studentInfo.gender }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ studentInfo.major }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ studentInfo.grade }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ studentInfo.className }}</el-descriptions-item>
        <el-descriptions-item label="所属学院" :span="3">{{ studentInfo.collegeName }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card class="class-detail-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="header-icon"><el-icon><School /></el-icon></span>
            <span>班级详情</span>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="class-basic-info">
            <h3>基本信息</h3>
            <el-descriptions :column="1" border direction="vertical">
              <el-descriptions-item label="班级名称">{{ classInfo.className }}</el-descriptions-item>
              <el-descriptions-item label="班主任">{{ classInfo.headTeacher }}</el-descriptions-item>
              <el-descriptions-item label="联系方式">{{ classInfo.contactEmail }}</el-descriptions-item>
              <el-descriptions-item label="班级人数">{{ classInfo.studentCount }} 人</el-descriptions-item>
              <el-descriptions-item label="所属学院">{{ classInfo.college }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="class-stats">
            <h3>班级统计</h3>
            <div class="stats-card">
              <div class="stats-item">
                <div class="stats-value">{{ classStats.averageScore.toFixed(1) }}</div>
                <div class="stats-label">平均成绩</div>
              </div>
              <div class="stats-item">
                <div class="stats-value">{{ classStats.excellentRate }}%</div>
                <div class="stats-label">优秀率</div>
              </div>
              <div class="stats-item">
                <div class="stats-value">{{ classStats.passRate }}%</div>
                <div class="stats-label">及格率</div>
              </div>
              <div class="stats-item">
                <div class="stats-value">{{ classStats.scholarshipCount }}</div>
                <div class="stats-label">奖学金人数</div>
              </div>
            </div>
            
            <h3>班级简介</h3>
            <div class="class-description">
              {{ classInfo.description }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="classmates-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span class="header-icon"><el-icon><Collection /></el-icon></span>
            <span>班级同学</span>
          </div>
          <div class="header-tools">
            <el-input 
              v-model="searchText" 
              placeholder="搜索同学姓名" 
              clearable 
              style="width: 200px; margin-right: 10px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterPosition" placeholder="职务筛选" clearable style="width: 140px;">
              <el-option label="全部" value="" />
              <el-option label="班长" value="班长" />
              <el-option label="学习委员" value="学习委员" />
              <el-option label="生活委员" value="生活委员" />
              <el-option label="团支书" value="团支书" />
              <el-option label="文艺委员" value="文艺委员" />
              <el-option label="普通学生" value="普通学生" />
            </el-select>
          </div>
        </div>
      </template>
      
      <el-table
        :data="filteredClassmates"
        style="width: 100%"
        :row-class-name="tableRowClassName"
        border
        stripe
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100">
          <template #default="scope">
            <div class="student-name">
              <span>{{ scope.row.name }}</span>
              <el-tag 
                v-if="scope.row.studentId === studentInfo.studentId" 
                size="small" 
                effect="plain" 
                type="success"
              >
                我
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            <el-tag 
              :type="scope.row.gender === '男' ? 'primary' : 'danger'" 
              size="small"
              effect="plain"
            >
              {{ scope.row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="班级职务" width="120">
          <template #default="scope">
            <el-tag 
              v-if="scope.row.position !== '普通学生'" 
              type="warning" 
              size="small"
            >
              {{ scope.row.position }}
            </el-tag>
            <span v-else>{{ scope.row.position }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contactInfo" label="联系方式" />
        <el-table-column prop="birthday" label="生日" width="110" />
        <el-table-column prop="hometown" label="籍贯" width="120" />
      </el-table>
      
      <div class="table-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredTotalCount"
          layout="total, prev, pager, next"
          background
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { UserFilled, School, Collection, Search } from '@element-plus/icons-vue';
import axios from 'axios';

// 定义类型
interface StudentInfo {
  studentId: string;
  name: string;
  gender: string;
  major: string;
  grade: string;
  className: string;
  birthday?: string;
  hometown?: string;
  collegeName?: string; // 添加学院名称字段
}

interface ClassInfo {
  className: string;
  headTeacher: string;
  contactEmail: string;
  studentCount: number;
  college: string;
  description: string;
}

interface ClassStats {
  averageScore: number;
  excellentRate: number;
  passRate: number;
  scholarshipCount: number;
}

interface Classmate {
  studentId: string;
  name: string;
  gender: string;
  position: string;
  contactInfo: string;
  birthday: string;
  hometown: string;
}

// 添加学院信息接口
interface College {
  collegeId: string;
  collegeName: string;
  // 其他学院相关字段
}

// 添加班级接口
interface ClassVo {
  id: number;
  className: string;
  collegeId: string;
  major: string;
  grade: number;
  createTime: Date;
  updateTime: Date;
  studentNumber: number;
  teacherId: number;
  instruction: string; // 添加班级简介字段
}

// 添加用户接口
interface UserVo {
  id: number;
  collegeId: number;
  name: string;
  username: string;
  phone: string;
  sex: number;
  avatar: string;
  description: string;
  email: string;
  identity: string;
  // 其他用户信息字段
}

// 当前学期
const currentSemester = ref('2025-2026 第二学期');

// 学生信息
const studentInfo = ref<StudentInfo>({
  studentId: '',
  name: '',
  gender: '',
  major: '计算机科学与技术',
  grade: '2025级',
  className: '计算机科学与技术1班',
  birthday: '2006-01-15',
  hometown: '北京市',
  collegeName: ''
});

// 班级信息
const classInfo = ref<ClassInfo>({
  className: '计算机科学与技术1班',
  headTeacher: '李教授',
  contactEmail: 'liteacher@example.com',
  studentCount: 35,
  college: '信息科学与工程学院',
  description: '本班级成立于2025年3月，是计算机科学与技术专业的重点班级。以培养高素质的计算机科学技术人才为目标，注重理论与实践相结合，鼓励创新精神和实践能力的培养。班级氛围活跃，学习氛围浓厚，同学们积极参与各类学科竞赛和课外实践活动。'
});

// 班级统计
const classStats = ref<ClassStats>({
  averageScore: 85.6,
  excellentRate: 40,
  passRate: 98,
  scholarshipCount: 10
});

// 班级同学列表
const classmates = ref<Classmate[]>([
  { studentId: '20250001', name: '张三', gender: '男', position: '班长', contactInfo: '13800138001', birthday: '2006-01-15', hometown: '北京市' },
  { studentId: '20250002', name: '李四', gender: '男', position: '学习委员', contactInfo: '13800138002', birthday: '2006-02-20', hometown: '上海市' },
  { studentId: '20250003', name: '王五', gender: '男', position: '组织委员', contactInfo: '13800138003', birthday: '2006-03-12', hometown: '广州市' },
  { studentId: '20250004', name: '赵六', gender: '男', position: '普通学生', contactInfo: '13800138004', birthday: '2006-04-05', hometown: '深圳市' },
  { studentId: '20250005', name: '周七', gender: '男', position: '普通学生', contactInfo: '13800138005', birthday: '2006-05-18', hometown: '南京市' },
  { studentId: '20250006', name: '吴八', gender: '男', position: '普通学生', contactInfo: '13800138006', birthday: '2006-06-22', hometown: '杭州市' },
  { studentId: '20250007', name: '郑九', gender: '男', position: '普通学生', contactInfo: '13800138007', birthday: '2006-07-30', hometown: '武汉市' },
  { studentId: '20250008', name: '钱十', gender: '男', position: '普通学生', contactInfo: '13800138008', birthday: '2006-08-08', hometown: '成都市' },
  { studentId: '20250009', name: '孙十一', gender: '男', position: '普通学生', contactInfo: '13800138009', birthday: '2006-09-10', hometown: '重庆市' },
  { studentId: '20250010', name: '周十二', gender: '男', position: '普通学生', contactInfo: '13800138010', birthday: '2006-10-05', hometown: '西安市' },
  { studentId: '20250011', name: '吴十三', gender: '男', position: '普通学生', contactInfo: '13800138011', birthday: '2006-11-15', hometown: '长沙市' },
  { studentId: '20250012', name: '郑十四', gender: '男', position: '普通学生', contactInfo: '13800138012', birthday: '2006-12-20', hometown: '贵阳市' },
  { studentId: '20250013', name: '王十五', gender: '女', position: '普通学生', contactInfo: '13800138013', birthday: '2006-02-25', hometown: '昆明市' },
  { studentId: '20250014', name: '赵十六', gender: '女', position: '文艺委员', contactInfo: '13800138014', birthday: '2006-03-08', hometown: '南宁市' },
  { studentId: '20250015', name: '钱十七', gender: '女', position: '普通学生', contactInfo: '13800138015', birthday: '2006-04-12', hometown: '海口市' },
  { studentId: '20250016', name: '孙十八', gender: '女', position: '普通学生', contactInfo: '13800138016', birthday: '2006-05-01', hometown: '福州市' },
  { studentId: '20250017', name: '李十九', gender: '女', position: '团支书', contactInfo: '13800138017', birthday: '2006-06-15', hometown: '厦门市' },
  { studentId: '20250018', name: '周二十', gender: '女', position: '生活委员', contactInfo: '13800138018', birthday: '2006-07-22', hometown: '太原市' }
]);

// 搜索和筛选
const searchText = ref('');
const filterPosition = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// 表格行样式
const tableRowClassName = ({ row }: { row: Classmate }) => {
  if (row.studentId === studentInfo.value.studentId) {
    return 'current-student-row';
  }
  return '';
};

// 过滤后的班级同学列表
const filteredClassmates = computed(() => {
  const filtered = classmates.value.filter(item => {
    const matchesSearch = searchText.value 
      ? item.name.includes(searchText.value) || item.studentId.includes(searchText.value)
      : true;
    const matchesPosition = filterPosition.value
      ? item.position === filterPosition.value
      : true;
    return matchesSearch && matchesPosition;
  });
  
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  
  return filtered.slice(start, end);
});

// 过滤后的总数量
const filteredTotalCount = computed(() => {
  return classmates.value.filter(item => {
    const matchesSearch = searchText.value 
      ? item.name.includes(searchText.value) || item.studentId.includes(searchText.value)
      : true;
    const matchesPosition = filterPosition.value
      ? item.position === filterPosition.value
      : true;
    return matchesSearch && matchesPosition;
  }).length;
});

// 分页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 存储学院信息映射
const collegeMap = ref<Record<string, string>>({});

// 获取所有学院信息
const fetchColleges = async () => {
  try {
    // 从localStorage获取JWT令牌
    const token = localStorage.getItem('token');
    const headers = { 'token': token || '' };
    
    // 添加加载状态指示
    const loading = ElMessage({
      message: '正在加载学院信息...',
      type: 'info',
      duration: 0
    });
    
    const response = await axios.get('http://localhost:39999/college/all', { headers });
    
    // 关闭加载提示
    loading.close();
    
    if (response.data && response.data.data) {
      const colleges = response.data.data as College[];
      
      // 创建学院ID到学院名称的映射
      colleges.forEach(college => {
        collegeMap.value[college.collegeId] = college.collegeName;
      });
      
      console.log('已加载学院映射:', collegeMap.value);
      return true;
    } else {
      ElMessage.warning('未获取到学院信息，使用默认数据');
      return true; // 返回true以便页面继续加载
    }
  } catch (error) {
    console.error('获取学院信息失败:', error);
    ElMessage.error('获取学院信息失败，使用默认数据');
    return true; // 即使出错也返回true，让页面继续加载
  }
};

// 获取班级信息
const fetchClassInfo = async () => {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头
    const headers = { 
      'token': token || ''
    };
    
    const loading = ElMessage({
      message: '正在加载班级信息...',
      type: 'info',
      duration: 0
    });
    
    // 调用获取班级信息的API
    const response = await axios.get('http://localhost:39999/class/getClass', { headers });
    
    loading.close();
    
    if (response.data && response.data.data) {
      const classData = response.data.data as ClassVo;
      console.log('获取到的班级信息:', classData);
      
      // 更新班级信息
      classInfo.value.className = classData.className;
      classInfo.value.studentCount = classData.studentNumber;
      classInfo.value.college = collegeMap.value[classData.collegeId] || '未知学院';
      
      // 如果有班级简介，更新班级描述
      if (classData.instruction) {
        classInfo.value.description = classData.instruction;
      }
      
      // 更新学生信息
      studentInfo.value.className = classData.className;
      studentInfo.value.major = classData.major;
      studentInfo.value.grade = `${classData.grade}级`;
      
      // 获取班主任信息
      if (classData.teacherId) {
        await fetchTeacherInfo(classData.teacherId);
      }
      
      return true;
    } else {
      // 显示警告信息但不阻止页面渲染
      console.warn('未获取到班级信息');
      ElMessage.warning('未获取到班级信息，显示默认数据');
      return true; // 返回true使页面继续加载
    }
  } catch (error) {
    console.error('获取班级信息失败:', error);
    ElMessage.error('获取班级信息失败，显示默认数据');
    return true; // 即使出错也返回true，让页面继续加载
  }
};

// 获取班主任信息
const fetchTeacherInfo = async (teacherId: number) => {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头
    const headers = { 
      'token': token || ''
    };
    
    // 调用获取用户信息的API
    const response = await axios.get(`http://localhost:39999/user/${teacherId}`, { headers });
    
    if (response.data && response.data.data) {
      const teacherData = response.data.data as UserVo;
      console.log('获取到的班主任信息:', teacherData);
      
      // 更新班主任信息
      classInfo.value.headTeacher = teacherData.name;
      
      // 如果有邮箱信息，更新联系方式
      if (teacherData.email) {
        classInfo.value.contactEmail = teacherData.email;
      } else if (teacherData.phone) {
        classInfo.value.contactEmail = teacherData.phone;
      }
      
      // 如果有个人简介，添加到班级描述
      if (teacherData.description) {
        // 只有当班级已有描述时才添加班主任简介前缀
        const classDesc = classInfo.value.description || '';
        if (classDesc) {
          classInfo.value.description = `班主任${teacherData.name}简介：${teacherData.description}\n\n班级简介：${classDesc}`;
        } else {
          classInfo.value.description = `班主任${teacherData.name}简介：${teacherData.description}`;
        }
      }
      
      return true;
    } else {
      console.warn('未获取到班主任信息，使用默认数据');
      return true; // 返回true以便页面继续加载
    }
  } catch (error) {
    console.error('获取班主任信息失败:', error);
    ElMessage.warning('获取班主任信息失败，使用默认数据');
    return true; // 即使出错也返回true，让页面继续加载
  }
};

// 获取用户信息（实际应用中从API获取）
const fetchUserData = async () => {
  try {
    // 添加加载状态指示
    const loading = ElMessage({
      message: '正在加载学生信息...',
      type: 'info',
      duration: 0
    });
    
    // 从localStorage获取学生信息
    const username = localStorage.getItem('username') || ''; // 使用username作为学号
    const id = localStorage.getItem('id') || '';
    const name = localStorage.getItem('name') || '';
    const collegeId = localStorage.getItem('collegeId') || '';
    
    // 验证必要的信息是否存在
    if (!username || !name) {
      loading.close();
      ElMessage.warning('获取学生基本信息失败，使用默认数据');
      return true; // 返回true以让页面继续加载
    }
    
    // 由于localStorage中没有保存性别信息，我们设置一个默认值
    // 实际应用中，应该从API获取性别信息
    const defaultGender = '男'; // 这里设置默认性别，实际项目中应从API获取
    
    // 获取学院名称
    const collegeName = collegeMap.value[collegeId] || '未知学院';
    
    // 更新学生信息
    studentInfo.value = {
      ...studentInfo.value,
      studentId: username, // 使用username作为学号
      name: name,
      gender: defaultGender, // 使用默认性别
      collegeName: collegeName // 设置学院名称
    };
    
    // 更新班级信息的学院名称
    classInfo.value.college = collegeName;
    
    console.log('已加载学生数据:', studentInfo.value);
    
    // 在班级同学中找到与当前学生匹配的记录，确保"我"标签正确显示
    // 如果找不到匹配的同学，则添加当前学生到班级同学列表中
    const currentStudentInList = classmates.value.find(s => s.studentId === username);
    if (!currentStudentInList && username) {
      // 如果学生不在列表中，添加到列表
      classmates.value.push({
        studentId: username, // 使用username作为学号
        name: name,
        gender: defaultGender,
        position: '普通学生',
        contactInfo: '未设置',
        birthday: '未设置',
        hometown: '未设置'
      });
      // 更新总数
      classInfo.value.studentCount = classmates.value.length;
      // filteredTotalCount是计算属性，会自动更新，不需要手动赋值
    }
    
    // 关闭加载提示
    loading.close();
    return true;
    
  } catch (error) {
    console.error('获取用户数据失败:', error);
    ElMessage.error('获取用户数据失败，使用默认数据');
    return true; // 即使出错也返回true，让页面继续加载
  }
};

// 页面加载时执行
onMounted(async () => {
  try {
    // 先获取学院信息
    await fetchColleges();
    
    // 获取班级信息
    await fetchClassInfo();
    
    // 获取用户数据
    await fetchUserData();
    
  } catch (error) {
    console.error('页面初始化失败:', error);
    ElMessage.error('页面加载失败，但仍显示默认数据');
  }
});
</script>

<style scoped>
.class-info-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.student-info-card,
.class-detail-card,
.classmates-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-icon {
  margin-right: 8px;
  background-color: #ecf5ff;
  color: #409EFF;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.class-basic-info,
.class-stats {
  padding: 10px;
}

.class-basic-info h3,
.class-stats h3 {
  margin-top: 10px;
  margin-bottom: 15px;
  color: #409EFF;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
  font-size: 16px;
}

.stats-card {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.stats-item {
  flex: 1;
  min-width: 100px;
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin: 0 5px 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stats-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #ecf5ff;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 14px;
  color: #606266;
}

.class-description {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
  text-indent: 2em;
  white-space: pre-line;
}

.header-tools {
  display: flex;
  align-items: center;
}

.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.student-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.current-student-row) {
  background-color: rgba(64, 158, 255, 0.1);
}

:deep(.el-descriptions__label) {
  width: 120px;
  background-color: #fafafa;
}
</style> 