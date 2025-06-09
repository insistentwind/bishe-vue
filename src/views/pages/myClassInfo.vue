<template>
  <div class="myclass-info-container">
    <!-- 标题和信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><Reading /></el-icon>
            <span>班级信息</span>
          </div>
          <el-tag effect="dark" type="primary">{{ currentSemester }}</el-tag>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="base-info">
            <h3>我的班级信息</h3>
            <el-descriptions :column="1" border direction="vertical">
              <el-descriptions-item label="学号">{{ studentInfo.studentId }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ studentInfo.name }}</el-descriptions-item>
              <el-descriptions-item label="班级名称">{{ classInfo.className || '未分配班级' }}</el-descriptions-item>
              <el-descriptions-item label="年级">{{ studentInfo.grade || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="所属学院">{{ studentInfo.collegeName || '未知' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="class-info">
            <h3>班级详情</h3>
            <el-descriptions :column="1" border direction="vertical">
              <el-descriptions-item label="班主任">{{ classInfo.headTeacher || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="联系方式">{{ classInfo.contactEmail || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="班级人数">{{ classInfo.studentCount || 0 }} 人</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ classInfo.createTime || '未知' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 班级消息区域 -->
    <el-card class="message-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><ChatDotRound /></el-icon>
            <span>班级消息</span>
          </div>
          <div class="message-tools">
            <el-button type="primary" size="small" @click="refreshMessages">
              <el-icon><Refresh /></el-icon> 刷新消息
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="message-container" v-loading="messagesLoading">
        <div v-if="messages.length > 0" class="messages-list">
          <el-timeline>
            <el-timeline-item
              v-for="message in messages"
              :key="message.id"
              :timestamp="formatTime(message.timestamp)"
              :type="message.status === 0 ? 'primary' : 'info'"
              :hollow="message.status === 1"
            >
              <div class="message-item" :class="{ 'unread': message.status === 0 }">
                <h4 class="message-sender">{{ message.recvName || '班级管理员' }}</h4>
                <div class="message-content">{{ message.content }}</div>
                <div class="message-actions">
                  <el-button 
                    v-if="message.status === 0" 
                    type="primary" 
                    size="small" 
                    text
                    @click="markAsRead(message.id)"
                  >
                    标记为已读
                  </el-button>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
        <el-empty v-else description="暂无班级消息" :image-size="120"></el-empty>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination-container" v-if="messages.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Reading, ChatDotRound, Refresh } from '@element-plus/icons-vue';
import axios from 'axios';

// 类型定义
interface StudentInfo {
  studentId: string;
  name: string;
  grade: string;
  collegeName: string;
}

interface ClassInfo {
  className: string;
  headTeacher: string;
  contactEmail: string;
  studentCount: number;
  createTime: string;
}

interface Message {
  id: number;
  recvName: string;
  content: string;
  senderId: number;
  recvId: number;
  timestamp: Date;
  status: number; // 0: 未读, 1: 已读
  delFlag: number;
}

// 响应式状态
const currentSemester = ref('2025-2026 第二学期');
const messagesLoading = ref(false);
const studentInfo = ref<StudentInfo>({
  studentId: '',
  name: '',
  grade: '',
  collegeName: ''
});

const classInfo = ref<ClassInfo>({
  className: '',
  headTeacher: '',
  contactEmail: '',
  studentCount: 0,
  createTime: ''
});

const messages = ref<Message[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 格式化消息时间
const formatTime = (timestamp: Date | string | number) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 今天的消息只显示时间
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // 一周内的消息显示星期几
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // 其他消息显示完整日期
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 获取学生信息
const fetchStudentInfo = async () => {
  try {
    // 从localStorage获取基本信息
    const username = localStorage.getItem('username') || '';
    const name = localStorage.getItem('name') || '';
    const collegeId = localStorage.getItem('collegeId') || '';
    const collegeName = localStorage.getItem('collegeName') || '';
    
    // 更新学生信息
    studentInfo.value = {
      studentId: username,
      name: name,
      grade: localStorage.getItem('grade') || '未知年级',
      collegeName: collegeName
    };
    
    // 实际项目中可以从API获取更多详细信息
    console.log('加载的学生信息:', studentInfo.value);
    
    return true;
  } catch (error) {
    console.error('获取学生信息失败:', error);
    ElMessage.error('获取学生信息失败，请稍后再试');
    return false;
  }
};

// 获取班级信息
const fetchClassInfo = async () => {
  try {
    // 从localStorage获取JWT令牌
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
    
    // 获取学生ID
    const studentId = localStorage.getItem('id');
    
    if (!studentId) {
      ElMessage.warning('获取用户信息失败，请重新登录');
      return false;
    }
    
    // 这里使用模拟数据，实际项目中应该从API获取班级信息
    // 未来可以替换为实际API调用
    classInfo.value = {
      className: '计算机科学与技术2班',
      headTeacher: '李教授',
      contactEmail: 'teacher@example.com',
      studentCount: 35,
      createTime: '2025-09-01'
    };
    
    console.log('加载的班级信息:', classInfo.value);
    
    return true;
  } catch (error) {
    console.error('获取班级信息失败:', error);
    ElMessage.error('获取班级信息失败，请稍后再试');
    return false;
  }
};

// 获取消息列表
const fetchMessages = async (page = 1) => {
  try {
    messagesLoading.value = true;
    
    // 从localStorage获取JWT令牌
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
    
    // 获取用户ID
    const userId = localStorage.getItem('id');
    
    if (!userId) {
      ElMessage.warning('获取用户信息失败，请重新登录');
      messagesLoading.value = false;
      return;
    }
    
    console.log('获取消息, 页码:', page, '用户ID:', userId);
    
    try {
      // 调用API获取消息
      const response = await axios.get('http://localhost:39999/notify/message', {
        headers,
        params: {
          page: page,
          size: pageSize.value
        }
      });
      
      console.log('消息API响应:', response.data);
      
      if (response.data && response.data.data) {
        // 处理API返回的数据
        const data = response.data.data;
        
        // 更新消息列表
        if (data.recvList && Array.isArray(data.recvList)) {
          messages.value = data.recvList;
        } else {
          messages.value = [];
        }
        
        // 更新未读数量
        if (data.unReadCount !== undefined) {
          console.log('未读消息数量:', data.unReadCount);
        }
        
        // 更新总数量
        total.value = messages.value.length;
        
        ElMessage.success(`成功获取${messages.value.length}条消息`);
      } else {
        messages.value = [];
        total.value = 0;
        ElMessage.info('暂无消息');
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError);
      
      // 如果API不可用，使用模拟数据
      const mockMessages = [
        {
          id: 1,
          recvName: '班级管理员',
          content: '欢迎加入计算机科学与技术2班！请大家加入班级QQ群：123456789，及时了解班级通知。',
          senderId: 1001,
          recvId: parseInt(userId),
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 0,
          delFlag: 0
        },
        {
          id: 2,
          recvName: '李教授',
          content: '请同学们准备下周一的班会，主题是"专业学习规划"，每位同学需准备3分钟的发言。',
          senderId: 1002,
          recvId: parseInt(userId),
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 1,
          delFlag: 0
        }
      ];
      
      messages.value = mockMessages;
      total.value = mockMessages.length;
      
      ElMessage.warning('使用模拟数据，API暂不可用');
    }
  } catch (error) {
    console.error('获取消息失败:', error);
    ElMessage.error('获取消息失败，请稍后再试');
    messages.value = [];
    total.value = 0;
  } finally {
    messagesLoading.value = false;
  }
};

// 标记消息为已读
const markAsRead = async (messageId: number) => {
  try {
    // 从localStorage获取JWT令牌
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': token ? `Bearer ${token}` : '' };
    
    console.log('标记消息已读, ID:', messageId);
    
    // 在实际项目中这里应该调用API更新消息状态
    // 这里模拟API调用
    const message = messages.value.find(msg => msg.id === messageId);
    if (message) {
      message.status = 1; // 标记为已读
      ElMessage.success('消息已标记为已读');
    }
    
    // 实际API调用（根据实际API路径进行调整）
    /*
    await axios.put(`http://localhost:39999/notify/read/${messageId}`, {}, { headers });
    await fetchMessages(currentPage.value); // 刷新消息列表
    */
  } catch (error) {
    console.error('标记消息已读失败:', error);
    ElMessage.error('操作失败，请稍后再试');
  }
};

// 刷新消息
const refreshMessages = () => {
  fetchMessages(currentPage.value);
};

// 页码变化处理
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchMessages(page);
};

// 页面加载时执行
onMounted(async () => {
  try {
    // 获取学生信息
    await fetchStudentInfo();
    
    // 获取班级信息
    await fetchClassInfo();
    
    // 获取消息列表
    await fetchMessages();
  } catch (error) {
    console.error('页面初始化失败:', error);
    ElMessage.error('页面加载失败，请刷新重试');
  }
});
</script>

<style scoped>
.myclass-info-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.info-card,
.message-card {
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

.header-title .el-icon {
  margin-right: 8px;
  color: #409EFF;
  font-size: 20px;
}

.base-info,
.class-info {
  padding: 15px 10px;
}

.base-info h3,
.class-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #409EFF;
  border-left: 3px solid #409EFF;
  padding-left: 10px;
  font-size: 16px;
}

.message-container {
  min-height: 400px;
  padding: 10px;
}

.messages-list {
  padding: 10px;
}

.message-item {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 5px;
  transition: all 0.3s;
}

.message-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.message-item.unread {
  background-color: #ecf5ff;
  border-left: 3px solid #409EFF;
}

.message-sender {
  margin: 0 0 8px 0;
  color: #409EFF;
  font-size: 16px;
}

.message-content {
  color: #606266;
  line-height: 1.6;
  white-space: pre-line;
  margin-bottom: 10px;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* Element UI 组件样式优化 */
:deep(.el-timeline-item__node--normal) {
  left: -2px;
  width: 12px;
  height: 12px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 28px;
  top: -3px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}

:deep(.el-descriptions__label) {
  width: 100px;
  background-color: #fafafa;
}
</style> 