<template>
  <div class="college-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="left">
        <h2>学院管理</h2>
        <p class="description">管理学校所有学院信息</p>
      </div>
      <div class="right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增学院
        </el-button>
      </div>
    </div>

    <!-- 搜索框 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-header">
        <div class="search-title">
          <el-icon><Search /></el-icon>
          <span>搜索筛选</span>
        </div>
        <el-button text @click="isExpand = !isExpand">
          {{ isExpand ? '收起' : '展开' }}
          <el-icon>
            <component :is="isExpand ? 'ArrowUp' : 'ArrowDown'" />
          </el-icon>
        </el-button>
      </div>
      <el-form 
        :model="queryForm" 
        label-width="80px" 
        :inline="true" 
        class="search-form" 
        v-show="isExpand"
      >
        <el-form-item label="学院名称">
          <el-input 
            v-model="queryForm.collegeName" 
            placeholder="请输入学院名称" 
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option :label="'启用'" :value="1">
              <div class="status-option">
                <el-tag type="success" size="small">启用</el-tag>
                <span class="status-desc">可正常使用的学院</span>
              </div>
            </el-option>
            <el-option :label="'禁用'" :value="0">
              <div class="status-option">
                <el-tag type="info" size="small">禁用</el-tag>
                <span class="status-desc">已被禁用的学院</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 学院列表 -->
    <el-card class="list-card" shadow="hover">
      <div class="list-header">
        <div class="list-title">
          <el-icon><Grid /></el-icon>
          <span>学院列表</span>
        </div>
        <div class="list-count">
          共 <span class="count-number">{{ total }}</span> 条数据
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="collegeList"
        row-key="id"
        border
        stripe
        highlight-current-row
        style="width: 100%"
        :header-cell-style="{background:'#f5f7fa', color: '#606266'}"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="collegeName" label="学院名称" min-width="150" show-overflow-tooltip />
        <el-table-column label="院长" width="120">
          <template #default="scope">
            <div v-if="scope.row.name" class="dean-info">
              <el-avatar :size="30" :src="scope.row.avatar || '/avatar-default.png'" />
              <span>{{ scope.row.name }}</span>
            </div>
            <span v-else>未指定</span>
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="150" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.phone || scope.row.email || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="学院简介" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <div class="introduction-preview">
              {{ scope.row.introduction || '暂无简介' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-tooltip content="查看详情" placement="top">
                <el-button 
                  circle
                  type="primary" 
                  plain
                  size="small" 
                  @click="handleView(scope.row)"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="编辑学院" placement="top">
                <el-button 
                  circle
                  type="warning" 
                  plain
                  size="small" 
                  @click="handleEdit(scope.row)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip :content="scope.row.status === 1 ? '禁用学院' : '启用学院'" placement="top">
                <el-button 
                  circle
                  :type="scope.row.status === 1 ? 'info' : 'success'" 
                  plain
                  size="small" 
                  @click="handleToggleStatus(scope.row)"
                >
                  <el-icon>
                    <component :is="scope.row.status === 1 ? 'CloseBold' : 'Check'" />
                  </el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除学院" placement="top">
                <el-button 
                  circle
                  type="danger" 
                  plain
                  size="small" 
                  @click="handleDelete(scope.row)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
          small
        />
      </div>
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="学院详情"
      width="60%"
      top="5vh"
      destroy-on-close
    >
      <div v-if="currentCollege" class="college-detail">
        <div class="detail-header">
          <h3>{{ currentCollege.collegeName }}</h3>
          <el-tag :type="currentCollege.status === 1 ? 'success' : 'info'">
            {{ currentCollege.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </div>
        
        <div class="introduction-section" v-if="currentCollege.introduction">
          <div class="introduction-title">学院简介</div>
          <div class="introduction-content" v-html="currentCollege.introduction"></div>
        </div>
        <div class="introduction-section" v-else>
          <div class="introduction-empty">
            <el-icon><InfoFilled /></el-icon>
            <span>暂无学院简介</span>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-body">
          <div class="basic-info-title">基本信息</div>
          <div class="basic-info-grid">
            <div class="detail-item">
              <span class="label">学院ID</span>
              <span class="value">{{ currentCollege.id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">院长</span>
              <div class="value dean-detail" v-if="currentCollege.name">
                <el-avatar :size="40" :src="currentCollege.avatar || '/avatar-default.png'" />
                <div class="dean-info">
                  <div class="dean-name">{{ currentCollege.name }}</div>
                  <div class="dean-contact">{{ currentCollege.phone || currentCollege.email || '无联系方式' }}</div>
                </div>
              </div>
              <span class="value" v-else>未指定</span>
            </div>
            <div class="detail-item">
              <span class="label">联系电话</span>
              <span class="value">{{ currentCollege.phone || '未设置' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">邮箱</span>
              <span class="value">{{ currentCollege.email || '未设置' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">创建时间</span>
              <span class="value">{{ formatDate(currentCollege.createTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">更新时间</span>
              <span class="value">{{ formatDate(currentCollege.updateTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(currentCollege)">编辑</el-button>
      </template>
    </el-dialog>

    <!-- 编辑/新增对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="isEdit ? '编辑学院' : '新增学院'"
      width="60%"
      top="5vh"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="college-form"
      >
        <div class="form-header">
          <div class="form-title">基本信息</div>
          <div class="form-subtitle">请填写学院的基本信息</div>
        </div>
        
        <el-form-item label="学院名称" prop="collegeName">
          <el-input 
            v-model="formData.collegeName" 
            placeholder="请输入学院名称" 
            clearable
            :maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="院长" prop="deanId">
          <el-select
            v-model="formData.deanId"
            placeholder="请选择院长"
            filterable
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in teacherList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <div class="teacher-item">
                <el-avatar :size="30" :src="item.avatar || '/avatar-default.png'" />
                <div class="teacher-info">
                  <div>{{ item.name }}</div>
                  <div class="teacher-extra">{{ item.phone || item.email || '无联系方式' }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">
              <el-tag type="success" size="small">启用</el-tag>
            </el-radio>
            <el-radio :label="0">
              <el-tag type="info" size="small">禁用</el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <div class="form-divider"></div>
        <div class="form-header">
          <div class="form-title">学院介绍</div>
          <div class="form-subtitle">请详细描述学院的基本情况、专业设置和特色</div>
        </div>
        
        <el-form-item prop="introduction" class="introduction-form-item">
          <el-input
            v-model="formData.introduction"
            type="textarea"
            :rows="8"
            placeholder="请输入学院介绍"
            :maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? '保存修改' : '创建学院' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Plus, 
  Search, 
  Refresh, 
  View, 
  Edit, 
  Delete, 
  Check, 
  CloseBold,
  InfoFilled,
  ArrowUp,
  ArrowDown,
  Grid
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import {
  getAllColleges,
  getCollegesByPage,
  addCollege,
  updateCollege,
  deleteCollege,
  getCollegeDetail,
  type College,
  type CollegePageQuery,
  type PageResult
} from '@/api/college';
import type { ApiResponse } from '@/request/admin';

const router = useRouter();
const loading = ref(false);
const submitting = ref(false);

// 列表数据
const collegeList = ref<College[]>([]);
const total = ref(0);

// 查询条件
const queryForm = reactive<CollegePageQuery>({
  pageNum: 1,
  pageSize: 10,
  collegeName: '',
  status: undefined
});

// 教师列表
const teacherList = ref<any[]>([]);

// 获取教师列表
const loadTeachers = async () => {
  try {
    // 假设有一个接口用于获取所有教师，或从用户列表中筛选
    // const res = await getAllTeachers();
    // if (res.code === 200) {
    //   teacherList.value = res.data;
    // }
    
    // 如果暂时没有接口，可以使用静态数据
    teacherList.value = [
      { id: 1, name: '张三', phone: '13800138001', avatar: '' },
      { id: 2, name: '李四', email: 'lisi@example.com', avatar: '' },
      { id: 3, name: '王五', phone: '13900139001', avatar: '' }
    ];
  } catch (error) {
    console.error('加载教师列表失败:', error);
  }
};

// 加载学院列表
const loadCollegeList = async () => {
  loading.value = true;
  try {
    const res = await getCollegesByPage(queryForm);
    // 确保响应符合预期的API结构
    if (res && res.code === 200 && res.data) {
      collegeList.value = res.data.records;
      total.value = res.data.total;
    } else {
      ElMessage.error((res && res.message) || '获取学院列表失败');
    }
  } catch (error) {
    console.error('加载学院列表失败:', error);
    ElMessage.error('网络错误，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  queryForm.pageNum = 1;
  loadCollegeList();
};

// 重置
const handleReset = () => {
  queryForm.collegeName = '';
  queryForm.status = undefined;
  queryForm.pageNum = 1;
  loadCollegeList();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  queryForm.pageSize = size;
  loadCollegeList();
};

// 页码变化
const handleCurrentChange = (page: number) => {
  queryForm.pageNum = page;
  loadCollegeList();
};

// 详情对话框
const detailVisible = ref(false);
const currentCollege = ref<College | null>(null);

// 查看详情
const handleView = (row: College) => {
  currentCollege.value = { ...row };
  detailVisible.value = true;
};

// 表单对话框
const formVisible = ref(false);
const formRef = ref();
const isEdit = ref(false);
const formData = reactive<Partial<College>>({
  id: undefined,
  collegeName: '',
  deanId: undefined,
  status: 1,
  introduction: ''
});

// 表单验证规则
const rules = {
  collegeName: [
    { required: true, message: '请输入学院名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 新增学院
const handleCreate = () => {
  isEdit.value = false;
  formData.id = undefined;
  formData.collegeName = '';
  formData.deanId = undefined;
  formData.status = 1;
  formData.introduction = '';
  formVisible.value = true;
};

// 编辑学院
const handleEdit = (row: College | null) => {
  if (!row) return;
  isEdit.value = true;
  Object.assign(formData, row);
  formVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true;
      try {
        let res;
        if (isEdit.value) {
          res = await updateCollege(formData as College);
        } else {
          res = await addCollege(formData);
        }
        
        if (res && res.code === 200) {
          ElMessage.success(isEdit.value ? '修改成功' : '创建成功');
          formVisible.value = false;
          loadCollegeList();
        } else {
          ElMessage.error((res && res.message) || (isEdit.value ? '修改失败' : '创建失败'));
        }
      } catch (error) {
        console.error(isEdit.value ? '修改失败:' : '创建失败:', error);
        ElMessage.error('网络错误，请稍后重试');
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 切换学院状态
const handleToggleStatus = async (row: College) => {
  const newStatus = row.status === 1 ? 0 : 1;
  const actionText = newStatus === 1 ? '启用' : '禁用';
  
  try {
    const updatedData = { ...row, status: newStatus };
    const res = await updateCollege(updatedData);
    if (res && res.code === 200) {
      ElMessage.success(`${actionText}成功`);
      loadCollegeList();
    } else {
      ElMessage.error((res && res.message) || `${actionText}失败`);
    }
  } catch (error) {
    console.error(`${actionText}失败:`, error);
    ElMessage.error('网络错误，请稍后重试');
  }
};

// 删除学院
const handleDelete = (row: College) => {
  ElMessageBox.confirm(
    `确定要删除学院 "${row.collegeName}" 吗？删除后不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteCollege(row.id);
      if (res && res.code === 200) {
        ElMessage.success('删除成功');
        loadCollegeList();
      } else {
        ElMessage.error((res && res.message) || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('网络错误，请稍后重试');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 格式化日期
const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const isExpand = ref(true); // 控制搜索区域的展开收起

// 初始化
onMounted(() => {
  loadCollegeList();
  loadTeachers();
});
</script>

<style scoped>
.college-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-header .left h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  position: relative;
  padding-left: 15px;
}

.page-header .left h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 20px;
  background-color: #409eff;
  border-radius: 3px;
}

.page-header .description {
  margin: 8px 0 0 15px;
  font-size: 14px;
  color: #606266;
}

.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.search-title .el-icon {
  margin-right: 5px;
  color: #409eff;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  padding-top: 10px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-desc {
  font-size: 12px;
  color: #909399;
}

.list-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.list-title .el-icon {
  margin-right: 5px;
  color: #409eff;
}

.list-count {
  font-size: 14px;
  color: #606266;
}

.count-number {
  color: #f56c6c;
  font-weight: bold;
  margin: 0 3px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.dean-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.college-detail .detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.college-detail .detail-header h3 {
  margin: 0;
  font-size: 18px;
}

.detail-body {
  margin-top: 20px;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
}

.detail-item.full {
  flex-direction: column;
}

.detail-item .label {
  width: 100px;
  font-weight: bold;
  color: #606266;
}

.detail-item .value {
  flex: 1;
  color: #303133;
}

.introduction-content {
  margin-top: 10px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  line-height: 1.6;
}

.teacher-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.teacher-info {
  display: flex;
  flex-direction: column;
}

.teacher-extra {
  font-size: 12px;
  color: #909399;
}

.operation-buttons {
  display: flex;
  gap: 5px;
  justify-content: center;
}

.introduction-preview {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-size: 14px;
  color: #606266;
}

.college-detail .detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.college-detail .detail-header h3 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.detail-body {
  margin-top: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
}

.detail-item.full {
  flex-direction: column;
}

.detail-item .label {
  width: 100px;
  font-weight: bold;
  color: #606266;
}

.detail-item .value {
  flex: 1;
  color: #303133;
}

.introduction-content {
  margin-top: 10px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 4px;
  line-height: 1.8;
  color: #303133;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  min-height: 120px;
}

.introduction-section {
  margin: 20px 0;
  border-radius: 8px;
  background-color: #f0f9ff;
  padding: 15px;
  position: relative;
}

.introduction-title {
  font-size: 16px;
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 10px;
  position: relative;
  padding-left: 12px;
}

.introduction-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #1989fa;
  border-radius: 2px;
}

.introduction-content {
  margin-top: 10px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 4px;
  line-height: 1.8;
  color: #303133;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  min-height: 120px;
}

.introduction-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #909399;
  background-color: #ffffff;
  border-radius: 4px;
  margin-top: 10px;
}

.introduction-empty .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.basic-info-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  position: relative;
  padding-left: 12px;
}

.basic-info-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #67c23a;
  border-radius: 2px;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.dean-detail {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dean-info {
  display: flex;
  flex-direction: column;
}

.dean-name {
  font-weight: bold;
  color: #303133;
}

.dean-contact {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .basic-info-grid {
    grid-template-columns: 1fr;
  }
}

.college-form {
  padding: 10px;
}

.form-header {
  margin-bottom: 20px;
}

.form-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
}

.form-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 20px 0;
}

.introduction-form-item :deep(.el-form-item__content) {
  line-height: 1.5;
}

.introduction-form-item :deep(.el-textarea__inner) {
  font-family: inherit;
  line-height: 1.8;
  padding: 15px;
}

.introduction-form-item :deep(.el-input__count) {
  background: transparent;
  bottom: 0;
  right: 10px;
  color: #909399;
}

.teacher-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
  gap: 10px;
}

.teacher-info {
  display: flex;
  flex-direction: column;
}

.teacher-extra {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}
</style> 