<template>
  <div class="announcement-container">
    <div class="page-header">
      <h1 class="page-title">系统公告</h1>
    </div>
    
    <div class="content-section">
      <el-row :gutter="20">
        <!-- 左侧公告区域 -->
        <el-col :span="16">
          <el-card shadow="hover" class="announcement-card">
            <template #header>
              <div class="card-header">
                <h2 class="header-title">
                  <el-icon><Bell /></el-icon>
                  最新公告
                </h2>
                <el-tag type="primary" effect="plain" size="large">{{announcements.length}}条未读</el-tag>
              </div>
            </template>
            
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in announcements"
                :key="index"
                :timestamp="item.time"
                :type="getItemType(index)"
                :hollow="index > 1"
                placement="top"
              >
                <el-card class="announcement-item">
                  <div class="announcement-title">
                    <span>{{ item.title }}</span>
                    <el-tag v-if="index === 0" type="danger" size="small">NEW</el-tag>
                  </div>
                  <div class="announcement-content">{{ item.content }}</div>
                  <div class="announcement-footer">
                    <span class="publisher">发布人: {{ item.publisher }}</span>
                    <el-button text type="primary" @click="viewDetail(item)">查看详情</el-button>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="50"
                :page-size="5"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </el-col>
        
        <!-- 右侧信息区域 -->
        <el-col :span="8">
          <!-- 系统信息卡片 -->
          <el-card shadow="hover" class="info-card">
            <template #header>
              <div class="card-header">
                <h2 class="header-title">
                  <el-icon><InfoFilled /></el-icon>
                  系统信息
                </h2>
              </div>
            </template>
            
            <div class="system-info">
              <div class="info-item">
                <span class="info-label">当前版本：</span>
                <el-tag type="success" effect="plain">V2.5.0</el-tag>
              </div>
              <div class="info-item">
                <span class="info-label">上线日期：</span>
                <span>2025-04-20</span>
              </div>
              <div class="info-item">
                <span class="info-label">系统状态：</span>
                <el-tag type="success">运行正常</el-tag>
              </div>
              <div class="info-item">
                <span class="info-label">最近维护：</span>
                <span>2025-04-15 23:00-次日01:00</span>
              </div>
            </div>
            
            <el-divider content-position="center">系统更新日志</el-divider>
            
            <div class="update-logs">
              <div class="log-item">
                <div class="log-title">V2.5.0 (2025-04-20)</div>
                <ul class="log-details">
                  <li>新增智能评分功能</li>
                  <li>优化试卷解析流程</li>
                  <li>修复批量导入成绩问题</li>
                </ul>
              </div>
              <div class="log-item">
                <div class="log-title">V2.4.2 (2025-03-15)</div>
                <ul class="log-details">
                  <li>增强数据分析功能</li>
                  <li>改进用户界面体验</li>
                </ul>
              </div>
            </div>
          </el-card>
          
          <!-- 常见问题卡片 -->
          <el-card shadow="hover" class="faq-card">
            <template #header>
              <div class="card-header">
                <h2 class="header-title">
                  <el-icon><QuestionFilled /></el-icon>
                  常见问题
                </h2>
              </div>
            </template>
            
            <el-collapse accordion>
              <el-collapse-item v-for="(faq, index) in faqs" :key="index" :title="faq.question" :name="index">
                <div class="faq-answer">{{ faq.answer }}</div>
              </el-collapse-item>
            </el-collapse>
            
            <div class="more-help">
              <el-button type="primary" plain @click="showHelpCenter">
                <el-icon><Service /></el-icon>
                查看更多帮助
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { 
  Bell, 
  InfoFilled, 
  QuestionFilled, 
  Service, 
  Document, 
  CircleCheck
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';

// 公告数据接口定义
interface Announcement {
  id: number;
  title: string;
  content: string;
  time: string;
  publisher: string;
  tag?: string;
  detailUrl?: string;
}

// FAQ数据接口定义
interface FAQ {
  question: string;
  answer: string;
}

// 公告列表数据
const announcements = ref<Announcement[]>([
  {
    id: 1,
    title: '试卷批阅系统V2.5.0版本发布',
    content: '我们很高兴地宣布，试卷批阅系统V2.5.0版本已正式发布！此次更新包含多项新功能和性能优化，特别是新增了智能评分功能，可以大幅提高批阅效率。请各位教师及时更新系统，并查看系统使用指南了解新功能的使用方法。',
    time: '2025-04-20',
    publisher: '系统管理员',
    tag: 'important'
  },
  {
    id: 2,
    title: '关于期末考试在线批阅工作安排',
    content: '各位教师请注意，本学期期末考试批阅工作将从6月10日开始，请提前做好准备。系统将于6月9日晚上进行维护升级，确保批阅过程顺利进行。请各位教师熟悉系统操作流程，如有问题请及时联系技术支持团队。',
    time: '2025-04-18',
    publisher: '教务处',
    tag: 'notice'
  },
  {
    id: 3,
    title: '教师培训会通知',
    content: '为了帮助各位教师更好地使用在线批阅系统，学校将于下周三下午3点在图书馆报告厅举办系统使用培训会。本次培训将详细介绍系统的各项功能及操作方法，特别是新增的智能评分功能。请各系部教师积极参加。',
    time: '2025-04-15',
    publisher: '培训部',
    tag: 'training'
  },
  {
    id: 4,
    title: '系统维护通知',
    content: '为保障系统稳定运行，系统将于本周日凌晨2:00-4:00进行例行维护。维护期间，系统将暂停服务。请各位用户提前做好相关工作安排，对此带来的不便敬请谅解。',
    time: '2025-04-10',
    publisher: '技术支持',
    tag: 'maintenance'
  },
  {
    id: 5,
    title: '关于加强试卷保密工作的通知',
    content: '为确保考试公平公正，请各位教师严格遵守试卷保密规定，不得将试题及答案提前泄露给学生。在使用在线批阅系统时，请注意保护个人账号密码安全，避免他人未经授权访问系统。',
    time: '2025-04-05',
    publisher: '教务处',
    tag: 'security'
  }
]);

// 常见问题数据
const faqs = ref<FAQ[]>([
  {
    question: '如何开始批阅试卷？',
    answer: '登录系统后，点击左侧菜单的"在线批阅"，选择要批阅的考试，然后点击"开始批阅"按钮即可进入批阅界面。'
  },
  {
    question: '如何设置评分标准？',
    answer: '在考试管理页面，点击对应考试的"试卷设置"按钮，在弹出的对话框中可以设置不同题型的评分标准和评分要点。'
  },
  {
    question: '批阅过程中如何添加批注？',
    answer: '在批阅界面，选中需要添加批注的区域，然后点击工具栏中的"添加批注"按钮，输入批注内容后保存即可。'
  },
  {
    question: '如何查看统计数据？',
    answer: '在左侧菜单点击"成绩统计"，选择需要查看的考试，系统会自动生成各类统计图表，包括成绩分布、平均分、最高分等数据。'
  },
  {
    question: '忘记密码怎么办？',
    answer: '点击登录页面的"忘记密码"链接，按照提示输入注册邮箱，系统会向您的邮箱发送重置密码的链接。'
  }
]);

// 设置时间线项目类型
const getItemType = (index: number) => {
  const types = ['primary', 'success', 'warning', 'info', 'danger'];
  return types[index % types.length];
};

// 切换页码
const handleCurrentChange = (page: number) => {
  ElMessage.success(`切换到第${page}页`);
  // 实际应用中这里需要加载对应页的数据
};

// 查看公告详情
const viewDetail = (item: Announcement) => {
  ElMessage.info(`查看公告：${item.title}`);
  // 实际应用中这里可以跳转到详情页或显示详情弹窗
};

// 显示帮助中心
const showHelpCenter = () => {
  ElMessage.info('帮助中心功能即将上线');
};

onMounted(() => {
  // 获取公告列表数据
  // 实际应用中可以从API获取数据
  console.log('页面加载完成，获取公告数据');
});
</script>

<style scoped>
.announcement-container {
  width: 100%;
  min-height: 100%;
  background-color: #f5f7fa;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.content-section {
  margin-bottom: 20px;
}

.announcement-card, .info-card, .faq-card {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
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
  font-weight: 600;
  margin: 0;
}

.header-title .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.announcement-item {
  margin-bottom: 15px;
  border-radius: 8px;
}

.announcement-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.announcement-content {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.5;
  text-align: justify;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.publisher {
  font-style: italic;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.system-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-label {
  font-weight: 500;
  color: #606266;
}

.update-logs {
  margin-bottom: 15px;
}

.log-item {
  margin-bottom: 15px;
}

.log-title {
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 8px;
}

.log-details {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #606266;
}

.log-details li {
  margin-bottom: 5px;
}

.faq-card {
  margin-top: 20px;
}

.faq-answer {
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin-top: 5px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.more-help {
  margin-top: 15px;
  text-align: center;
}
</style> 