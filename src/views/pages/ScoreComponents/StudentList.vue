<template>
  <div class="student-list">
    <div class="list-header">
      <h3>{{ exam?.examName }} - 学生列表</h3>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索学生姓名/学号"
          prefix-icon="el-icon-search"
          clearable
          @clear="handleSearchClear"
          @input="handleSearch"
        />
      </div>
    </div>
    
    <div class="list-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else-if="!filteredStudents || filteredStudents.length === 0" class="empty-list">
        <el-empty description="暂无学生数据" />
      </div>
      <div v-else class="student-items">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-item"
          :class="{ 'selected-student': selectedStudent?.id === student.id }"
          @click="selectStudent(student)"
        >
          <div class="student-avatar">
            <el-avatar :size="40" :src="student.avatar || defaultAvatar">
              {{ student.name?.substring(0, 1) || 'S' }}
            </el-avatar>
          </div>
          <div class="student-info">
            <div class="student-name">{{ student.name }}</div>
            <div class="student-id">学号：{{ student.student_id }}</div>
            <div class="student-status" :class="getStatusClass(student)">
              {{ getStatusText(student) }}
            </div>
          </div>
          <div class="student-score" v-if="student.is_graded">
            <span class="score-value">{{ student.total_score }}</span>
            <span class="score-label">/ {{ exam?.totalScore || 100 }}</span>
          </div>
          <div class="student-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click.stop="handleGrade(student)"
              :disabled="!student.is_submitted"
            >
              {{ student.is_graded ? '重新批改' : '批改' }}
            </el-button>
            <el-button 
              type="info" 
              size="small" 
              @click.stop="handleViewAnswers(student)"
              :disabled="!student.is_submitted"
            >
              查看答卷
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="list-pagination" v-if="students && students.length > 10">
      <el-pagination
        layout="prev, pager, next"
        :total="students.length"
        :page-size="10"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, onMounted, watch } from 'vue';

// 定义学生类型接口
interface Student {
  id: string;
  name: string;
  student_id: string;
  avatar?: string;
  is_submitted: boolean;
  is_graded: boolean;
  total_score?: number;
  [key: string]: any;
}

interface Exam {
  id: string;
  examName: string;
  totalScore: number;
  [key: string]: any;
}

// 使用相对路径引用默认头像
const defaultAvatar = '/images/default-avatar.png';

// 定义组件的Props和Emits
const props = defineProps({
  exam: {
    type: Object as () => Exam,
    required: true
  },
  students: {
    type: Array as () => Student[],
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['grade', 'view', 'select']);

// 状态变量
const searchQuery = ref('');
const selectedStudent = ref<Student | null>(null);
const currentPage = ref(1);

// 计算属性：根据搜索过滤学生
const filteredStudents = computed(() => {
  if (!props.students || props.students.length === 0) return [];
  
  if (!searchQuery.value) return props.students;
  
  const query = searchQuery.value.toLowerCase();
  return props.students.filter((student: Student) => {
    return (
      (student.name && student.name.toLowerCase().includes(query)) ||
      (student.student_id && student.student_id.toLowerCase().includes(query))
    );
  });
});

// 方法：清除搜索
const handleSearchClear = () => {
  searchQuery.value = '';
};

// 方法：处理搜索（防抖实现可添加）
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
};

// 方法：处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 方法：选择学生
const selectStudent = (student: Student) => {
  selectedStudent.value = student;
  emit('select', student);
};

// 方法：开始批改
const handleGrade = (student: Student) => {
  if (!student.is_submitted) {
    return;
  }
  selectedStudent.value = student;
  emit('grade', student);
};

// 方法：查看学生答案
const handleViewAnswers = (student: Student) => {
  if (!student.is_submitted) {
    return;
  }
  
  selectedStudent.value = student;
  emit('view', student);
};

// 获取学生状态类名
const getStatusClass = (student: Student) => {
  if (!student.is_submitted) {
    return 'status-not-submitted';
  }
  if (student.is_graded) {
    return 'status-graded';
  }
  return 'status-submitted';
};

// 获取学生状态文本
const getStatusText = (student: Student) => {
  if (!student.is_submitted) {
    return '未提交';
  }
  if (student.is_graded) {
    return '已批改';
  }
  return '待批改';
};

// 监听props变化，如果学生列表变化且当前选中学生不在列表中，重置选中状态
watch(() => props.students, (newStudents) => {
  if (selectedStudent.value) {
    const still_exists = newStudents.some((s: Student) => s.id === selectedStudent.value?.id);
    if (!still_exists) {
      selectedStudent.value = null;
    }
  }
}, { deep: true });
</script>

<style scoped>
.student-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-header h3 {
  margin: 0;
  padding: 0;
  font-size: 18px;
  color: #303133;
}

.search-box {
  width: 100%;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.loading-container {
  padding: 20px;
}

.empty-list {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.student-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
  cursor: pointer;
}

.student-item:hover {
  background-color: #f0f2f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.selected-student {
  background-color: #ecf5ff;
  border-color: #409EFF;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.student-avatar {
  margin-right: 15px;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
  margin-bottom: 5px;
}

.student-id {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.student-status {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.status-not-submitted {
  background-color: #f4f4f5;
  color: #909399;
}

.status-submitted {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-graded {
  background-color: #f0f9eb;
  color: #67c23a;
}

.student-score {
  margin: 0 15px;
  text-align: center;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

.score-label {
  font-size: 14px;
  color: #909399;
}

.student-actions {
  display: flex;
  gap: 10px;
}

.list-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 