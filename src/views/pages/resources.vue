<template>
  <div class="resources-container">
    <!-- 页面标题区域 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="title-card" shadow="hover">
          <div class="resource-header">
            <div class="header-content">
              <h2>教学资源中心</h2>
              <div class="subtitle">汇集各类教学资料，助力教学工作</div>
            </div>
            <div class="header-actions">
              <el-input
                placeholder="搜索资源..."
                prefix-icon="Search"
                v-model="searchKeyword"
                class="search-input"
                clearable
              />
              <el-button type="primary" :icon="Plus" v-if="isTeacher">上传资源</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容区 -->
    <el-row :gutter="20" class="mt-20">
      <!-- 左侧导航 -->
      <el-col :xs="24" :md="6">
        <el-card shadow="hover" class="menu-card">
          <template #header>
            <div class="card-header">
              <span>资源分类</span>
            </div>
          </template>
          <el-menu
            :default-active="activeCategory"
            class="resource-menu"
            @select="handleCategorySelect"
          >
            <el-menu-item index="all">
              <el-icon><Files /></el-icon>
              <span>全部资源</span>
            </el-menu-item>
            <el-menu-item index="document">
              <el-icon><Document /></el-icon>
              <span>文档资料</span>
            </el-menu-item>
            <el-menu-item index="video">
              <el-icon><VideoPlay /></el-icon>
              <span>视频教程</span>
            </el-menu-item>
            <el-menu-item index="audio">
              <el-icon><Headset /></el-icon>
              <span>音频讲座</span>
            </el-menu-item>
            <el-menu-item index="ppt">
              <el-icon><PictureRounded /></el-icon>
              <span>教学课件</span>
            </el-menu-item>
            <el-menu-item index="code">
              <el-icon><Cpu /></el-icon>
              <span>代码示例</span>
            </el-menu-item>
            <el-divider />
            <el-menu-item index="favorite">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="history">
              <el-icon><Timer /></el-icon>
              <span>最近使用</span>
            </el-menu-item>
          </el-menu>
          
          <div class="storage-info">
            <div class="storage-title">
              <span>存储空间</span>
              <span class="storage-value">{{ usedStorage }} / {{ totalStorage }}</span>
            </div>
            <el-progress 
              :percentage="storagePercentage" 
              :color="storageColor"
              :format="() => ''"
              :stroke-width="12"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧资源列表 -->
      <el-col :xs="24" :md="18">
        <!-- 最近使用 -->
        <el-card shadow="hover" class="recent-card">
          <template #header>
            <div class="card-header">
              <span>最近使用</span>
              <el-button text>查看更多</el-button>
            </div>
          </template>
          <el-scrollbar>
            <div class="recent-list">
              <div 
                v-for="(item, index) in recentResources" 
                :key="index" 
                class="recent-item"
                @click="viewResource(item)"
              >
                <div class="resource-icon" :class="item.type">
                  <el-icon v-if="item.type === 'document'"><Document /></el-icon>
                  <el-icon v-else-if="item.type === 'video'"><VideoPlay /></el-icon>
                  <el-icon v-else-if="item.type === 'audio'"><Headset /></el-icon>
                  <el-icon v-else-if="item.type === 'ppt'"><PictureRounded /></el-icon>
                  <el-icon v-else-if="item.type === 'code'"><Cpu /></el-icon>
                  <el-icon v-else><Files /></el-icon>
                </div>
                <div class="resource-name">{{ item.name }}</div>
              </div>
            </div>
          </el-scrollbar>
        </el-card>

        <!-- 资源列表 -->
        <el-card shadow="hover" class="resource-list-card">
          <template #header>
            <div class="card-header">
              <span>{{ getCategoryName(activeCategory) }}</span>
              <div class="card-actions">
                <el-radio-group v-model="viewMode" size="small">
                  <el-radio-button label="grid"><el-icon><Grid /></el-icon></el-radio-button>
                  <el-radio-button label="list"><el-icon><List /></el-icon></el-radio-button>
                </el-radio-group>
                <el-dropdown>
                  <el-button text>
                    排序方式
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="sortResources('time')">时间</el-dropdown-item>
                      <el-dropdown-item @click="sortResources('name')">名称</el-dropdown-item>
                      <el-dropdown-item @click="sortResources('size')">大小</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="resource-grid">
            <el-row :gutter="20">
              <el-col 
                v-for="(resource, index) in filteredResources" 
                :key="index"
                :xs="12" 
                :sm="8" 
                :md="6"
                :lg="4"
              >
                <div class="resource-card" @click="viewResource(resource)">
                  <div class="resource-icon-large" :class="resource.type">
                    <el-icon v-if="resource.type === 'document'"><Document /></el-icon>
                    <el-icon v-else-if="resource.type === 'video'"><VideoPlay /></el-icon>
                    <el-icon v-else-if="resource.type === 'audio'"><Headset /></el-icon>
                    <el-icon v-else-if="resource.type === 'ppt'"><PictureRounded /></el-icon>
                    <el-icon v-else-if="resource.type === 'code'"><Cpu /></el-icon>
                    <el-icon v-else><Files /></el-icon>
                  </div>
                  <div class="resource-info">
                    <div class="resource-name">{{ resource.name }}</div>
                    <div class="resource-meta">
                      <span>{{ resource.size }}</span>
                      <span>{{ resource.date }}</span>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button v-if="resource.favorite" circle type="warning" :icon="Star" size="small" @click.stop="toggleFavorite(resource)" />
                    <el-button v-else circle :icon="Star" size="small" @click.stop="toggleFavorite(resource)" />
                    <el-dropdown @command="(command) => handleCommand(command, resource)" trigger="click">
                      <el-button circle :icon="MoreFilled" size="small" @click.stop />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="download">下载</el-dropdown-item>
                          <el-dropdown-item command="share">分享</el-dropdown-item>
                          <el-dropdown-item command="rename">重命名</el-dropdown-item>
                          <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 列表视图 -->
          <div v-else>
            <el-table :data="filteredResources" style="width: 100%">
              <el-table-column label="名称" min-width="240">
                <template #default="{ row }">
                  <div class="resource-row">
                    <div class="resource-icon" :class="row.type">
                      <el-icon v-if="row.type === 'document'"><Document /></el-icon>
                      <el-icon v-else-if="row.type === 'video'"><VideoPlay /></el-icon>
                      <el-icon v-else-if="row.type === 'audio'"><Headset /></el-icon>
                      <el-icon v-else-if="row.type === 'ppt'"><PictureRounded /></el-icon>
                      <el-icon v-else-if="row.type === 'code'"><Cpu /></el-icon>
                      <el-icon v-else><Files /></el-icon>
                    </div>
                    <span class="resource-name-text">{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="owner" label="所有者" width="120" />
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="size" label="大小" width="120" />
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <div class="table-actions">
                    <el-button v-if="row.favorite" circle type="warning" :icon="Star" size="small" @click="toggleFavorite(row)" />
                    <el-button v-else circle :icon="Star" size="small" @click="toggleFavorite(row)" />
                    <el-dropdown @command="(command) => handleCommand(command, row)" trigger="click">
                      <el-button circle :icon="MoreFilled" size="small" />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="download">下载</el-dropdown-item>
                          <el-dropdown-item command="share">分享</el-dropdown-item>
                          <el-dropdown-item command="rename">重命名</el-dropdown-item>
                          <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页控件 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 36, 48]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalResources"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import {
  Document, Files, VideoPlay, Headset, PictureRounded, Cpu,
  Star, Timer, Search, Plus, Grid, List, ArrowDown, MoreFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义资源接口
interface Resource {
  id: string
  name: string
  type: 'document' | 'video' | 'audio' | 'ppt' | 'code' | 'other'
  size: string
  date: string
  owner: string
  favorite: boolean
}

// 页面状态
const searchKeyword = ref('')
const activeCategory = ref('all')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(12)
const isTeacher = ref(true) // 在实际应用中，应该根据用户角色来判断

// 存储信息
const usedStorage = ref('2.6 GB')
const totalStorage = ref('10 GB')
const storagePercentage = ref(26)
const storageColor = computed(() => {
  if (storagePercentage.value < 50) return '#67C23A'
  if (storagePercentage.value < 80) return '#E6A23C'
  return '#F56C6C'
})

// 模拟资源数据
const resourcesData = ref<Resource[]>([
  { 
    id: '1', 
    name: 'Java程序设计教程.pdf', 
    type: 'document', 
    size: '2.5 MB', 
    date: '2025-12-20', 
    owner: '张教授',
    favorite: true
  },
  { 
    id: '2', 
    name: '数据结构与算法导论.docx', 
    type: 'document', 
    size: '1.2 MB', 
    date: '2025-12-18', 
    owner: '李老师',
    favorite: false
  },
  { 
    id: '3', 
    name: '计算机网络原理视频教程.mp4', 
    type: 'video', 
    size: '156 MB', 
    date: '2025-12-15', 
    owner: '王教授',
    favorite: true
  },
  { 
    id: '4', 
    name: '数据库系统概论课件.pptx', 
    type: 'ppt', 
    size: '5.7 MB', 
    date: '2025-12-10', 
    owner: '张教授',
    favorite: false
  },
  { 
    id: '5', 
    name: '编程实战案例代码.zip', 
    type: 'code', 
    size: '8.2 MB', 
    date: '2025-12-05', 
    owner: '赵老师',
    favorite: false
  },
  { 
    id: '6', 
    name: '软件工程学科讲座.mp3', 
    type: 'audio', 
    size: '35.6 MB', 
    date: '2025-12-01', 
    owner: '陈教授',
    favorite: false
  },
  { 
    id: '7', 
    name: '人工智能入门指南.pdf', 
    type: 'document', 
    size: '4.3 MB', 
    date: '2025-11-28', 
    owner: '刘教授',
    favorite: true
  },
  { 
    id: '8', 
    name: '操作系统原理.docx', 
    type: 'document', 
    size: '3.1 MB', 
    date: '2025-11-25', 
    owner: '吴老师',
    favorite: false
  },
  { 
    id: '9', 
    name: '计算机图形学演示视频.mp4', 
    type: 'video', 
    size: '128 MB', 
    date: '2025-11-20', 
    owner: '林教授',
    favorite: false
  },
  { 
    id: '10', 
    name: '编译原理课件.pptx', 
    type: 'ppt', 
    size: '7.6 MB', 
    date: '2025-11-15', 
    owner: '张教授',
    favorite: false
  },
  { 
    id: '11', 
    name: 'Python编程示例.zip', 
    type: 'code', 
    size: '6.9 MB', 
    date: '2025-11-10', 
    owner: '孙老师',
    favorite: true
  },
  { 
    id: '12', 
    name: '计算机科学前沿讲座.mp3', 
    type: 'audio', 
    size: '42.1 MB', 
    date: '2025-11-05', 
    owner: '周教授',
    favorite: false
  },
  { 
    id: '13', 
    name: '机器学习基础教程.pdf', 
    type: 'document', 
    size: '5.2 MB', 
    date: '2025-11-01', 
    owner: '郑教授',
    favorite: false
  },
  { 
    id: '14', 
    name: '算法设计与分析.docx', 
    type: 'document', 
    size: '2.8 MB', 
    date: '2025-10-28', 
    owner: '王老师',
    favorite: false
  },
  { 
    id: '15', 
    name: '网络安全技术视频.mp4', 
    type: 'video', 
    size: '192 MB', 
    date: '2025-10-25', 
    owner: '李教授',
    favorite: true
  },
  { 
    id: '16', 
    name: '分布式系统课件.pptx', 
    type: 'ppt', 
    size: '6.4 MB', 
    date: '2025-10-20', 
    owner: '张教授',
    favorite: false
  },
  { 
    id: '17', 
    name: 'Web开发实例代码.zip', 
    type: 'code', 
    size: '11.3 MB', 
    date: '2025-10-15', 
    owner: '赵老师',
    favorite: false
  },
  { 
    id: '18', 
    name: '大数据技术讲座.mp3', 
    type: 'audio', 
    size: '38.7 MB', 
    date: '2025-10-10', 
    owner: '刘教授',
    favorite: false
  }
])

// 最近使用的资源
const recentResources = ref<Resource[]>([
  { 
    id: '1', 
    name: 'Java程序设计教程.pdf', 
    type: 'document', 
    size: '2.5 MB', 
    date: '2025-12-20', 
    owner: '张教授',
    favorite: true
  },
  { 
    id: '3', 
    name: '计算机网络原理视频教程.mp4', 
    type: 'video', 
    size: '156 MB', 
    date: '2025-12-15', 
    owner: '王教授',
    favorite: true
  },
  { 
    id: '5', 
    name: '编程实战案例代码.zip', 
    type: 'code', 
    size: '8.2 MB', 
    date: '2025-12-05', 
    owner: '赵老师',
    favorite: false
  },
  { 
    id: '7', 
    name: '人工智能入门指南.pdf', 
    type: 'document', 
    size: '4.3 MB', 
    date: '2025-11-28', 
    owner: '刘教授',
    favorite: true
  },
  { 
    id: '11', 
    name: 'Python编程示例.zip', 
    type: 'code', 
    size: '6.9 MB', 
    date: '2025-11-10', 
    owner: '孙老师',
    favorite: true
  }
])

// 计算总资源数
const totalResources = computed(() => resourcesData.value.length)

// 过滤资源
const filteredResources = computed(() => {
  let result = [...resourcesData.value]
  
  // 根据分类过滤
  if (activeCategory.value !== 'all') {
    if (activeCategory.value === 'favorite') {
      result = result.filter(item => item.favorite)
    } else if (activeCategory.value === 'history') {
      result = recentResources.value
    } else {
      result = result.filter(item => item.type === activeCategory.value)
    }
  }
  
  // 根据关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.owner.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// 获取分类名称
const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    'all': '全部资源',
    'document': '文档资料',
    'video': '视频教程',
    'audio': '音频讲座',
    'ppt': '教学课件',
    'code': '代码示例',
    'favorite': '我的收藏',
    'history': '最近使用'
  }
  return categoryMap[category] || '全部资源'
}

// 处理分类选择
const handleCategorySelect = (index: string) => {
  activeCategory.value = index
  currentPage.value = 1
}

// 切换收藏状态
const toggleFavorite = (resource: Resource) => {
  resource.favorite = !resource.favorite
  ElMessage({
    message: resource.favorite ? `已收藏 ${resource.name}` : `已取消收藏 ${resource.name}`,
    type: resource.favorite ? 'success' : 'info'
  })
}

// 查看资源
const viewResource = (resource: Resource) => {
  ElMessage({
    message: `正在查看 ${resource.name}`,
    type: 'success'
  })
  
  // 添加到最近使用
  if (!recentResources.value.find(item => item.id === resource.id)) {
    recentResources.value.unshift(resource)
    if (recentResources.value.length > 5) {
      recentResources.value.pop()
    }
  }
}

// 排序资源
const sortResources = (type: string) => {
  if (type === 'time') {
    resourcesData.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } else if (type === 'name') {
    resourcesData.value.sort((a, b) => a.name.localeCompare(b.name))
  } else if (type === 'size') {
    resourcesData.value.sort((a, b) => {
      const getSizeInBytes = (sizeStr: string) => {
        const value = parseFloat(sizeStr.split(' ')[0])
        const unit = sizeStr.split(' ')[1]
        if (unit === 'GB') return value * 1024 * 1024 * 1024
        if (unit === 'MB') return value * 1024 * 1024
        if (unit === 'KB') return value * 1024
        return value
      }
      return getSizeInBytes(b.size) - getSizeInBytes(a.size)
    })
  }
}

// 处理下拉菜单命令
const handleCommand = (command: string, resource: Resource) => {
  switch (command) {
    case 'download':
      ElMessage.success(`正在下载 ${resource.name}`)
      break
    case 'share':
      ElMessage.success(`已生成 ${resource.name} 的分享链接`)
      break
    case 'rename':
      ElMessageBox.prompt('请输入新名称', '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: resource.name
      }).then(({ value }) => {
        resource.name = value
        ElMessage.success(`已重命名为 ${value}`)
      }).catch(() => {})
      break
    case 'delete':
      ElMessageBox.confirm(
        `确定要删除 ${resource.name} 吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        resourcesData.value = resourcesData.value.filter(item => item.id !== resource.id)
        recentResources.value = recentResources.value.filter(item => item.id !== resource.id)
        ElMessage.success(`已删除 ${resource.name}`)
      }).catch(() => {})
      break
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

onMounted(() => {
  // 模拟加载数据
  setTimeout(() => {
    ElMessage.success('教学资源加载完成')
  }, 500)
})
</script>

<style scoped>
.resources-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

/* 标题卡片样式 */
.title-card {
  background: linear-gradient(135deg, #36cfc9 0%, #1890ff 100%);
  color: white;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.subtitle {
  margin-top: 5px;
  font-size: 14px;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 200px;
}

/* 菜单卡片样式 */
.menu-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-menu {
  border-right: 0;
}

.storage-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.storage-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.storage-value {
  font-weight: bold;
}

/* 最近使用卡片样式 */
.recent-card {
  margin-bottom: 20px;
}

.recent-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.recent-item {
  flex: 0 0 auto;
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.recent-item:hover {
  background-color: #f0f2f5;
}

.resource-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.resource-icon-large {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 30px;
  margin-bottom: 10px;
}

.resource-name {
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* 资源类型图标颜色 */
.document {
  background-color: #409EFF;
}

.video {
  background-color: #F56C6C;
}

.audio {
  background-color: #E6A23C;
}

.ppt {
  background-color: #67C23A;
}

.code {
  background-color: #909399;
}

.other {
  background-color: #B0BABF;
}

/* 资源列表卡片样式 */
.resource-list-card {
  margin-bottom: 20px;
}

.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 网格视图样式 */
.resource-grid {
  padding: 10px 0;
}

.resource-card {
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  position: relative;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.resource-info {
  width: 100%;
  text-align: center;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.resource-actions {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

/* 列表视图样式 */
.resource-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resource-name-text {
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 5px;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .resource-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .recent-list {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .recent-item {
    width: 80px;
  }
}
</style> 