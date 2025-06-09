<template>
  <div class="major-management">
    <el-card class="major-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>专业管理</span>
          <el-button type="primary" @click="handleAdd">添加专业</el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="专业名称">
            <el-input v-model="searchForm.majorName" placeholder="搜索专业名称" clearable @clear="handleSearch" />
          </el-form-item>
          <el-form-item label="所属学院">
            <el-select v-model="searchForm.collegeId" placeholder="选择学院" clearable>
              <el-option 
                v-for="college in collegeList" 
                :key="college.id" 
                :label="college.collegeName" 
                :value="college.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="启用状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 表格区域 -->
      <el-table
        :data="majorList"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
        element-loading-text="加载中..."
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="majorName" label="专业名称" align="left" min-width="150" />
        <el-table-column prop="collegeName" label="所属学院" align="center" min-width="120" />
        <el-table-column prop="deanName" label="系主任" align="center" width="100" />
        <el-table-column prop="introduction" label="专业简介" min-width="240" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="center" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
              :icon="Edit"
              circle
              title="编辑"
            />
            <el-button
              size="small"
              type="info"
              @click="viewDetail(scope.row)"
              :icon="InfoFilled"
              circle
              title="详情"
            />
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
              :icon="Delete"
              circle
              title="删除"
            />
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchForm.pageNum"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑专业对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑专业' : '添加专业'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="majorFormRef"
        :model="majorForm"
        :rules="majorRules"
        label-width="100px"
      >
        <el-form-item label="专业名称" prop="majorName">
          <el-input v-model="majorForm.majorName" placeholder="请输入专业名称" />
        </el-form-item>
        
        <el-form-item label="所属学院" prop="collegeId">
          <el-select v-model="majorForm.collegeId" placeholder="请选择学院" style="width: 100%">
            <el-option 
              v-for="college in collegeList" 
              :key="college.id" 
              :label="college.collegeName" 
              :value="college.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="系主任ID" prop="deanId">
          <el-input v-model.number="majorForm.deanId" placeholder="请输入系主任ID" />
        </el-form-item>
        
        <el-form-item label="专业简介" prop="introduction">
          <el-input 
            v-model="majorForm.introduction" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入专业简介"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="majorForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="专业详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="currentMajor">
        <el-descriptions-item label="专业ID">{{ currentMajor.id }}</el-descriptions-item>
        <el-descriptions-item label="专业名称">{{ currentMajor.majorName }}</el-descriptions-item>
        <el-descriptions-item label="所属学院">{{ currentMajor.collegeName }}</el-descriptions-item>
        <el-descriptions-item label="系主任">{{ currentMajor.deanName || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentMajor.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(currentMajor.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentMajor.status === 1 ? 'success' : 'danger'">
            {{ currentMajor.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="系主任ID">{{ currentMajor.deanId || '未设置' }}</el-descriptions-item>
        
        <el-descriptions-item label="专业简介" :span="2">
          {{ currentMajor.introduction || '暂无简介' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'
import { 
  getAllMajors, 
  getMajorsByPage, 
  addMajor, 
  updateMajor, 
  deleteMajor,
  mockMajorData,
  mockCollegeList
} from '@/api/major'
import type { Major, MajorPageQuery } from '@/api/major'

// 数据定义
const majorList = ref<Major[]>([])
const collegeList = ref(mockCollegeList)
const loading = ref(false)
const total = ref(0)

// 搜索表单
const searchForm = reactive<MajorPageQuery>({
  pageNum: 1,
  pageSize: 10,
  majorName: '',
  collegeId: undefined,
  status: undefined
})

// 对话框相关
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const majorFormRef = ref()
const currentMajor = ref<Major | null>(null)
const majorForm = reactive<Partial<Major>>({
  id: undefined,
  majorName: '',
  collegeId: undefined,
  introduction: '',
  deanId: undefined,
  status: 1
})

// 表单校验规则
const majorRules = {
  majorName: [
    { required: true, message: '请输入专业名称', trigger: 'blur' },
    { min: 2, max: 50, message: '专业名称长度应在2到50个字符之间', trigger: 'blur' }
  ],
  collegeId: [
    { required: true, message: '请选择所属学院', trigger: 'change' }
  ],
  introduction: [
    { max: 500, message: '专业简介不能超过500个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择专业状态', trigger: 'change' }
  ]
}

// 格式化日期
const formatDate = (date: string | undefined) => {
  if (!date) return '未设置';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date; // 如果解析失败，直接返回原始字符串
    
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch (error) {
    return date; // 出错时返回原始字符串
  }
};

// 处理搜索
const handleSearch = () => {
  // 重置到第一页
  searchForm.pageNum = 1;
  
  // 使用模拟数据进行客户端过滤
  loadMockMajors();
}

// 重置搜索
const resetSearch = () => {
  searchForm.majorName = '';
  searchForm.collegeId = undefined;
  searchForm.status = undefined;
  searchForm.pageNum = 1;
  
  // 加载所有模拟数据
  loadMockMajors();
}

// 使用模拟数据加载专业
const loadMockMajors = () => {
  loading.value = true;
  setTimeout(() => {
    try {
      // 获取原始数据
      let filteredData = [...mockMajorData.records];
      
      // 按专业名称过滤
      if (searchForm.majorName) {
        filteredData = filteredData.filter(item => 
          item.majorName.toLowerCase().includes(searchForm.majorName.toLowerCase())
        );
      }
      
      // 按学院过滤
      if (searchForm.collegeId !== undefined) {
        filteredData = filteredData.filter(item => 
          item.collegeId === searchForm.collegeId
        );
      }
      
      // 按状态过滤
      if (searchForm.status !== undefined) {
        filteredData = filteredData.filter(item => 
          item.status === searchForm.status
        );
      }
      
      // 计算分页
      total.value = filteredData.length;
      const startIndex = (searchForm.pageNum - 1) * searchForm.pageSize;
      const endIndex = startIndex + searchForm.pageSize;
      majorList.value = filteredData.slice(startIndex, endIndex);
      
      console.log('模拟数据查询结果:', majorList.value);
    } catch (error) {
      console.error('获取专业列表失败:', error);
      ElMessage.error('获取专业列表失败');
      majorList.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  }, 500); // 模拟网络延迟
}

// 加载专业列表 - 初始加载或刷新时使用
const loadMajors = () => {
  // 使用模拟数据
  loadMockMajors();
}

// 初始化
onMounted(() => {
  loadMajors();
});

// 分页相关
const handleSizeChange = (val: number) => {
  searchForm.pageSize = val;
  searchForm.pageNum = 1;
  loadMajors();
}

const handleCurrentChange = (val: number) => {
  searchForm.pageNum = val;
  loadMajors();
}

// 添加专业
const handleAdd = () => {
  isEdit.value = false;
  Object.assign(majorForm, {
    id: undefined,
    majorName: '',
    collegeId: undefined,
    introduction: '',
    deanId: undefined,
    status: 1
  });
  dialogVisible.value = true;
}

// 编辑专业
const handleEdit = (row: Major) => {
  isEdit.value = true;
  Object.assign(majorForm, {
    id: row.id,
    majorName: row.majorName,
    collegeId: row.collegeId,
    introduction: row.introduction || '',
    deanId: row.deanId || undefined,
    status: row.status === undefined ? 1 : row.status
  });
  dialogVisible.value = true;
}

// 查看详情
const viewDetail = (row: Major) => {
  currentMajor.value = row;
  detailDialogVisible.value = true;
}

// 删除专业
const handleDelete = (row: Major) => {
  ElMessageBox.confirm(
    `确定要删除专业 "${row.majorName}" 吗？此操作不可逆！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      loading.value = true;
      // 模拟删除操作
      setTimeout(() => {
        // 从列表中移除该项
        majorList.value = majorList.value.filter(item => item.id !== row.id);
        total.value -= 1;
        ElMessage.success('删除成功');
        loading.value = false;
      }, 500);
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
}

// 提交表单
const submitForm = async () => {
  if (!majorFormRef.value) return;
  
  await majorFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      ElMessage.warning('请检查表单填写是否正确');
      return;
    }
    
    submitting.value = true;
    
    // 模拟API调用延迟
    setTimeout(() => {
      try {
        if (isEdit.value) {
          // 模拟编辑专业
          const index = majorList.value.findIndex(item => item.id === majorForm.id);
          if (index !== -1) {
            // 获取所选学院的名称
            const college = collegeList.value.find(c => c.id === majorForm.collegeId);
            
            // 更新列表中的数据
            majorList.value[index] = {
              ...majorList.value[index],
              majorName: majorForm.majorName || '',
              collegeId: majorForm.collegeId || 0,
              collegeName: college?.collegeName || '未知学院',
              introduction: majorForm.introduction || '',
              deanId: majorForm.deanId,
              status: majorForm.status,
              updateTime: new Date().toISOString()
            };
          }
          
          ElMessage.success('更新专业成功');
        } else {
          // 模拟添加专业
          // 获取所选学院的名称
          const college = collegeList.value.find(c => c.id === majorForm.collegeId);
          
          // 创建新专业对象
          const newMajor: Major = {
            id: Math.floor(Math.random() * 1000) + 100, // 随机ID
            majorName: majorForm.majorName || '',
            collegeId: majorForm.collegeId || 0,
            collegeName: college?.collegeName || '未知学院',
            introduction: majorForm.introduction || '',
            deanId: majorForm.deanId,
            deanName: '新系主任', // 模拟数据
            status: majorForm.status,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          };
          
          // 添加到列表首位
          majorList.value.unshift(newMajor);
          total.value += 1;
          
          ElMessage.success('添加专业成功');
        }
        
        dialogVisible.value = false;
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error(`${isEdit.value ? '更新' : '添加'}专业失败`);
      } finally {
        submitting.value = false;
      }
    }, 500);
  });
}
</script>

<style scoped>
.major-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 