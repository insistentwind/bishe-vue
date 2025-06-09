<template>
  <div class="course-consult-container">
    <el-row :gutter="20">
      <!-- 左侧课程和老师选择区域 -->
      <el-col :span="8">
        <el-card class="selection-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><School /></el-icon>
                <span>课程咨询</span>
              </div>
            </div>
          </template>
          
          <!-- 学院选择 -->
          <div class="section-title">我的学院</div>
          <div class="selected-college-box">
            <span class="college-name">{{ selectedCollegeName || '加载中...' }}</span>
          </div>
          
          <!-- 课程选择 -->
          <div class="section-title">选择课程</div>
          <el-select 
            v-model="selectedCourse"
            placeholder="选择课程" 
            class="full-width mb-20"
            :disabled="!selectedCollege"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in filteredCourses"
              :key="course.courseId"
              :label="course.courseName"
              :value="course.courseId"
            />
          </el-select>
          
          <!-- 教师列表 -->
          <div class="section-title">课程教师</div>
          <div v-if="selectedCourse && courseTeachers.length > 0" class="teacher-list">
            <el-radio-group v-model="selectedTeacher" class="teacher-radio-group">
              <div 
                v-for="teacher in courseTeachers" 
                :key="teacher.teacherId"
                class="teacher-item"
                :class="{'selected-teacher': selectedTeacher === teacher.teacherId}"
              >
                <el-radio :label="teacher.teacherId" class="teacher-radio">
                  <div class="teacher-info">
                    <el-avatar :size="40" :src="teacher.avatar || defaultAvatar"></el-avatar>
                    <div class="teacher-detail">
                      <div class="teacher-name-row">
                        <span class="teacher-name">{{ teacher.name }}</span>
                        <span class="teacher-title">{{ teacher.title || '讲师' }}</span>
                      </div>
                      <el-tooltip 
                        v-if="teacher.email" 
                        :content="teacher.email" 
                        placement="top" 
                        :show-after="500"
                      >
                        <div class="teacher-email">
                          <el-icon><Message /></el-icon>
                          <span class="email-text">{{ teacher.email }}</span>
                        </div>
                      </el-tooltip>
                    </div>
                  </div>
                </el-radio>
                
                <!-- 显示上次交流时间和状态 -->
                <div class="teacher-status" v-if="selectedTeacher === teacher.teacherId">
                  <div class="last-message-info">
                    <span class="last-message-time">
                      <el-icon><Timer /></el-icon>
                      最近交流: {{ getLastContactTime(teacher.teacherId) }}
                    </span>
                    <el-tag size="small" effect="plain" type="success">在线</el-tag>
                  </div>
                </div>
              </div>
            </el-radio-group>
          </div>
          <el-empty 
            v-else-if="selectedCourse" 
            description="暂无教师信息" 
            :image-size="100"
          ></el-empty>
          <el-empty 
            v-else 
            description="请先选择课程" 
            :image-size="100"
          ></el-empty>
        </el-card>
      </el-col>
      
      <!-- 右侧聊天区域 -->
      <el-col :span="16">
        <el-card class="chat-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon><ChatDotRound /></el-icon>
                <span>课程咨询</span>
                <span v-if="currentChatTitle" class="chat-title"> - {{ currentChatTitle }}</span>
              </div>
              <div v-if="selectedTeacher" class="header-actions">
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
          
          <!-- 学生信息展示条 -->
          <div v-if="selectedTeacher" class="student-info-bar">
            <el-avatar :size="28" :src="studentAvatar"></el-avatar>
            <div class="student-brief">
              <span class="brief-name">{{ studentInfo.name }}</span>
              <span class="brief-title">学生</span>
            </div>
            <el-divider direction="vertical" />
            <div class="course-brief">
              {{ courses.find(c => c.courseId === selectedCourse)?.courseName || '当前课程' }}
            </div>
          </div>
          
          <!-- 消息历史 -->
          <div 
            v-if="selectedTeacher" 
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
                :class="['message-item', message.fromStudent ? 'message-sent' : 'message-received']"
              >
                <div class="message-avatar">
                  <el-avatar 
                    :size="36" 
                    :src="message.fromStudent ? studentAvatar : (currentTeacher?.avatar || defaultAvatar)"
                  ></el-avatar>
                </div>
                <div class="message-content">
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
                <p class="empty-subtitle">向老师提问，解决您的课程疑惑</p>
              </template>
            </el-empty>
          </div>
          <div v-else class="chat-placeholder">
            <el-empty 
              description="请先选择课程教师开始咨询" 
              :image-size="150"
            >
              <template #description>
                <p>请先选择课程教师开始咨询</p>
                <p class="empty-subtitle">选择左侧的教师，开始课程咨询</p>
              </template>
            </el-empty>
          </div>
          
          <!-- 快速提问 -->
          <div v-if="selectedTeacher && !messageContent.trim()" class="quick-asks">
            <div class="ask-chips">
              <el-tag
                v-for="(ask, index) in quickAsks"
                :key="index"
                class="ask-chip"
                @click="useQuickAsk(ask)"
                :effect="index % 2 === 0 ? 'light' : 'plain'"
                :type="getTagType(index)"
                size="small"
              >
                {{ ask }}
              </el-tag>
            </div>
          </div>
          
          <!-- 消息输入框 -->
          <div v-if="selectedTeacher" class="message-input">
            <el-input
              v-model="messageContent"
              type="textarea"
              :rows="2"
              placeholder="输入您想咨询的问题..."
              resize="none"
              @keyup.enter.ctrl="sendMessage"
            />
            <div class="input-footer">
              <div class="input-actions">
                <el-tooltip content="问好" placement="top">
                  <el-button link @click="addEmoji('👋')">👋</el-button>
                </el-tooltip>
                <el-tooltip content="感谢" placement="top">
                  <el-button link @click="addEmoji('🙏')">🙏</el-button>
                </el-tooltip>
                <el-tooltip content="疑问" placement="top">
                  <el-button link @click="addEmoji('❓')">❓</el-button>
                </el-tooltip>
                <el-tooltip content="笑脸" placement="top">
                  <el-button link @click="addEmoji('😊')">😊</el-button>
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
import { School, ChatDotRound, CircleCheck, Message, Phone, Timer } from '@element-plus/icons-vue';
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
}

interface Teacher {
  teacherId: string;
  name: string;
  avatar?: string;
  email?: string;
  title?: string;
  description?: string;
  phone?: string;
}

interface ChatMessage {
  content: string;
  timestamp: number;
  fromStudent: boolean;
  id?: number;
  status?: number;
  senderId?: number;
  recvId?: number;
}

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 学生信息
const studentInfo = ref({
  id: '',
  name: '',
  collegeId: '',
  avatar: ''
});

// 学院和课程数据
const colleges = ref<College[]>([]);
const courses = ref<Course[]>([]);
const selectedCollege = ref('');
const selectedCourse = ref('');

// 教师数据
const courseTeachers = ref<Teacher[]>([]);
const selectedTeacher = ref('');

// 聊天相关
const chatMessages = ref<ChatMessage[]>([]);
const messageContent = ref('');
const chatHistoryRef = ref<HTMLElement | null>(null);
const messagesLoading = ref(false);

// 快速提问选项
const quickAsks = ref([
  '请问这门课的考试范围是什么？',
  '这次作业截止日期是什么时候？',
  '能否推荐一些参考资料？',
  '请问上次课讲的内容有录屏吗？',
  '这个知识点我有些不理解，能再讲解一下吗？',
  '作业中的第三题该如何解答？'
]);

// 学生头像
const studentAvatar = computed(() => {
  return studentInfo.value.avatar || defaultAvatar;
});

// 根据学院筛选课程
const filteredCourses = computed(() => {
  if (!selectedCollege.value || courses.value.length === 0) {
    return [];
  }
  
  // 确保使用字符串比较
  const collegeIdStr = selectedCollege.value.toString();
  
  return courses.value.filter(course => {
    // 确保转换为字符串进行比较
    const courseCollegeIdStr = (course.collegeId || '').toString();
    return courseCollegeIdStr === collegeIdStr;
  });
});

// 当前选中的教师
const currentTeacher = computed(() => {
  if (!selectedTeacher.value) return null;
  return courseTeachers.value.find(teacher => teacher.teacherId === selectedTeacher.value);
});

// 当前聊天标题
const currentChatTitle = computed(() => {
  if (!selectedCourse.value || !selectedTeacher.value) return '';
  
  const courseName = courses.value.find(c => c.courseId === selectedCourse.value)?.courseName || '';
  const teacherName = currentTeacher.value?.name || '';
  
  return `${courseName} (${teacherName} 老师)`;
});

// 为每个教师存储最后联系时间
const teacherLastContact = ref<Record<string, number>>({});

// 获取与教师的最后联系时间
const getLastContactTime = (teacherId: string): string => {
  // 查找与该教师的最后一条消息
  const teacherMessages = chatMessages.value.filter(msg => 
    (msg.fromStudent && msg.recvId === parseInt(teacherId)) || 
    (!msg.fromStudent && msg.senderId === parseInt(teacherId))
  );
  
  if (teacherMessages.length === 0) {
    return '暂无记录';
  }
  
  // 获取最后一条消息的时间
  const lastMessage = teacherMessages[teacherMessages.length - 1];
  return formatTime(lastMessage.timestamp);
};

// 当前选中的学院名称
const selectedCollegeName = computed(() => {
  if (!selectedCollege.value) return '';
  const college = colleges.value.find(c => c.collegeId.toString() === selectedCollege.value.toString());
  return college ? college.collegeName : '';
});

// 获取学院列表
const fetchColleges = async () => {
  try {
    console.log('开始获取学院列表');
    
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
      
      // 获取学生所属学院ID
      const studentCollegeId = localStorage.getItem('collegeId');
      console.log('从localStorage获取的学生所属学院ID:', studentCollegeId);
      
      if (studentCollegeId) {
        // 确保类型一致，统一转为字符串进行比较
        const studentCollegeIdStr = studentCollegeId.toString();
        const foundCollege = colleges.value.find(c => c.collegeId.toString() === studentCollegeIdStr);
        
        if (foundCollege) {
          console.log(`找到学生所属学院: ${foundCollege.collegeName}，ID: ${studentCollegeIdStr}`);
          selectedCollege.value = studentCollegeIdStr;
          // 课程加载逻辑已移至onMounted
        } else {
          console.log(`未找到ID为${studentCollegeIdStr}的学院，使用第一个可用学院`);
          selectFirstCollege();
        }
      } else {
        console.log('学生没有所属学院，使用第一个可用学院');
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

// 获取课程列表
const fetchCourses = async (collegeId: string) => {
  try {
    console.log('开始获取课程，学院ID:', collegeId);
    
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    // 使用API获取指定学院的课程
    const response = await axios.get(`http://localhost:39999/lesson/byCollegeId/${collegeId}`, { headers });
    
    console.log("课程数据原始响应:", response);
    
    // 处理不同的数据结构
    let courseData;
    if (Array.isArray(response.data)) {
      console.log('响应数据是数组格式');
      courseData = response.data;
    } else if (response.data && response.data.code === 200 && response.data.data) {
      console.log('响应数据是标准格式: {code: 200, data: [...]}');
      courseData = response.data.data;
    } else {
      console.log('无法识别的响应数据格式');
      courseData = [];
    }
    
    console.log('处理前的课程数据:', courseData);
    
    // 映射课程数据到统一格式，匹配API返回的实际字段
    courses.value = courseData.map((course: any) => {
      const mappedCourse = {
        courseId: course.id.toString(),
        courseName: course.lessonName,
        collegeId: course.collegeId,
        description: course.description || ''
      };
      console.log('映射课程:', mappedCourse);
      return mappedCourse;
    });
    
    console.log("处理后的课程数据:", courses.value);
    console.log("当前选择的学院ID:", selectedCollege.value);
    
    if (courses.value.length === 0) {
      ElMessage.warning(`未找到学院课程，请确认该学院是否有课程数据`);
    } else {
      ElMessage.success(`成功获取${courses.value.length}门课程`);
    }
  } catch (error) {
    console.error('获取课程列表失败:', error);
    ElMessage.error('获取课程列表失败，请稍后再试');
    courses.value = [];
  }
};

// 获取课程教师
const fetchCourseTeachers = async (courseId: string) => {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    // 使用API获取课程教师信息
    console.log('获取课程教师信息，课程ID:', courseId);
    
    try {
      // 实际API调用，使用提供的接口路径
      const response = await axios.get(`http://localhost:39999/lesson/byId/${courseId}`, { headers });
      console.log('课程教师数据响应:', response);
      
      let teacherData: Teacher[] = [];
      if (response.data && Array.isArray(response.data)) {
        // 处理返回的教师列表
        teacherData = response.data.map((teacher: any) => ({
          teacherId: teacher.id.toString(),
          name: teacher.name || '未知教师',
          title: teacher.identity || '讲师',
          description: teacher.description || `${teacher.name || '未知'}老师，课程教师`,
          avatar: teacher.avatar || defaultAvatar,
          email: teacher.email || '',
          phone: teacher.phone || ''
        }));
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // 适配不同的API返回格式
        teacherData = response.data.data.map((teacher: any) => ({
          teacherId: teacher.id.toString(),
          name: teacher.name || '未知教师',
          title: teacher.identity || '讲师',
          description: teacher.description || `${teacher.name || '未知'}老师，课程教师`,
          avatar: teacher.avatar || defaultAvatar,
          email: teacher.email || '',
          phone: teacher.phone || ''
        }));
      } else {
        // 如果API返回但没有教师数据，显示警告
        console.warn('API返回数据不包含教师信息或数据格式不符合预期');
        ElMessage.warning('该课程暂未分配教师，请联系管理员');
      }
      
      console.log('处理后的教师数据:', teacherData);
      courseTeachers.value = teacherData;
      
      // 为教师添加随机的最后联系时间
      courseTeachers.value.forEach(teacher => {
        // 随机设置最后联系时间，从1小时到7天前
        const randomHours = Math.floor(Math.random() * 168) + 1; // 1小时到168小时(7天)
        teacherLastContact.value[teacher.teacherId] = Date.now() - (randomHours * 3600000);
      });
      
    } catch (apiError) {
      console.error('API调用失败，使用模拟数据:', apiError);
      
      // 如果API调用失败，使用模拟数据作为后备
      const mockTeachers: Teacher[] = [
        { 
          teacherId: courseId + '_T1', 
          name: '张教授', 
          title: '教授',
          description: '计算机科学博士，主要研究方向为人工智能和机器学习',
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          email: 'zhang.professor@university.edu',
          phone: '138-xxxx-1234'
        },
        { 
          teacherId: courseId + '_T2', 
          name: '李副教授', 
          title: '副教授',
          description: '软件工程专家，拥有多年教学经验',
          avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
          email: 'li.associate@university.edu',
          phone: '139-xxxx-5678'
        }
      ];
      
      // 初始化模拟的最后联系时间
      mockTeachers.forEach(teacher => {
        // 随机设置最后联系时间，从1小时到7天前
        const randomHours = Math.floor(Math.random() * 168) + 1; // 1小时到168小时(7天)
        teacherLastContact.value[teacher.teacherId] = Date.now() - (randomHours * 3600000);
      });
      
      courseTeachers.value = mockTeachers;
      console.log('课程教师数据(模拟):', courseTeachers.value);
      ElMessage.warning('获取教师信息失败，使用默认数据');
    }
    
    // 如果只有一个教师，自动选中
    if (courseTeachers.value.length === 1) {
      selectedTeacher.value = courseTeachers.value[0].teacherId;
    } else if (courseTeachers.value.length > 1) {
      ElMessage.success(`该课程有${courseTeachers.value.length}位教师，请选择要咨询的教师`);
    }
  } catch (error) {
    console.error('获取课程教师失败:', error);
    ElMessage.error('获取课程教师失败，请稍后再试');
    courseTeachers.value = [];
  }
};

// 获取聊天历史
const fetchChatHistory = async (teacherId: string) => {
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    // 获取学生ID
    const studentId = studentInfo.value.id;
    
    if (!studentId || !selectedCourse.value || !teacherId) {
      console.warn('获取聊天历史缺少必要参数:', { studentId, courseId: selectedCourse.value, teacherId });
      return;
    }
    
    console.log('获取聊天历史，参数:', { studentId, teacherId });
    messagesLoading.value = true;
    
    try {
      // 使用API获取聊天历史
      const response = await axios.get(`http://localhost:39999/notify/all/${teacherId}`, { headers });
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
            fromStudent: true, // 学生发送的消息
            status: msg.status,
            senderId: msg.senderId,
            recvId: msg.recvId
          })),
          ...recvList.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            timestamp: new Date(msg.timestamp).getTime(),
            fromStudent: false, // 教师发送的消息
            status: msg.status,
            senderId: msg.senderId,
            recvId: msg.recvId
          }))
        ];
        
        // 按发送时间排序
        allMessages.sort((a, b) => a.timestamp - b.timestamp);
        
        // 只保留当前选中教师的消息
        const teacherIdNum = parseInt(teacherId);
        const filteredMessages = allMessages.filter(msg => 
          (msg.fromStudent && msg.recvId === teacherIdNum) || 
          (!msg.fromStudent && msg.senderId === teacherIdNum)
        );
        
        chatMessages.value = filteredMessages;
        
        if (filteredMessages.length > 0) {
          ElMessage.success(`成功获取${filteredMessages.length}条聊天记录`);
        } else {
          console.log('没有与该教师的聊天记录');
          ElMessage.info('暂无与该教师的聊天记录');
        }
        
        // 更新教师最后联系时间
        if (filteredMessages.length > 0) {
          const lastMessage = filteredMessages[filteredMessages.length - 1];
          teacherLastContact.value[teacherId] = lastMessage.timestamp;
          console.log('更新教师最后联系时间:', teacherId, lastMessage.timestamp);
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
          content: '你好，我是你的课程老师。有什么可以帮助你的吗？',
          timestamp: Date.now() - 3600000, // 1小时前
          fromStudent: false
        },
        {
          content: '老师好，我想咨询一下关于下周考试的范围，是否包括所有课程内容？',
          timestamp: Date.now() - 3500000,
          fromStudent: true
        },
        {
          content: '考试范围主要包括第一章到第五章的内容，重点是第三章和第四章。建议你重点复习这两章的例题。',
          timestamp: Date.now() - 3400000,
          fromStudent: false
        }
      ];
      
      chatMessages.value = mockMessages;
      console.log('聊天历史数据(模拟):', chatMessages.value);
      
      // 使用模拟数据更新最后联系时间
      if (mockMessages.length > 0) {
        const lastMessage = mockMessages[mockMessages.length - 1];
        teacherLastContact.value[teacherId] = lastMessage.timestamp;
      }
    } finally {
      messagesLoading.value = false;
    }
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    ElMessage.error('获取聊天历史失败，请稍后再试');
    
    // 出错时使用空数组
    chatMessages.value = [];
    messagesLoading.value = false;
  }
};

// 课程变更处理
const handleCourseChange = async (courseId: string) => {
  selectedTeacher.value = '';
  chatMessages.value = [];
  
  await fetchCourseTeachers(courseId);
};

// 监听教师选择变化
watch(selectedTeacher, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    await fetchChatHistory(newVal);
  }
});

// 发送消息
const sendMessage = async () => {
  if (!messageContent.value.trim() || !selectedTeacher.value) return;
  
  // 创建新消息
  const newMessage: ChatMessage = {
    content: messageContent.value.trim(),
    timestamp: Date.now(),
    fromStudent: true
  };
  
  try {
    // 获取token
    const token = localStorage.getItem('token');
    // 设置请求头，将token放入header
    const headers = { 
      'token': token || ''
    };
    
    // 获取学生ID
    const studentId = studentInfo.value.id;
    
    if (!studentId || !selectedCourse.value || !selectedTeacher.value) {
      console.warn('发送消息缺少必要参数:', { studentId, courseId: selectedCourse.value, teacherId: selectedTeacher.value });
      ElMessage.error('发送失败，请检查登录状态');
      return;
    }
    
    // 获取教师姓名
    const teacherName = currentTeacher.value?.name || '未知教师';
    
    // 构建发送消息的请求体
    const messageData = {
      senderId: parseInt(studentId), // 发送者是学生ID
      recvId: parseInt(selectedTeacher.value), // 接收者是老师ID
      content: messageContent.value.trim(),
      recvName: teacherName,
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
        if (selectedTeacher.value) {
          await fetchChatHistory(selectedTeacher.value);
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
        const teacherReply: ChatMessage = {
          content: '收到你的消息，我会尽快回复。(模拟回复)',
          timestamp: Date.now(),
          fromStudent: false
        };
        
        chatMessages.value.push(teacherReply);
        
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

// 使用快速提问
const useQuickAsk = (ask: string) => {
  messageContent.value = ask;
};

// 添加表情到消息
const addEmoji = (emoji: string) => {
  messageContent.value += emoji;
};

// 获取标签类型，用于不同样式的快速提问
const getTagType = (index: number): string => {
  const types = ['', 'info', 'success', 'warning', 'danger'];
  return types[index % types.length];
};

// 页面加载
onMounted(async () => {
  try {
    console.log('页面加载中...');
    
    // 加载学生信息
    const id = localStorage.getItem('id') || '';
    const name = localStorage.getItem('name') || '';
    const collegeId = localStorage.getItem('collegeId') || '';
    const avatar = localStorage.getItem('avatar') || defaultAvatar;
    
    studentInfo.value = { id, name, collegeId, avatar };
    console.log('加载的学生信息:', studentInfo.value);
    
    // 加载学院列表
    await fetchColleges();
    
    // 自动选择用户所属学院的课程
    if (selectedCollege.value) {
      await fetchCourses(selectedCollege.value);
    }
  } catch (error) {
    console.error('页面初始化失败:', error);
    ElMessage.error('页面加载失败，请刷新重试');
  }
});
</script>

<style scoped>
.course-consult-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
  height: calc(100vh - 30px);
  display: flex;
  flex-direction: column;
}

.el-row {
  flex: 1;
  height: 100%;
}

.el-col {
  height: 100%;
}

.selection-card, .chat-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #f8f9fa;
  min-height: 24px;
  max-height: 24px;
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

.teacher-list {
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  background-color: #FFFFFF;
  scrollbar-width: thin;
}

.teacher-list::-webkit-scrollbar {
  width: 6px;
}

.teacher-list::-webkit-scrollbar-track {
  background: #FFFFFF;
}

.teacher-list::-webkit-scrollbar-thumb {
  background-color: #E4E7ED;
  border-radius: 3px;
}

.teacher-radio-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.teacher-item {
  padding: 14px 15px;
  border-bottom: 1px solid #EBEEF5;
  transition: all 0.3s;
}

.teacher-item:hover {
  background-color: #F5F7FA;
}

.selected-teacher {
  background-color: #EBF5FF;
}

.teacher-item:last-child {
  border-bottom: none;
}

.teacher-radio {
  width: 100%;
  margin-right: 0;
}

.teacher-info {
  display: flex;
  align-items: center;
}

.teacher-detail {
  margin-left: 8px;
  flex: 1;
  min-width: 0; /* 允许内容缩小到容器宽度 */
  width: 100%;
}

.teacher-name-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 2px;
}

.teacher-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-right: 6px;
}

.teacher-title {
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
  padding: 0 4px;
  border-radius: 4px;
}

.teacher-email {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.teacher-email .el-icon {
  font-size: 12px;
  margin-right: 4px;
  flex-shrink: 0;
}

.email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-info-bar {
  display: flex;
  align-items: center;
  padding: 6px 20px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #FFFFFF;
  min-height: 28px;
  max-height: 28px;
}

.student-brief {
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

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 0;
  min-height: 150px;
  max-height: calc(100vh - 280px);
  margin-bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #C0C4CC #f5f7fa;
}

.chat-history::-webkit-scrollbar {
  width: 6px;
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
  border-radius: 0;
  max-height: calc(100vh - 280px);
  min-height: 150px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 5px;
}

.message-sent {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  margin-top: 4px;
}

.message-content {
  max-width: 75%;
  margin: 0 10px;
}

.message-sent .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 12px 14px;
  border-radius: 16px;
  word-break: break-word;
  line-height: 1.5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  position: relative;
  overflow-wrap: break-word;
}

.message-sent .message-text {
  background-color: #409EFF;
  color: white;
  border-top-right-radius: 4px;
  text-align: left;
}

.message-received .message-text {
  background-color: white;
  color: #303133;
  border-top-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  padding: 0 4px;
}

.message-sent .message-time {
  text-align: right;
}

.chat-date-divider {
  text-align: center;
  margin: 20px 0;
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
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 12px;
  color: #606266;
  position: relative;
  z-index: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-asks {
  padding: 6px 12px;
  border-top: 1px solid #EBEEF5;
  background-color: #FFFFFF;
  max-height: 40px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.ask-chips {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding-bottom: 4px;
}

.ask-chip {
  margin: 1px;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 0.2s;
  font-size: 12px;
  white-space: nowrap;
}

.ask-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quick-asks::-webkit-scrollbar {
  height: 4px;
}

.quick-asks::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.quick-asks::-webkit-scrollbar-thumb {
  background-color: #C0C4CC;
  border-radius: 2px;
}

.message-input {
  padding: 10px 15px;
  background-color: #FFFFFF;
  border-top: 1px solid #EBEEF5;
  position: relative;
  z-index: 10;
  height: 180px;
  max-height: 180px;
  min-height: 180px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.message-input .el-textarea {
  height: 130px;
  flex: 1;
}

.message-input .el-textarea__inner {
  height: 130px !important;
  min-height: 130px !important;
  max-height: 130px !important;
  resize: none !important;
  font-size: 14px !important;
  padding: 12px;
  line-height: 1.5;
  border-radius: 8px;
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
  flex-wrap: wrap;
}

.send-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 2px;
  text-align: right;
  white-space: nowrap;
}

.empty-subtitle {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.input-actions .el-button {
  padding: 4px 8px;
  font-size: 16px;
}

.send-button {
  margin-left: 8px;
  padding: 6px 15px !important;
}

/* 特殊情况的媒体查询 */
@media screen and (min-height: 768px) {
  .chat-history {
    max-height: calc(100vh - 280px);
  }
  
  .message-input {
    height: 180px;
    max-height: 180px;
    min-height: 180px;
  }
  
  .message-input .el-textarea {
    height: 130px;
  }
  
  .message-input .el-textarea__inner {
    height: 130px !important;
    min-height: 130px !important;
  }
}

/* 小屏幕适配 */
@media screen and (max-height: 670px) {
  .course-consult-container {
    padding: 5px;
  }
  
  .card-header {
    padding: 5px 12px;
    min-height: 20px;
    max-height: 20px;
  }
  
  .student-info-bar {
    padding: 4px 12px;
    min-height: 24px;
    max-height: 24px;
  }
  
  .chat-history {
    padding: 10px;
    max-height: calc(100vh - 260px);
  }
  
  .teacher-list {
    max-height: calc(100vh - 250px);
  }
  
  .message-input {
    height: 160px;
    max-height: 160px;
    min-height: 160px;
    padding: 8px 10px;
  }
  
  .message-input .el-textarea {
    height: 110px;
  }
  
  .message-input .el-textarea__inner {
    height: 110px !important;
    min-height: 110px !important;
  }
  
  .input-footer {
    padding-top: 5px;
  }
}

.teacher-status {
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

.selected-college-name {
  font-size: 14px;
  color: #409EFF;
  font-weight: 500;
  margin-bottom: 8px;
  padding: 4px 8px;
  background-color: #ecf5ff;
  border-radius: 4px;
  display: inline-block;
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