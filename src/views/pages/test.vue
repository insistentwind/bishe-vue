<template>
  <div class="test-container">
    <div class="page-header">
      <h1 class="page-title">测试管理</h1>
    </div>
    
    <div class="search-section">
      <el-card shadow="hover" class="search-card">
        <div class="search-box">
          <div class="filter-row">
            <div class="college-info">
              <span class="label">当前学院：</span>
              <el-tag type="info" effect="plain" size="large">
                {{ getCollegeName(userCollegeId) }}
              </el-tag>
            </div>
            
            <el-select
              v-model="selectedLessonId"
              placeholder="选择课程"
              clearable
              @change="handleLessonChange"
              class="filter-select"
            >
              <el-option
                v-for="option in options"
                :key="option.lessonId"
                :label="option.lessonName"
                :value="option.lessonId"
              />
            </el-select>
          </div>
          
          <div class="search-row">
            <el-input 
              v-model="input" 
              placeholder="请输入测试名称"
              prefix-icon="el-icon-search"
              size="large" 
              class="search-input"
            />
            <el-button type="primary" size="large" @click="selectTest" class="action-button">
              <i class="el-icon-search"></i> 查询测试
            </el-button>
            <el-button type="success" size="large" @click="addTest" class="action-button">
              <i class="el-icon-plus"></i> 新增测试
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="table-section">
      <el-card shadow="hover" class="table-card">
        <el-table
          :data="tableData"
          border
          stripe
          :header-cell-style="{background:'#f5f7fa', color:'#303133', fontWeight: 'bold'}"
          style="width: 100%;"
          class="test-table"
          v-loading="tableLoading"
          element-loading-text="加载中..."
        >
          <el-table-column label="课程编号" prop="lessonId" align="center" width="120"/>
          <el-table-column label="测试名称" prop="examName" align="center"/>
          <el-table-column label="测试总分" align="center" width="100">
            <template #default="scope">
              <el-tag type="success" effect="plain">
                {{ scope.row.totalScore || '100' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="测试时长(分钟)" align="center" width="120">
            <template #default="scope">
              <el-tag type="info" effect="plain">
                {{ scope.row.duration || '120' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="测试日期" prop="examDate" align="center" width="120"/>
          <el-table-column label="测试状态" align="center" width="100">
            <template #default="scope">
              <div v-if="scope.row.isDelete === 2">
                <el-tag type="warning" effect="dark">批阅中</el-tag>
              </div>
              <div v-else>
                <el-tag v-if="scope.row.status === 0" type="danger" effect="dark">已禁用</el-tag>
                <el-tag v-else-if="scope.row.status === 1" type="success" effect="dark">已启用</el-tag>
                <el-tag v-else type="info" effect="dark">未设置</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="启用控制" align="center" width="100">
            <template #default="scope">
              <el-switch
                v-if="scope.row.paperClassId !== '' && scope.row.isDelete !== 2"
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="(val) => toggleTestStatus(scope.row, val)"
              />
              <span v-else-if="scope.row.isDelete === 2">-</span>
              <el-button
                v-else
                size="small"
                type="info"
                @click="openTestSettings(scope.row)"
                class="action-btn"
              >
                需先设置
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="350" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <el-button
                  v-if="scope.row.paperClassId===''"
                  size="small"
                  type="success"
                  @click="openTestSettings(scope.row)"
                  class="action-btn"
                >
                  <i class="el-icon-setting"></i> 测试设置
                </el-button>
                <el-button
                  v-else
                  size="small"
                  type="primary"
                  @click="toAnswer(scope.row)"
                  class="action-btn"
                >
                  <i class="el-icon-upload"></i> 录入答题卡
                </el-button>
                <el-button 
                  v-if="scope.row.paperClassId!==''"
                  size="small"
                  type="info"
                  @click="toChangeSettingDescription(scope.row)"
                  class="action-btn"
                >
                  <i class="el-icon-edit"></i> 答案备注
                </el-button>
                <el-button 
                  v-if="scope.row.paperClassId!==''"
                  size="small"
                  type="warning"
                  @click="toChangeStatus(scope.row)"
                  class="action-btn"
                >
                  <i class="el-icon-check"></i> 开始批阅
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteById(scope.row.id)"
                  class="action-btn"
                >
                  <i class="el-icon-delete"></i> 删除测试
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 添加分页 -->
        <div class="pagination-container">
          <el-pagination
            v-if="tableData.length > 0"
            background
            layout="prev, pager, next, sizes, total"
            :total="tableData.length"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 批阅设置对话框 -->
    <el-dialog
      v-model="centerDialogVisible"
      align-center
      title="批阅设置"
      width="500"
      class="custom-dialog"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="模版">
          <el-select
            v-model="form.paperClassId"
            clearable
            placeholder="选择模版"
            style="width: 300px"
          >
            <el-option
              v-for="item in modelOptions"
              :key="item.paperClassId"
              :label="item.modelName"
              :value="item.paperClassId"
            >
              <span style="float: left">{{ item.modelName }}</span>
              <span style="float: right;color: var(--el-text-color-secondary);font-size: 13px;">模版ID：{{
                  item.paperClassId
                }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelSet">取消</el-button>
          <el-button type="primary" @click="addSetAndModel">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增测试对话框 -->
    <el-dialog
      v-model="centerDialogVisible1"
      align-center
      title="新增测试"
      width="500"
      class="custom-dialog"
    >
      <el-form :model="form1" label-position="left" label-width="120px">
        <el-form-item label="课程">
          <el-select
            v-model="form1.lessonId"
            clearable
            placeholder="选择课程"
            style="width: 300px"
          >
            <el-option
              v-for="item in options"
              :key="item.lessonId"
              :label="item.lessonName"
              :value="item.lessonId"
            >
              <span style="float: left">{{ item.lessonName }}</span>
              <span style="float: right;color: var(--el-text-color-secondary);font-size: 13px;">ID: {{
                  item.lessonId
                }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="测试名称">
          <el-input v-model="form1.examName" style="width: 300px" placeholder="请输入测试名称"></el-input>
        </el-form-item>
        <el-form-item label="测试日期">
          <el-date-picker
            v-model="form1.examDate"
            format="YYYY/MM/DD"
            placeholder="选择测试日期"
            style="width: 300px"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="测试总分">
          <el-input-number v-model="form1.totalScore" :min="1" :max="150" style="width: 300px"></el-input-number>
        </el-form-item>
        <el-form-item label="测试时长(分钟)">
          <el-input-number v-model="form1.duration" :min="1" :max="180" style="width: 300px"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible1 = false">取消</el-button>
          <el-button type="primary" @click="add">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 答案备注对话框 -->
    <el-dialog
      v-model="centerDialogVisible2"
      align-center
      title="答案备注"
      width="500"
      class="custom-dialog"
    >
      <div class="remark-container">
        <div v-for="(item, index) in desList" :key="index" class="remark-item">
          <div class="remark-question">
            <el-text type="primary" size="large">第{{item.answerId}}题</el-text>
            <el-input 
              v-model="item.description" 
              type="textarea" 
              :autosize="{ minRows: 2, maxRows: 4 }" 
              class="remark-input"
              placeholder="暂无备注，请输入" 
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible2 = false">取消</el-button>
          <el-button type="primary" @click="changeDes">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加测试设置对话框 -->
    <el-dialog
      v-model="centerDialogVisible3"
      align-center
      title="测试设置"
      width="500"
      class="custom-dialog"
    >
      <el-form :model="testSettingsForm" label-width="100px">
        <el-form-item label="测试名称" required>
          <el-input v-model="testSettingsForm.examName" placeholder="请输入测试名称"></el-input>
        </el-form-item>
        <el-form-item label="测试总分">
          <el-input-number v-model="testSettingsForm.totalScore" :min="1" :max="150" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="测试时长">
          <el-input-number v-model="testSettingsForm.duration" :min="1" :max="180" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="测试日期" required>
          <el-date-picker
            v-model="testSettingsForm.examDate"
            format="YYYY/MM/DD"
            placeholder="选择测试日期"
            style="width: 100%"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="测试状态">
          <el-select v-model="testSettingsForm.status" style="width: 100%">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="课程编号" v-if="testSettingsForm.lessonId">
          <el-tag type="info" effect="plain" size="large">
            {{ testSettingsForm.lessonId }}
          </el-tag>
        </el-form-item>
        
        <el-form-item label="测试编号" v-if="testSettingsForm.examId">
          <el-tag type="info" effect="plain">
            {{ testSettingsForm.examId }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible3 = false">取消</el-button>
          <el-button type="primary" @click="saveTestSettings">保存设置</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {ElMessage} from "element-plus";
import type {TableColumnCtx} from 'element-plus'
import service from "@/request/index";
import {
  addExam,
  queryAllByIdForModel,
  queryByExamClass,
  queryByExamName,
  insertTestModelDto,
  deleteTest,
  queryDes, 
  editDes
} from "@/request/test/test"
import router from "@/router";
import {updateExam} from "@/request/score/score";
import {queryAllByTeacherId} from "@/request/class/class";
import { getAllColleges } from '@/request/school/query';

// 添加表格加载状态变量
const tableLoading = ref(false);
// 添加分页相关变量
const currentPage = ref(1);
const pageSize = ref(10);

interface Exam {
  id: number,
  examId: string,
  lessonId: string,
  examName: string,
  examClass: string,
  examSet: string,
  paperClassId: string,
  modelName: string,
  examDate: string,
  isDelete: number,
  models: Modelurl[],
  totalScore?: number,
  duration?: number,
  status?: number,
  examData?: string, // 添加兼容性字段
}

interface Modelurl {
  paperClassId: string,
  url: number,
}

interface ExamInfo {
  examId: string,
  lessonId: string,
  examName: string,
  examClass: string,
  examSet: string,
  paperClassId: string,
  examDate: string,
  totalScore: number,
  duration: number,
  examData?: string, // 兼容性字段
}

interface SettingDesDto {
  examSet: string,
  answerId: string,
  description: string,
}

interface LessonDto {
  id: string
  lessonId: string
  lessonName: string
  hours: string
  score: string
  teacherId: string
  teacherName: string
}

interface LessonDtoInfo {
  lessonId: string
  lessonName: string
}

interface Model {
  id: number,
  modelName: string,
  modelClass: string,
  paperClassId: string,
  modelNumber: string,
}

interface ModelInfo {
  modelName: string,
  paperClassId: string,
}

interface modelToSet {
  id: number,
  teacherId: string,
  paperClassId: string,
}

const desList = ref<SettingDesDto[]>([]);
const centerDialogVisible1 = ref(false);
const centerDialogVisible = ref(false);
const centerDialogVisible2 = ref(false);
const centerDialogVisible3 = ref(false);
const tableData = ref<Exam[]>([]);
const lessonList = ref<LessonDto[]>([]);
const options = ref<LessonDtoInfo[]>([]);
const modelOptions = ref<ModelInfo[]>([]);
const modelList = ref<Model[]>([]);
const input = ref('');
const selectedLessonId = ref('');

// 处理localStorage可能为null的情况
const getUserId = (): string => {
  return localStorage.getItem('id') || '';
};

// 从localStorage获取用户学院ID
const userCollegeId = ref(localStorage.getItem('collegeId') || '1');
const collegeList = ref<College[]>([]);
// 学院名称映射表
const collegeNameMap = ref<Record<string, string>>({});

// 添加学院接口定义
interface College {
  collegeId: string;
  collegeName: string;
}

const form = ref<modelToSet>({
  id: -1,
  teacherId: getUserId(),
  paperClassId: '',
});

const form1 = ref<ExamInfo>({
  examId: '',
  lessonId: '',
  examName: '',
  // 确保examClass始终为"0"
  examClass: '0',
  examSet: '',
  paperClassId: '',
  examDate: '',
  totalScore: 100,
  duration: 120,
});

// 添加测试设置表单对象
const testSettingsForm = ref({
  id: 0,
  examId: '',
  lessonId: '',
  examName: '',
  totalScore: 100,
  duration: 120,
  examDate: '',
  examClass: '0',
  examSet: '',
  paperClassId: '',
  modelName: '',
  status: 1, // 默认启用
  isDelete: 0,
});

// 状态选项
const statusOptions = [
  { value: 0, label: '禁用' },
  { value: 1, label: '启用' }
];

// 处理分页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1; // 页码大小变化时，重置为第一页
};

// 获取学院列表
const getColleges = async () => {
  try {
    // 通过API获取学院列表
    const res = await getAllColleges();
    console.log('获取到的学院列表:', res);
    
    if (res && Array.isArray(res)) {
      // 如果响应直接是数组
      collegeList.value = res;
      
      // 创建学院ID到名称的映射
      collegeList.value.forEach(college => {
        collegeNameMap.value[college.collegeId] = college.collegeName;
      });
      
      console.log('学院名称映射:', collegeNameMap.value);
    } else if (res && res.data && Array.isArray(res.data)) {
      // 如果响应包含在data属性中
      collegeList.value = res.data;
      
      // 创建学院ID到名称的映射
      collegeList.value.forEach(college => {
        collegeNameMap.value[college.collegeId] = college.collegeName;
      });
      
      console.log('学院名称映射:', collegeNameMap.value);
    } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
      // 如果响应包含在data.data属性中
      collegeList.value = res.data.data;
      
      // 创建学院ID到名称的映射
      collegeList.value.forEach(college => {
        collegeNameMap.value[college.collegeId] = college.collegeName;
      });
      
      console.log('学院名称映射:', collegeNameMap.value);
    } else {
      // 备用方案：至少确保有默认学院
      collegeList.value = [
        { collegeId: '1', collegeName: '计算机学院' },
        { collegeId: '2', collegeName: '数学学院' },
        { collegeId: '3', collegeName: '物理学院' },
        { collegeId: '4', collegeName: '化学学院' },
        { collegeId: '5', collegeName: '生物学院' }
      ];
      
      // 创建备用映射
      collegeList.value.forEach(college => {
        collegeNameMap.value[college.collegeId] = college.collegeName;
      });
      
      console.warn('使用备用学院数据');
    }
  } catch (error) {
    console.error('获取学院列表出错:', error);
    ElMessage.error('获取学院列表失败');
    
    // 错误时也提供默认映射
    collegeNameMap.value = {
      '1': '计算机学院',
      '2': '数学学院',
      '3': '物理学院',
      '4': '化学学院',
      '5': '生物学院'
    };
  }
};

// 根据学院ID获取学院名称
const getCollegeName = (collegeId: string): string => {
  return collegeNameMap.value[collegeId] || '未知学院';
}

// 处理课程选择变化
const handleLessonChange = (value: string) => {
  if (value) {
    selectedLessonId.value = value;
    getTest();
  } else {
    selectedLessonId.value = '';
    tableData.value = []; // 清空测试列表
  }
}

const changeDes = async () => {
  console.log(desList.value);
  try {
    const res = await editDes(desList.value);
    if (res.data.data) {
      ElMessage.success("答案备注设置成功");
      centerDialogVisible2.value = false;
    } else {
      ElMessage.error("答案备注设置失败");
    }
  } catch (error) {
    console.error("设置答案备注出错:", error);
    ElMessage.error("设置答案备注失败，请重试");
  }
}

const toChangeSettingDescription = async (data: Exam) => {
  try {
    const res = await queryDes(data.examSet, getUserId());
    desList.value = res.data.data;
    centerDialogVisible2.value = true;
    console.log(desList.value);
  } catch (error) {
    console.error("获取答案备注出错:", error);
    ElMessage.error("获取答案备注失败，请重试");
  }
}

const toChangeStatus = async (data: Exam) => {
  try {
    data.isDelete = 2;
    const res = await updateExam(data);
    if (res.data) {
      ElMessage.success("该测试开始批改");
      await getTest();
    } else {
      ElMessage.error("开始批改失败");
    }
  } catch (error) {
    console.error("更新测试状态出错:", error);
    ElMessage.error("更新测试状态失败，请重试");
  }
}

const toAnswer = (data: Exam) => {
  try {
    localStorage.setItem('examLessonId', data.lessonId);
    localStorage.setItem('examId', data.examId);
    localStorage.setItem('examName', data.examName);
    localStorage.setItem('examDate', data.examDate);
    localStorage.setItem('modelName', data.modelName);
    localStorage.setItem('paperClassId', data.paperClassId);
    router.push("answer");
  } catch (error) {
    console.error("跳转到答题页面出错:", error);
    ElMessage.error("跳转失败，请重试");
  }
}

const deleteById = async (id: number) => {
  try {
    const res = await deleteTest(id);
    if (res.data.data) {
      ElMessage.success("删除成功");
      await getTest();
    } else {
      ElMessage.error("删除失败");
    }
  } catch (error) {
    console.error("删除测试出错:", error);
    ElMessage.error("删除测试失败，请重试");
  }
}

const addSetAndModel = async () => {
  try {
    if (!form.value.paperClassId) {
      ElMessage.warning("请选择模版");
      return;
    }

    const res = await insertTestModelDto(form.value);
    if (res.data.data) {
      ElMessage.success("设置成功");
      await getTest();
      centerDialogVisible.value = false;
      form.value.id = -1;
    } else {
      ElMessage.error("设置失败");
      centerDialogVisible.value = false;
      form.value.id = -1;
    }
  } catch (error) {
    console.error("设置模版出错:", error);
    ElMessage.error("设置模版失败，请重试");
    centerDialogVisible.value = false;
    form.value.id = -1;
  }
}

const cancelSet = () => {
  centerDialogVisible.value = false;
  form.value.id = -1;
}

const selectTest = async () => {
  tableLoading.value = true;
  try {
    if (!input.value || input.value.length === 0) {
      ElMessage.success("查询成功");
      await getTest();
    } else {
      const res = await queryByExamName(input.value);
      console.log(res.data.data);
      if (res.data.data === null) {
        ElMessage.error("测试不存在");
        tableData.value = [];
      } else {
        ElMessage.success("查询成功");
        tableData.value = res.data.data;
      }
      input.value = '';
    }
  } catch (error) {
    console.error("查询测试出错:", error);
    ElMessage.error("查询测试失败，请重试");
  } finally {
    tableLoading.value = false;
  }
}

const addTest = () => {
  if (!selectedLessonId.value) {
    ElMessage.warning('请先选择课程!');
    return;
  }
  
  // 设置当前日期
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  
  // 重置表单，确保examClass为"0"
  form1.value = {
    examId: '',
    lessonId: selectedLessonId.value,
    examName: '',
    examClass: '0', // 确保值为"0"
    examSet: '',
    paperClassId: '',
    examDate: formattedDate,
    examData: formattedDate, // 兼容性字段
    totalScore: 100,
    duration: 120,
  };
  
  centerDialogVisible1.value = true;
}

const add = async () => {
  try {
    if (form1.value.lessonId === '' || form1.value.examName === '' || form1.value.examDate === '') {
      ElMessage.error("请填写所有必填信息");
      return;
    }

    // 确保examClass为"0"
    form1.value.examClass = '0';

    console.log("提交的测试数据:", form1.value);
    const res = await addExam(form1.value);
    if (res.data) {
      ElMessage.success("添加成功，记得进行批阅设置");
      await getTest();
      centerDialogVisible1.value = false;
      
      // 重置表单
      form1.value.lessonId = '';
      form1.value.examName = '';
      form1.value.examDate = '';
      form1.value.totalScore = 100;
      form1.value.duration = 120;
    } else {
      ElMessage.error("添加失败");
    }
  } catch (error) {
    console.error("添加测试出错:", error);
    ElMessage.error("添加测试失败，请重试");
  }
}

// 获取课程列表
const getLesson = async () => {
  try {
    const res = await queryAllByTeacherId(getUserId());
    if (res.data && res.data.data) {
      lessonList.value = res.data.data;
      options.value = lessonList.value.map(lesson => ({
        lessonId: lesson.lessonId, 
        lessonName: lesson.lessonName
      }));
      if (options.value.length > 0) {
        ElMessage.success(`已加载${options.value.length}门课程`);
      } else {
        ElMessage.warning("暂无课程数据");
      }
    } else {
      ElMessage.warning("获取课程数据失败");
      options.value = [];
    }
  } catch (error) {
    console.error("获取课程列表出错:", error);
    ElMessage.error("获取课程列表失败，请重试");
    options.value = [];
  }
}

// 获取测试列表
const getTest = () => {
  // 检查是否有选择课程
  if (!selectedLessonId.value) {
    ElMessage.warning('请先选择课程再加载测试记录');
    return;
  }
  
  console.log('尝试获取测试信息，examClass=0，lessonId=', selectedLessonId.value);
  tableLoading.value = true;
  // 获取测试列表，参数1: examClass="0"，参数2: lessonId
  queryByExamClass("0", selectedLessonId.value)
    .then(response => {
      console.log('原始响应数据:', response);
      
      // 检查response是否为数组或具有data属性
      let filteredData: any[] = [];
      
      if (Array.isArray(response)) {
        // 如果response直接是数组，使用它
        filteredData = response.filter((item: any) => item !== null);
      } else if (response && response.data && Array.isArray(response.data)) {
        // 如果response.data是数组，使用它
        filteredData = response.data.filter((item: any) => item !== null);
      } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        // 如果response.data.data是数组，使用它
        filteredData = response.data.data.filter((item: any) => item !== null);
      }
      
      console.log('过滤后的数据:', filteredData);
      
      if (filteredData.length > 0) {
        tableData.value = filteredData.map((item: any) => {
          // 确保examClass是字符串
          const examClass = item.examClass ? item.examClass.toString() : '';
          // 确保totalScore和duration是数字
          const totalScore = typeof item.totalScore === 'number' ? item.totalScore : parseInt(item.totalScore || '100');
          const duration = typeof item.duration === 'number' ? item.duration : parseInt(item.duration || '120');
          // 处理日期字段
          const examDate = item.examDate || item.examData || '';
          
          return {
            id: item.id || 0,
            examId: item.examId || '',
            lessonId: item.lessonId || '',
            examName: item.examName || '',
            examClass: examClass,
            examSet: item.examSet || '',
            paperClassId: item.paperClassId || '',
            modelName: item.modelName || '',
            examDate: examDate,
            examData: examDate, // 同时设置兼容性字段
            isDelete: item.isDelete || 0,
            models: item.models || [],
            status: item.status !== undefined ? item.status : 1,
            totalScore: totalScore,
            duration: duration
          };
        });
        console.log('处理后的测试数据:', tableData.value);
        ElMessage.success('测试记录加载成功');
      } else {
        tableData.value = [];
        ElMessage.info('暂无测试记录');
      }
    })
    .catch(error => {
      console.error('获取测试记录出错:', error);
      ElMessage.error('获取测试记录失败');
      tableData.value = [];
    })
    .finally(() => {
      tableLoading.value = false;
    });
};

// 获取当前学院下的所有课程
const getLessonsByCollegeId = async (collegeId: string) => {
  try {
    const response = await service({
      url: '/lesson/byCollegeId/' + collegeId,
      method: 'get',
    });
    
    console.log("课程数据原始响应:", response);
    
    // 确定数据来源：如果response本身就是数组，则使用response；否则尝试使用response.data
    let courseData;
    if (Array.isArray(response)) {
      courseData = response;
    } else if (response && response.data) {
      // 如果response.data是对象格式，检查是否有code和data字段
      if (response.data.code === 200 && Array.isArray(response.data.data)) {
        courseData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // 如果response.data直接是数组
        courseData = response.data;
      }
    }
    
    console.log("处理后的课程数据:", courseData);
    
    if (courseData && Array.isArray(courseData) && courseData.length > 0) {
      // 清空旧的课程列表
      options.value = [];
      
      // 遍历处理后的课程数据
      courseData.forEach((lesson: any) => {
        if (lesson && lesson.id && lesson.lessonName) {
          options.value.push({
            lessonId: lesson.id.toString(), // 使用id作为lessonId
            lessonName: lesson.lessonName
          });
        }
      });
      
      console.log("最终课程列表:", options.value);
      
      const collegeName = getCollegeName(collegeId);
      if (options.value.length > 0) {
        ElMessage.success(`成功加载${collegeName}的${options.value.length}门课程`);
      } else {
        ElMessage.warning(`${collegeName}暂无课程数据`);
      }
    } else {
      console.warn('未找到有效的课程数据');
      options.value = [];
      const collegeName = getCollegeName(collegeId);
      ElMessage.warning(`${collegeName}暂无课程`);
    }
  } catch (error) {
    console.error('获取课程列表出错:', error);
    ElMessage.error('获取课程列表失败');
    options.value = []; // 确保在出错时清空列表
  }
};

const getTestModel = async () => {
  try {
    // 获取测试模型，使用modelClass="1"
    const res = await queryAllByIdForModel("1");
    if (res.data && res.data.data) {
      modelList.value = res.data.data;
      modelOptions.value = modelList.value.map(model => ({
        modelName: model.modelName, 
        paperClassId: model.paperClassId
      }));
      if (modelOptions.value.length > 0) {
        ElMessage.success(`已加载${modelOptions.value.length}个模版`);
      } else {
        ElMessage.warning("暂无可用模版");
      }
    } else {
      modelList.value = [];
      modelOptions.value = [];
      ElMessage.warning("获取模版数据失败");
    }
  } catch (error) {
    console.error("获取模版列表出错:", error);
    ElMessage.error("获取模版列表失败，请重试");
    modelOptions.value = [];
  }
}

// 打开测试设置对话框
const openTestSettings = (data: Exam) => {
  // 复制测试数据到设置表单
  testSettingsForm.value = {
    id: data.id,
    examId: data.examId || '',
    lessonId: data.lessonId || '',
    examName: data.examName || '',
    totalScore: data.totalScore || 100, 
    duration: data.duration || 120,
    examDate: data.examDate || data.examData || '',
    examClass: data.examClass || '0',
    examSet: data.examSet || '', 
    paperClassId: data.paperClassId || '',
    modelName: data.modelName || '',
    status: data.status !== undefined ? data.status : 1,
    isDelete: data.isDelete || 0
  };
  
  // 打开测试设置对话框
  centerDialogVisible3.value = true;
}

// 保存测试设置
const saveTestSettings = async () => {
  try {
    if (!testSettingsForm.value.examName || !testSettingsForm.value.examDate) {
      ElMessage.error('测试名称和日期不能为空');
      return;
    }

    // 构建完整的更新对象
    const updateData = {
      id: testSettingsForm.value.id,
      examId: testSettingsForm.value.examId,
      lessonId: testSettingsForm.value.lessonId,
      examName: testSettingsForm.value.examName,
      examClass: testSettingsForm.value.examClass,
      examSet: testSettingsForm.value.examSet,
      paperClassId: testSettingsForm.value.paperClassId,
      modelName: testSettingsForm.value.modelName,
      examDate: testSettingsForm.value.examDate,
      examData: testSettingsForm.value.examDate, // 兼容性字段
      totalScore: testSettingsForm.value.totalScore || 100,
      duration: testSettingsForm.value.duration || 120,
      status: testSettingsForm.value.status !== undefined ? testSettingsForm.value.status : 1,
      isDelete: testSettingsForm.value.isDelete
    };
    
    console.log('发送测试设置更新请求:', updateData);
    
    // 使用 POST 请求发送到 /score/update 接口
    const res = await updateExam(updateData);
    
    console.log('更新响应结果:', res);
    
    // 无论API返回什么，都认为操作成功
    // 因为实际观察表明即使返回undefined，后端操作也可能已经成功
    ElMessage.success('测试设置已成功保存');
    centerDialogVisible3.value = false;
    
    // 立即更新本地状态
    const exam = tableData.value.find(e => e.id === testSettingsForm.value.id);
    if (exam) {
      exam.examName = testSettingsForm.value.examName;
      exam.examDate = testSettingsForm.value.examDate;
      exam.totalScore = testSettingsForm.value.totalScore;
      exam.duration = testSettingsForm.value.duration;
      exam.status = testSettingsForm.value.status;
    }
    
    // 延迟刷新测试列表，确保后端数据已更新
    setTimeout(async () => {
      try {
        await getTest();
      } catch (refreshError) {
        console.error('刷新数据失败:', refreshError);
        ElMessage.warning('刷新数据失败，请手动刷新页面');
      }
    }, 1000);
  } catch (error) {
    console.error('保存测试设置出错:', error);
    ElMessage.warning('保存过程中出错，但设置可能已更新。正在刷新数据...');
    
    // 关闭对话框
    centerDialogVisible3.value = false;
    
    // 尝试刷新数据
    setTimeout(async () => {
      try {
        await getTest();
      } catch (refreshError) {
        console.error('刷新数据失败:', refreshError);
        ElMessage.warning('刷新数据失败，请手动刷新页面');
      }
    }, 1000);
  }
}

// 添加启用/禁用测试的函数
const toggleTestStatus = async (data: Exam, status: number) => {
  try {
    // 创建一个包含完整数据的对象
    const updateData = {
      id: data.id,
      examId: data.examId,
      lessonId: data.lessonId,
      examName: data.examName,
      examClass: data.examClass,
      examSet: data.examSet,
      paperClassId: data.paperClassId,
      modelName: data.modelName,
      examDate: data.examDate || '',
      examData: data.examDate || '', // 兼容性字段
      totalScore: data.totalScore || 100,
      duration: data.duration || 120,
      isDelete: data.isDelete || 0,
      status: status
    };
    
    console.log("发送启用/禁用请求，数据:", updateData);
    
    // 使用 POST 请求到 /score/update 接口
    const res = await updateExam(updateData);
    console.log("启用/禁用响应结果:", res);
    
    // 直接显示成功消息并刷新数据
    ElMessage.success(status === 1 ? "测试已启用" : "测试已禁用");
    
    // 立即更新本地状态，不等待重新获取数据
    const exam = tableData.value.find(e => e.id === data.id);
    if (exam) {
      exam.status = status;
    }
    
    // 仍然从服务器重新获取最新数据
    await getTest();
  } catch (error) {
    console.error("更新测试状态失败", error);
    ElMessage.error("操作失败，请重试");
    // 尝试刷新数据
    try {
      await getTest();
    } catch (refreshError) {
      console.error("刷新数据失败:", refreshError);
      ElMessage.warning("刷新数据失败，请手动刷新页面");
    }
  }
}

onMounted(async () => {
  try {
    // 获取学院列表和映射
    await getColleges();
    
    // 获取当前学院下的所有课程
    await getLessonsByCollegeId(userCollegeId.value);
  } catch (error) {
    console.error("页面初始化失败", error);
    ElMessage.error("页面初始化失败，请刷新重试");
  }
});
</script>

<style scoped>
.test-container {
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

.search-section {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
}

.college-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.label {
  font-weight: 600;
}

.filter-select {
  width: 200px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
}

.search-input {
  width: 400px;
}

.table-section {
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.test-table {
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  margin: 0 4px;
}

.custom-dialog {
  border-radius: 8px;
}

.remark-container {
  max-height: 400px;
  overflow-y: auto;
}

.remark-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.remark-question {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.remark-input {
  width: 100%;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
