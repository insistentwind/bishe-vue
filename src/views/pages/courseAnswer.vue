<template>
  <div class="course-answer-container">
    <el-row :gutter="20">
      <!-- 左侧课程和学生选择区域 -->
      <el-col :span="8">
        <el-card class="selection-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><School /></el-icon>
                <span>课程答疑</span>
              </div>
            </div>
          </template>
          
          <!-- 学院选择 -->
          <div class="section-title">所教学院</div>
          <div class="selected-college-box">
            <span class="college-name">{{ selectedCollegeName || '加载中...' }}</span>
          </div>
          
          <!-- 课程选择 -->
          <div class="section-title">我的课程</div>
          <el-select 
            v-model="selectedCourse"
            placeholder="选择课程" 
            class="full-width mb-20"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in filteredCourses"
              :key="course.courseId"
              :label="course.courseName"
              :value="course.courseId"
            />
          </el-select>
          <div v-if="selectedCourse" class="debug-info">
            当前选择课程ID: {{ selectedCourse }}
          </div>
          
          <!-- 学生列表优化 -->
          <div class="section-title">学生咨询</div>
          <div v-if="selectedCourse && courseStudents.length > 0" class="student-list">
            <el-radio-group v-model="selectedStudent" class="student-radio-group">
              <div 
                v-for="student in courseStudents" 
                :key="student.studentId"
                class="student-item"
                :class="{'selected-student': selectedStudent === student.studentId}"
              >
                <el-radio :label="student.studentId" class="student-radio">
                  <div class="student-info">
                    <el-avatar :size="45" :src="student.avatar || defaultAvatar"></el-avatar>
                    <div class="student-detail">
                      <div class="student-name">{{ student.name }}</div>
                      <div class="student-id">{{ student.studentId }}</div>
                      <div class="student-meta">
                        <span v-if="student.email" class="meta-item">
                          <el-icon><Message /></el-icon>
                          {{ student.email }}
                        </span>
                        <span v-if="student.identity" class="meta-item">
                          <el-icon><User /></el-icon>
                          {{ student.identity }}
                        </span>
                      </div>
                    </div>
                    <el-badge 
                      v-if="student.unreadCount > 0" 
                      :value="student.unreadCount" 
                      class="unread-badge"
                      type="danger"
                    />
                  </div>
                </el-radio>
                
                <!-- 显示上次交流时间和状态 -->
                <div class="student-status" v-if="selectedStudent === student.studentId">
                  <div class="last-message-info">
                    <span class="last-message-time">
                      <el-icon><Timer /></el-icon>
                      最近交流: {{ formatLastMessageTime(student) }}
                    </span>
                    <el-tag size="small" effect="plain" type="success">在线</el-tag>
                  </div>
                </div>
              </div>
            </el-radio-group>
          </div>
          <el-empty 
            v-else-if="selectedCourse" 
            description="暂无学生咨询" 
            :image-size="100"
          >
            <template #description>
              <p>暂无学生咨询</p>
              <p class="empty-subtitle">等待学生提出问题</p>
            </template>
          </el-empty>
          <el-empty 
            v-else 
            description="请先选择课程" 
            :image-size="100"
          >
            <template #description>
              <p>请先选择课程</p>
              <p class="empty-subtitle">选择左侧课程开始答疑</p>
            </template>
          </el-empty>
        </el-card>
      </el-col>
      
      <!-- 右侧聊天区域 -->
      <el-col :span="16">
        <el-card class="chat-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><ChatDotRound /></el-icon>
                <span>课程答疑</span>
                <span v-if="currentChatTitle" class="chat-title"> - {{ currentChatTitle }}</span>
              </div>
              <div v-if="selectedStudent" class="header-actions">
                <el-tag 
                  type="success" 
                  size="small" 
                  effect="plain"
                  class="status-tag"
                >
                  <el-icon><CircleCheck /></el-icon>
                  <span>在线</span>
                </el-tag>
              </div>
            </div>
          </template>
          
          <!-- 教师信息展示条 -->
          <div v-if="selectedStudent" class="teacher-info-bar">
            <el-avatar :size="28" :src="teacherAvatar"></el-avatar>
            <div class="teacher-brief">
              <span class="brief-name">{{ teacherInfo.name }}</span>
              <span class="brief-title">教师</span>
            </div>
            <el-divider direction="vertical" />
            <div class="course-brief">
              {{ courses.find(c => c.courseId === selectedCourse)?.courseName || '当前课程' }}
            </div>
          </div>
          
          <!-- 消息历史 -->
          <div 
            v-if="selectedStudent" 
            ref="chatHistoryRef" 
            class="chat-history"
          >
            <el-loading 
              v-if="messagesLoading" 
              :fullscreen="false"
              text="加载聊天记录中..." 
              background="rgba(255, 255, 255, 0.8)"
            />
            <template v-else-if="chatMessages.length > 0">
              <div class="chat-date-divider" v-if="chatMessages.length > 0">
                <span>{{ formatDate(chatMessages[0].timestamp) }}</span>
              </div>
              
              <div 
                v-for="(message, index) in chatMessages" 
                :key="index"
                :class="['message-item', message.fromTeacher ? 'message-sent' : 'message-received']"
              >
                <div class="message-avatar">
                  <el-avatar 
                    :size="36" 
                    :src="message.fromTeacher ? teacherAvatar : (currentStudent?.avatar || defaultAvatar)"
                  ></el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-sender">
                    {{ message.fromTeacher ? (teacherInfo.name || '我') : (currentStudent?.name || '学生') }}
                  </div>
                  <div class="message-text">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
            </template>
            <el-empty 
              v-else 
              description="暂无消息历史" 
              :image-size="120"
            >
              <template #description>
                <p>暂无消息历史</p>
                <p class="empty-subtitle">回复学生的提问，帮助解决他们的问题</p>
              </template>
            </el-empty>
          </div>
          <div v-else class="chat-placeholder">
            <el-empty 
              description="请先选择学生开始答疑" 
              :image-size="150"
            >
              <template #description>
                <p>请先选择学生开始答疑</p>
                <p class="empty-subtitle">选择左侧的学生，开始课程答疑</p>
              </template>
            </el-empty>
          </div>
          
          <!-- 快速回复 -->
          <div v-if="selectedStudent && !messageContent.trim()" class="quick-replies">
            <div class="reply-chips">
              <el-tag
                v-for="(reply, index) in quickReplies"
                :key="index"
                class="reply-chip"
                @click="useQuickReply(reply)"
                :effect="index % 2 === 0 ? 'light' : 'plain'"
                :type="getTagType(index)"
                size="small"
              >
                {{ reply }}
              </el-tag>
            </div>
          </div>
          
          <!-- 消息输入框 -->
          <div v-if="selectedStudent" class="message-input">
            <el-input
              v-model="messageContent"
              type="textarea"
              :rows="2"
              placeholder="输入您的回复..."
              resize="none"
              @keyup.enter.ctrl="sendMessage"
            />
            <div class="input-footer">
              <div class="input-actions">
                <el-tooltip content="常用表情" placement="top">
                  <el-button link @click="addEmoji('👍')">👍</el-button>
                </el-tooltip>
                <el-tooltip content="赞同" placement="top">
                  <el-button link @click="addEmoji('✅')">✅</el-button>
                </el-tooltip>
                <el-tooltip content="稍等" placement="top">
                  <el-button link @click="addEmoji('⏳')">⏳</el-button>
                </el-tooltip>
                <el-tooltip content="思考中" placement="top">
                  <el-button link @click="addEmoji('🤔')">🤔</el-button>
                </el-tooltip>
                <el-button 
                  type="primary" 
                  size="small" 
                  :disabled="!messageContent.trim()" 
                  @click="sendMessage"
                  class="send-button"
                >
                  发送
                </el-button>
              </div>
              <div class="send-tip">提示: 按 Ctrl+Enter 快速发送</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { School, ChatDotRound, Position, ChatLineRound, Comment, Message, User, Timer, Calendar, Reading, CircleCheck } from '@element-plus/icons-vue';
import axios from 'axios';

// 定义类型
interface College {
  collegeId: string;
  collegeName: string;
}

interface Course {
  courseId: string;
  courseName: string;
  collegeId: string;
  description?: string;
  hours?: string;
  score?: string;
  classTime?: string;
  teacherId?: string;
  teacherName?: string;
}

interface Student {
  studentId: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  collegeId?: string;
  description?: string;
  sex?: number;
  identity?: string;
  unreadCount: number;
}

interface ChatMessage {
  content: string;
  timestamp: number;
  fromTeacher: boolean;
  id?: number;
  status?: number;
  senderId?: number;
  recvId?: number;
}

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 教师信息
const teacherInfo = ref({
  id: '',
  name: '',
  avatar: ''
});

// 学院和课程数据
const colleges = ref<College[]>([]);
const courses = ref<Course[]>([]);
const selectedCollege = ref('');
const selectedCourse = ref('');

// 学生数据
const courseStudents = ref<Student[]>([]);
const selectedStudent = ref('');

// 聊天相关
const chatMessages = ref<ChatMessage[]>([]);
const messageContent = ref('');
const chatHistoryRef = ref<HTMLElement | null>(null);
const messagesLoading = ref(false);

// 快速回复选项
const quickReplies = ref([
  '这个问题很好，我们来逐步分析',
  '您好，这个问题我已经收到，稍后会详细解答',
  '请查看教材第X章节，那里有详细讲解',
  '建议您参考课程PPT第X页的内容',
  '这个知识点在下次课堂上会详细讲解',
  '您的理解是正确的，继续保持',
  '这个问题可以到办公室详细讨论',
  '请提供更多信息，我好给您更准确的解答'
]);

// 教师头像
const teacherAvatar = computed(() => {
  return teacherInfo.value.avatar || defaultAvatar;
});

// 根据学院筛选课程
const filteredCourses = computed(() => {
  // 不再基于学院ID过滤，直接返回所有课程
  console.log('计算filteredCourses，当前课程数量:', courses.value.length);
  return courses.value;
});

// 当前选中的学生
const currentStudent = computed(() => {
  if (!selectedStudent.value) return null;
  return courseStudents.value.find(student => student.studentId === selectedStudent.value);
});

// 当前聊天标题
const currentChatTitle = computed(() => {
  if (!selectedCourse.value || !selectedStudent.value) return '';
  
  const courseName = courses.value.find(c => c.courseId === selectedCourse.value)?.courseName || '';
  const studentName = currentStudent.value?.name || '';
  
  return `${courseName} (${studentName} 同学)`;
});

// 当前选中的学院名称
const selectedCollegeName = computed(() => {
  if (!selectedCollege.value) return '';
  const college = colleges.value.find(c => c.collegeId.toString() === selectedCollege.value.toString());
  return college ? college.collegeName : '';
});

// 获取学院列表
const fetchColleges = async () => {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    const response = await axios.get('http://localhost:39999/college/all', { headers });
    console.log('学院数据原始响应:', response);
    
    if (response.data && response.data.data) {
      colleges.value = response.data.data;
      console.log('处理后的学院数据:', colleges.value);
      
      // 获取教师所属学院
      const teacherCollegeId = localStorage.getItem('collegeId');
      console.log('从localStorage获取的教师所属学院ID:', teacherCollegeId);
      
      if (teacherCollegeId) {
        // 确保类型一致，统一转为字符串进行比较
        const teacherCollegeIdStr = teacherCollegeId.toString();
        const foundCollege = colleges.value.find(c => c.collegeId.toString() === teacherCollegeIdStr);
        
        if (foundCollege) {
          console.log(`找到教师所属学院: ${foundCollege.collegeName}，ID: ${teacherCollegeIdStr}`);
          selectedCollege.value = teacherCollegeIdStr;
        } else {
          console.log(`未找到ID为${teacherCollegeIdStr}的学院，使用第一个可用学院`);
          selectFirstCollege();
        }
      } else {
        console.log('教师没有所属学院信息，使用第一个可用学院');
        selectFirstCollege();
      }
    } else {
      console.log('未找到学院数据');
      colleges.value = [];
      ElMessage.warning('未能获取到学院信息');
    }
  } catch (error) {
    console.error('获取学院列表失败:', error);
    ElMessage.error('获取学院列表失败，请稍后再试');
    colleges.value = [];
  }
};

// 如果没有选择学院，则选择第一个
const selectFirstCollege = () => {
  if (colleges.value.length > 0) {
    console.log(`选择第一个学院: ${colleges.value[0].collegeName}, ID: ${colleges.value[0].collegeId}`);
    selectedCollege.value = colleges.value[0].collegeId.toString();
  } else {
    ElMessage.warning('没有可选的学院');
  }
};

// 获取教师课程列表
const fetchTeacherCourses = async (collegeId: string) => {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    // 使用API获取课程列表
    console.log('获取教师课程列表，使用token:', token);
    
    const response = await axios.get('http://localhost:39999/notify/lesson', { headers });
    console.log('课程列表数据:', response.data);
    
    if (response.data && response.data.data) {
      // 处理API返回的课程数据
      const coursesData = response.data.data;
      console.log('原始课程数据:', coursesData);
      
      // 映射课程数据到应用格式
      courses.value = coursesData.map((course: any) => {
        const mapped = {
          courseId: course.id.toString(),
          courseName: course.lessonName,
          collegeId: course.collegeId ? course.collegeId.toString() : '',
          description: course.introduction || '',
          hours: course.hours,
          score: course.score,
          classTime: course.classTime,
          teacherId: course.teacherId,
          teacherName: course.teacherName
        };
        console.log('映射课程:', course.id, course.lessonName);
        return mapped;
      });
      
      console.log('处理后的课程数据:', courses.value);
      
      // 移除按学院ID过滤，显示所有教师课程
      // if (collegeId) {
      //  const collegeIdStr = collegeId.toString();
      //  courses.value = courses.value.filter(course => course.collegeId === collegeIdStr);
      // }
      
      if (courses.value.length === 0) {
        console.warn('未找到任何课程，原始数据长度:', coursesData.length);
        ElMessage.warning('未找到您教授的课程');
      } else {
        ElMessage.success(`成功获取${courses.value.length}门课程`);
      }
    } else {
      console.error('API返回格式不符合预期:', response.data);
      throw new Error('API返回格式不符合预期');
    }
  } catch (error) {
    console.error('获取课程列表失败:', error);
    ElMessage.error('获取课程列表失败，请稍后再试');
    
    // 使用模拟数据作为备用
    const mockCourses: Course[] = [
      { courseId: 'CS101', courseName: '计算机导论', collegeId: collegeId },
      { courseId: 'CS201', courseName: '数据结构', collegeId: collegeId },
      { courseId: 'CS301', courseName: '算法设计与分析', collegeId: collegeId },
      { courseId: 'CS401', courseName: '操作系统', collegeId: collegeId },
    ];
    
    courses.value = mockCourses;
    console.log('使用模拟课程数据:', courses.value);
  }
};

// 获取课程学生
const fetchCourseStudents = async (courseId: string) => {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    console.log('获取课程学生列表，课程ID:', courseId);
    
    try {
      // 使用API获取课程学生
      const response = await axios.get(`http://localhost:39999/notify/byId/${courseId}`, { headers });
      console.log('课程学生数据原始响应:', response.data);
      
      if (response.data && response.data.data) {
        // 处理API返回的学生数据
        const studentsData = response.data.data;
        console.log('原始学生数据:', studentsData);
        
        // 映射学生数据到应用格式
        courseStudents.value = studentsData.map((student: any) => {
          const mapped = {
            studentId: student.id.toString(),
            name: student.name || '未知学生',
            avatar: student.avatar || '',
            email: student.email || '',
            phone: student.phone || '',
            collegeId: student.collegeId ? student.collegeId.toString() : '',
            description: student.description || '',
            sex: student.sex,
            identity: student.identity || '学生',
            unreadCount: 0 // 默认未读消息数为0，后续可以从其他API获取
          };
          console.log('映射学生:', student.id, student.name);
          return mapped;
        });
        
        console.log('处理后的学生数据:', courseStudents.value);
        
        if (courseStudents.value.length === 0) {
          ElMessage.warning('该课程暂无学生咨询');
        } else {
          ElMessage.success(`该课程有${courseStudents.value.length}位学生`);
        }
      } else {
        console.warn('API返回数据不包含学生信息或格式不符合预期:', response.data);
        courseStudents.value = [];
        ElMessage.warning('未找到该课程的学生信息');
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError);
      ElMessage.warning('获取学生列表失败，使用模拟数据');
      
      // 使用模拟数据
      const mockStudents: Student[] = [
        { 
          studentId: '101', 
          name: '张三(模拟)', 
          unreadCount: 2,
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        { 
          studentId: '102', 
          name: '李四(模拟)', 
          unreadCount: 0,
          avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
        }
      ];
      
      courseStudents.value = mockStudents;
    }
  } catch (error) {
    console.error('获取课程学生失败:', error);
    ElMessage.error('获取课程学生失败，请稍后再试');
    courseStudents.value = [];
  }
};

// 获取聊天历史
const fetchChatHistory = async (studentId: string) => {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    // 获取教师ID
    const teacherId = teacherInfo.value.id;
    
    if (!teacherId || !selectedCourse.value || !studentId) {
      console.warn('获取聊天历史缺少必要参数:', { teacherId, courseId: selectedCourse.value, studentId });
      return;
    }
    
    console.log('获取聊天历史，参数:', { teacherId, studentId });
    messagesLoading.value = true;
    
    try {
      // 使用API获取聊天历史
      const response = await axios.get(`http://localhost:39999/notify/all/${studentId}`, { headers });
      console.log('聊天历史数据:', response.data);
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        const sendList = data.sendList || [];
        const recvList = data.recvList || [];
        
        // 合并发送和接收的消息
        let allMessages = [
          ...sendList.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            timestamp: new Date(msg.timestamp).getTime(),
            fromTeacher: true, // 教师发送的消息
            status: msg.status,
            senderId: msg.senderId,
            recvId: msg.recvId
          })),
          ...recvList.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            timestamp: new Date(msg.timestamp).getTime(),
            fromTeacher: false, // 学生发送的消息
            status: msg.status,
            senderId: msg.senderId,
            recvId: msg.recvId
          }))
        ];
        
        // 按发送时间排序
        allMessages.sort((a, b) => a.timestamp - b.timestamp);
        
        // 只保留当前选中学生的消息
        const studentIdNum = parseInt(studentId);
        const teacherIdNum = parseInt(teacherId);
        
        // 根据发送者ID正确标记消息的发送者
        const filteredMessages = allMessages.filter(msg => {
          const isRelevant = (msg.senderId === teacherIdNum && msg.recvId === studentIdNum) || 
                           (msg.senderId === studentIdNum && msg.recvId === teacherIdNum);
          
          if (isRelevant) {
            // 重新检查消息是否来自教师 (fromTeacher 应该基于 senderId)
            msg.fromTeacher = msg.senderId === teacherIdNum;
          }
          
          return isRelevant;
        });
        
        console.log('处理后的消息:', filteredMessages);
        chatMessages.value = filteredMessages;
        
        if (filteredMessages.length > 0) {
          ElMessage.success(`成功获取${filteredMessages.length}条聊天记录`);
        } else {
          console.log('没有与该学生的聊天记录');
          ElMessage.info('暂无与该学生的聊天记录');
        }
        
        // 更新未读消息数量
        if (data.unReadCount !== undefined) {
          console.log('未读消息数量:', data.unReadCount);
        }
      } else {
        // 如果没有历史聊天记录
        chatMessages.value = [];
        console.log('没有聊天历史记录');
        ElMessage.info('暂无聊天记录');
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError);
      ElMessage.warning('获取聊天记录失败，使用模拟数据');
      
      // API调用失败时使用模拟数据
      const mockMessages: ChatMessage[] = [
        {
          content: '老师您好，我想请教一个关于课程作业的问题。',
          timestamp: Date.now() - 3600000, // 1小时前
          fromTeacher: false
        },
        {
          content: '你好，请问有什么需要我帮助的？',
          timestamp: Date.now() - 3500000,
          fromTeacher: true
        },
        {
          content: '我在第三章的习题3-4中遇到了困难，不知道如何解决。',
          timestamp: Date.now() - 3400000,
          fromTeacher: false
        },
        {
          content: '这道题需要使用我们课上讲过的递归思想，你可以先考虑最简单的情况，然后逐步构建更复杂的解法。',
          timestamp: Date.now() - 3300000,
          fromTeacher: true
        }
      ];
      
      chatMessages.value = mockMessages;
      console.log('聊天历史数据(模拟):', chatMessages.value);
    }
    
    // 标记为已读
    if (currentStudent.value) {
      const index = courseStudents.value.findIndex(s => s.studentId === studentId);
      if (index !== -1) {
        courseStudents.value[index].unreadCount = 0;
      }
    }
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    ElMessage.error('获取聊天历史失败，请稍后再试');
    chatMessages.value = [];
  } finally {
    messagesLoading.value = false;
  }
};

// 课程变更处理
const handleCourseChange = async (courseId: string) => {
  selectedStudent.value = '';
  chatMessages.value = [];
  
  await fetchCourseStudents(courseId);
};

// 监听学生选择变化
watch(selectedStudent, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    await fetchChatHistory(newVal);
  }
});

// 发送消息
const sendMessage = async () => {
  if (!messageContent.value.trim() || !selectedStudent.value) return;
  
  // 获取教师ID
  const teacherId = teacherInfo.value.id;
  
  // 创建新消息
  const newMessage: ChatMessage = {
    content: messageContent.value.trim(),
    timestamp: Date.now(),
    fromTeacher: true, // 标记为教师发送的消息
    senderId: parseInt(teacherId),
    recvId: parseInt(selectedStudent.value)
  };
  
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    if (!teacherId || !selectedCourse.value || !selectedStudent.value) {
      console.warn('发送消息缺少必要参数:', { teacherId, courseId: selectedCourse.value, studentId: selectedStudent.value });
      ElMessage.error('发送失败，请检查登录状态');
      return;
    }
    
    // 获取学生姓名
    const studentName = currentStudent.value?.name || '未知学生';
    
    // 构建发送消息的请求体
    const messageData = {
      senderId: parseInt(teacherId), // 发送者是教师ID
      recvId: parseInt(selectedStudent.value), // 接收者是学生ID
      content: messageContent.value.trim(),
      recvName: studentName,
    };
    
    console.log('发送消息，参数:', messageData);
    
    // 添加到消息列表
    chatMessages.value.push(newMessage);
    
    // 清空输入框
    messageContent.value = '';
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    
    try {
      // 使用实际API发送消息
      const response = await axios.put('http://localhost:39999/notify/sendMessage', messageData, { headers });
      console.log('发送消息响应:', response);
      
      if (response.data && response.data.code === 200) {
        // 成功提示
        ElMessage.success('消息已成功发送');
        
        // 刷新消息列表，获取最新消息
        if (selectedStudent.value) {
          await fetchChatHistory(selectedStudent.value);
        }
      } else {
        // 服务器返回错误
        console.warn('服务器返回错误:', response.data);
        ElMessage.warning('消息发送可能失败，请检查网络连接');
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError);
      ElMessage.error('消息发送失败，服务器错误');
      
      // API调用失败时显示模拟回复，方便测试
      setTimeout(async () => {
        const studentReply: ChatMessage = {
          content: '谢谢老师的解答，我明白了！(模拟回复)',
          timestamp: Date.now(),
          fromTeacher: false
        };
        
        chatMessages.value.push(studentReply);
        
        // 滚动到底部
        await nextTick();
        scrollToBottom();
      }, 1000);
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败，请稍后再试');
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (chatHistoryRef.value) {
    chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
  }
};

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  
  // 同一天，只显示时间
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // 不同天，显示日期和时间
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化日期（不包含时间）
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 使用快速回复
const useQuickReply = (reply: string) => {
  messageContent.value = reply;
};

// 添加表情到消息
const addEmoji = (emoji: string) => {
  messageContent.value += emoji;
};

// 获取标签类型，用于不同样式的快速回复
const getTagType = (index: number): string => {
  const types = ['', 'info', 'success', 'warning', 'danger'];
  return types[index % types.length];
};

// 格式化上次消息时间
const formatLastMessageTime = (student: Student): string => {
  // 查找与该学生的最后一条消息
  const studentMessages = chatMessages.value.filter(msg => 
    (msg.fromTeacher && currentStudent.value?.studentId === student.studentId) || 
    (!msg.fromTeacher && currentStudent.value?.studentId === student.studentId)
  );
  
  if (studentMessages.length === 0) {
    return '暂无记录';
  }
  
  // 获取最后一条消息的时间
  const lastMessage = studentMessages[studentMessages.length - 1];
  return formatTime(lastMessage.timestamp);
};

// 获取当前课程信息
const getCurrentCourse = () => {
  return courses.value.find(course => course.courseId === selectedCourse.value);
};

// 获取学院名称
const getCollegeName = () => {
  const college = colleges.value.find(c => c.collegeId === selectedCollege.value);
  return college ? college.collegeName : '未知学院';
};

// 页面加载
onMounted(async () => {
  try {
    console.log('页面加载中...');
    
    // 加载教师信息
    teacherInfo.value = {
      id: localStorage.getItem('id') || '',
      name: localStorage.getItem('name') || '',
      avatar: localStorage.getItem('avatar') || defaultAvatar
    };
    console.log('加载的教师信息:', teacherInfo.value);
    
    // 加载学院列表
    await fetchColleges();
    
    // 直接获取教师课程，不依赖于学院
    await fetchTeacherCourses('');
  } catch (error) {
    console.error('页面初始化失败:', error);
    ElMessage.error('页面加载失败，请刷新重试');
  }
});
</script>

<style scoped>
.course-answer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
  height: calc(100vh - 30px);
}

.selection-card, .chat-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 调整聊天区域布局和滚动 */
.chat-card {
  display: flex !important;
  flex-direction: column !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #f8f9fa;
  min-height: 36px;
  max-height: 36px;
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
  font-size: 20px;
  color: #409EFF;
}

.chat-title {
  margin-left: 10px;
  color: #606266;
  font-weight: normal;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 12px;
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.section-title:before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

.full-width {
  width: 100%;
}

.mb-20 {
  margin-bottom: 20px;
}

.student-list {
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  background-color: #FFFFFF;
  scrollbar-width: thin;
}

.student-list::-webkit-scrollbar {
  width: 6px;
}

.student-list::-webkit-scrollbar-track {
  background: #FFFFFF;
}

.student-list::-webkit-scrollbar-thumb {
  background-color: #E4E7ED;
  border-radius: 3px;
}

.student-radio-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.student-item {
  padding: 14px 16px;
  border-bottom: 1px solid #EBEEF5;
  transition: all 0.3s;
}

.student-item:hover {
  background-color: #F5F7FA;
}

.student-item:last-child {
  border-bottom: none;
}

.selected-student {
  background-color: #EBF5FF;
}

.student-radio {
  width: 100%;
  margin-right: 0;
}

.student-info {
  display: flex;
  align-items: center;
  position: relative;
}

.student-detail {
  margin-left: 12px;
  flex: 1;
}

.student-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 2px;
}

.student-id {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.student-meta {
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-right: 12px;
  margin-bottom: 4px;
}

.meta-item .el-icon {
  font-size: 14px;
  margin-right: 4px;
}

.unread-badge {
  position: absolute;
  right: 0;
  top: 0;
}

.student-status {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #E4E7ED;
}

.last-message-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.last-message-time {
  display: flex;
  align-items: center;
}

.last-message-time .el-icon {
  margin-right: 4px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  height: auto;
  min-height: 200px;
  max-height: calc(100vh - 350px);
  scrollbar-width: thin;
  scrollbar-color: #C0C4CC #f5f7fa;
  margin-bottom: 0;
  box-sizing: border-box;
}

.chat-history::-webkit-scrollbar {
  width: 8px;
}

.chat-history::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 4px;
}

.chat-history::-webkit-scrollbar-thumb {
  background-color: #C0C4CC;
  border-radius: 4px;
  border: 2px solid #f5f7fa;
}

.chat-placeholder {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  max-height: calc(100vh - 350px);
  min-height: 200px;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 5px;
}

.message-sent {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 65%;
  margin: 0 8px;
}

.message-sent .message-content {
  align-items: flex-end;
}

.message-sender {
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
  font-weight: 500;
}

.message-sent .message-sender {
  text-align: right;
  color: #409EFF;
}

.message-text {
  padding: 10px 12px;
  border-radius: 10px;
  word-break: break-word;
  line-height: 1.5;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

.message-sent .message-text {
  background-color: #409EFF;
  color: white;
  border-top-right-radius: 0;
}

.message-received .message-text {
  background-color: white;
  color: #303133;
  border-top-left-radius: 0;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  padding: 0 4px;
}

.message-sent .message-time {
  text-align: right;
}

.message-input {
  padding: 10px 15px;
  background-color: #FFFFFF;
  border-top: 1px solid #EBEEF5;
  position: relative;
  z-index: 10;
  min-height: 120px;
  max-height: 200px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.message-input .el-textarea {
  height: auto;
  flex: 1;
}

.message-input .el-textarea__inner {
  min-height: 60px !important;
  height: 100% !important;
  resize: none !important;
  font-size: 14px !important;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 5px;
  min-height: 30px;
}

.input-actions {
  display: flex;
  align-items: center;
}

.send-tip {
  font-size: 12px;
  color: #606266; /* 调整颜色使其更明显 */
  margin-top: 2px;
  text-align: right;
  white-space: nowrap; /* 防止换行 */
}

.debug-info {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.teacher-info-bar {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #FFFFFF;
  min-height: 36px;
  max-height: 36px;
}

.teacher-brief {
  flex: 1;
  margin-left: 10px;
}

.brief-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.brief-title {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.course-brief {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.chat-date-divider {
  text-align: center;
  margin: 15px 0;
  position: relative;
}

.chat-date-divider:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #E4E7ED;
  z-index: 0;
}

.chat-date-divider span {
  background-color: #f5f7fa;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #909399;
  position: relative;
  z-index: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.quick-replies {
  padding: 6px 12px;
  border-top: 1px solid #EBEEF5;
  background-color: #FFFFFF;
  max-height: 50px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.reply-chips {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 4px;
  padding-bottom: 4px;
}

.reply-chip {
  margin: 1px;
  cursor: pointer;
  padding: 3px 6px;
  transition: all 0.2s;
  font-size: 12px;
  white-space: nowrap;
}

.quick-replies::-webkit-scrollbar {
  height: 4px;
}

.quick-replies::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.quick-replies::-webkit-scrollbar-thumb {
  background-color: #C0C4CC;
  border-radius: 2px;
}

.input-actions .el-button {
  padding: 4px 8px;
  font-size: 16px;
}

.send-button {
  margin-left: 8px;
}

.empty-subtitle {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.course-info-section {
  margin: 10px 20px;
}

.course-info-card {
  border-radius: 8px;
  border: 1px solid #EBEEF5;
}

.course-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.course-info-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.course-info-content {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.course-meta {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.course-meta .meta-item {
  background-color: #F5F7FA;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

/* 增加全屏样式，让页面充分利用屏幕空间 */
@media screen and (min-height: 768px) {
  .course-answer-container {
    height: 100vh;
    padding: 5px;
  }
  
  .selection-card, .chat-card {
    height: calc(100vh - 20px);
  }
  
  .chat-history {
    max-height: calc(100vh - 320px);
  }
  
  .message-input {
    min-height: 140px;
  }
}

.selected-college-box {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.college-name {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
</style> 