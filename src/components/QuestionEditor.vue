<template>
  <div class="question-editor">
    <el-form :model="modelValue" label-width="80px">
      <el-form-item label="题型">
        <el-select v-model="modelValue.type">
          <el-option label="题注" value="note" />
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="客观题" value="objective" />
          <el-option label="填空题" value="blank" />
        </el-select>
      </el-form-item>

      <!-- 题注类型特有字段 -->
      <template v-if="modelValue.type === 'note'">
        <el-form-item label="题注标题">
          <el-input v-model="modelValue.noteTitle" placeholder="请输入题注标题（选填）" />
        </el-form-item>
        
        <el-form-item label="关联题数">
          <el-input-number v-model="modelValue.relatedCount" :min="1" :max="10" />
          <div class="help-text">请设置该题注后面会关联的题目数量</div>
        </el-form-item>
      </template>

      <el-form-item label="内容">
        <div class="horizontal-editor">
          <QuillEditor
            v-model:content="modelValue.content"
            theme="snow"
            :toolbar="fullToolbar"
            contentType="html"
            :placeholder="modelValue.type === 'note' ? '请输入题注内容（如阅读材料、图表等）' : '请输入题目内容'"
            :enable-html="true"
            :preserve-whitespace="true"
          />
        </div>
      </el-form-item>
      
      <!-- 选择题选项 -->
      <template v-if="modelValue.type === 'single' || modelValue.type === 'multiple'">
        <el-form-item label="选项">
          <div v-for="(option, index) in modelValue.options" :key="option.id" class="option-item">
            <div class="option-header">
              <span class="option-label">{{ String.fromCharCode(65 + index) }}. </span>
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click="removeOption(index)"
                :disabled="modelValue.options.length <= 2"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <QuillEditor
              v-model:content="option.content"
              theme="snow"
              :toolbar="optionToolbar"
              contentType="html"
              placeholder="请输入选项内容"
              :enable-html="true"
              :preserve-whitespace="true"
            />
          </div>
          <div class="add-option">
            <el-button 
              type="primary" 
              plain 
              @click="addOption"
              :disabled="modelValue.options.length >= 6"
            >
              <el-icon><Plus /></el-icon>
              添加选项
            </el-button>
          </div>
        </el-form-item>

        <!-- 单选题答案 -->
        <el-form-item label="答案" v-if="modelValue.type === 'single'">
          <el-select v-model="modelValue.answer" placeholder="请选择正确答案">
            <el-option 
              v-for="(option, index) in modelValue.options" 
              :key="option.id"
              :label="`选项 ${String.fromCharCode(65 + index)}`"
              :value="option.id"
            />
          </el-select>
        </el-form-item>

        <!-- 多选题答案 -->
        <el-form-item label="答案" v-else-if="modelValue.type === 'multiple'">
          <el-select 
            v-model="multipleAnswer" 
            multiple 
            placeholder="请选择正确答案（可多选）"
            style="width: 100%"
          >
            <el-option 
              v-for="(option, index) in modelValue.options" 
              :key="option.id"
              :label="`选项 ${String.fromCharCode(65 + index)}`"
              :value="option.id"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 客观题答案 -->
      <template v-else-if="modelValue.type === 'objective'">
        <el-form-item label="标准答案" class="standard-answer">
          <div class="answer-area">
            <div class="answer-label">
              <el-tag type="success" effect="dark">参考答案</el-tag>
              <small>（此处填写的内容会作为评分依据）</small>
            </div>
            <div class="horizontal-editor">
              <QuillEditor
                v-model:content="objectiveAnswerContent"
                theme="snow"
                :toolbar="answerToolbar"
                contentType="html"
                placeholder="请输入标准答案（不要与解析混淆）"
                :enable-html="true"
                :preserve-whitespace="true"
              />
            </div>
          </div>
        </el-form-item>
      </template>

      <!-- 填空题答案 -->
      <template v-else-if="modelValue.type === 'blank'">
        <el-form-item label="答案">
          <el-input 
            v-model="modelValue.answer"
            placeholder="请输入填空题答案"
          />
        </el-form-item>
      </template>

      <!-- 分值（题注类型不需要分值） -->
      <el-form-item label="分值" v-if="modelValue.type !== 'note'">
        <el-input-number v-model="modelValue.score" :min="0" :max="100" />
      </el-form-item>

      <!-- 解析（题注类型不需要解析） -->
      <el-form-item label="解析" class="analysis-item" v-if="modelValue.type !== 'note'">
        <div class="answer-area">
          <div class="answer-label">
            <el-tag type="info" effect="dark">答案解析</el-tag>
            <small>（此处填写的内容用于解释答案，不会作为评分依据）</small>
          </div>
          <div class="horizontal-editor">
            <QuillEditor
              v-model:content="analysisContent"
              theme="snow"
              :toolbar="answerToolbar"
              contentType="html"
              placeholder="请输入答案解析（不要与答案混淆）"
              :enable-html="true"
              :preserve-whitespace="true"
            />
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import { ref, watch, computed } from 'vue'

interface Question {
  id: number;
  type: string;
  content: string;
  options: {
    id: string;
    content: string;
  }[];
  answer: string | string[];
  score: number;
  analysis: string;
  objectiveAnswer?: string;
  noteTitle?: string;      // 题注标题
  relatedCount?: number;   // 与题注关联的题目数量
  isNote?: boolean;        // 是否是题注
}

const props = defineProps<{
  modelValue: Question
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Question): void
}>()

// 用于更新多个字段的工具函数
const updateModelValue = (updates: Partial<Question>) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ...updates
  })
}

// 初始化题注特有字段
if (props.modelValue.type === 'note' && props.modelValue.relatedCount === undefined) {
  updateModelValue({
    relatedCount: 4, // 默认关联4道题
    isNote: true,
    score: 0 // 题注不计分
  })
}

// 确保多选题答案是数组
if (props.modelValue.type === 'multiple' && !Array.isArray(props.modelValue.answer)) {
  // 如果答案是字符串且非空，则转为数组
  if (typeof props.modelValue.answer === 'string' && props.modelValue.answer) {
    updateModelValue({
      answer: [props.modelValue.answer]
    })
  } else {
    // 否则初始化为空数组
    updateModelValue({
      answer: []
    })
  }
}

// 创建本地ref以避免直接修改props
const objectiveAnswerContent = computed({
  get: () => props.modelValue.objectiveAnswer || '',
  set: (value) => {
    updateModelValue({ objectiveAnswer: value, answer: value })
  }
})

const analysisContent = computed({
  get: () => props.modelValue.analysis || '',
  set: (value) => {
    updateModelValue({ analysis: value })
  }
})

// 处理多选题答案
const multipleAnswer = computed({
  get: () => {
    // 确保返回数组类型
    return Array.isArray(props.modelValue.answer) 
      ? props.modelValue.answer 
      : (props.modelValue.answer ? [props.modelValue.answer] : [])
  },
  set: (value: string[]) => {
    updateModelValue({ answer: value })
  }
})

// 添加选项
function addOption() {
  if (!props.modelValue.options) {
    props.modelValue.options = []
  }
  
  if (props.modelValue.options.length >= 6) {
    return; // 最多6个选项
  }
  
  const newOptionIndex = props.modelValue.options.length
  const newOption = {
    id: `${props.modelValue.id}_${String.fromCharCode(65 + newOptionIndex)}`,
    content: ''
  }
  
  updateModelValue({
    options: [...props.modelValue.options, newOption]
  })
}

// 删除选项
function removeOption(index: number) {
  if (props.modelValue.options.length <= 2) {
    return; // 至少保留2个选项
  }
  
  const updatedOptions = [...props.modelValue.options]
  const removedOption = updatedOptions.splice(index, 1)[0]
  
  // 重新生成选项ID，确保字母连续
  const reorderedOptions = updatedOptions.map((option, idx) => ({
    ...option,
    id: `${props.modelValue.id}_${String.fromCharCode(65 + idx)}`
  }))
  
  // 处理答案更新
  let updatedAnswer = props.modelValue.answer
  
  // 单选题
  if (props.modelValue.type === 'single' && typeof updatedAnswer === 'string') {
    // 如果删除的是当前选中的选项，清空答案
    if (updatedAnswer === removedOption.id) {
      updatedAnswer = ''
    } 
    // 如果删除的选项ID在当前选中选项之前，需要更新答案ID
    else {
      const answerIndex = props.modelValue.options.findIndex(opt => opt.id === updatedAnswer)
      if (answerIndex > index) {
        // 答案在删除的选项之后，需要往前移一位
        updatedAnswer = reorderedOptions[answerIndex - 1].id
      } else if (answerIndex !== -1) {
        // 答案在删除的选项之前，保持原答案对应的选项
        updatedAnswer = reorderedOptions[answerIndex].id
      }
    }
  } 
  // 多选题
  else if (props.modelValue.type === 'multiple' && Array.isArray(updatedAnswer)) {
    // 从答案中移除被删除的选项
    updatedAnswer = updatedAnswer.filter(ans => ans !== removedOption.id)
    
    // 更新其他选项的ID引用
    updatedAnswer = updatedAnswer.map(ans => {
      const oldIndex = props.modelValue.options.findIndex(opt => opt.id === ans)
      // 如果在删除的选项之后，索引减1
      if (oldIndex > index) {
        return reorderedOptions[oldIndex - 1].id
      } 
      // 如果在删除的选项之前，保持不变
      else if (oldIndex !== -1 && oldIndex < index) {
        return reorderedOptions[oldIndex].id
      }
      return ans
    })
  }
  
  updateModelValue({
    options: reorderedOptions,
    answer: updatedAnswer
  })
}

// 防止answer和analysis内容相同的监听器
watch(() => [props.modelValue.objectiveAnswer, props.modelValue.analysis], ([newAnswer, newAnalysis]) => {
  if (props.modelValue.type === 'objective' && newAnswer && newAnalysis) {
    // 如果答案和解析完全相同，且不为空，发出警告
    if (newAnswer === newAnalysis) {
      console.warn('警告：客观题的答案和解析内容相同，可能存在混淆')
    }
  }
}, { deep: true })

// 监听题型变化，确保数据字段正确
watch(() => props.modelValue.type, (newType, oldType) => {
  if (newType === 'note') {
    // 处理题注类型
    updateModelValue({
      relatedCount: props.modelValue.relatedCount || 4, // 默认关联4道题
      isNote: true,
      score: 0, // 题注不计分
      answer: '', // 题注没有答案
      analysis: '' // 题注没有解析
    })
  } else if (oldType === 'note') {
    // 从题注类型切换出来
    updateModelValue({
      isNote: false,
      score: 5 // 恢复默认分值
    })
  }
  
  // 从单选题切换到多选题
  if (newType === 'multiple' && oldType === 'single') {
    // 转换为数组格式
    const currentAnswer = props.modelValue.answer
    updateModelValue({
      answer: typeof currentAnswer === 'string' && currentAnswer ? [currentAnswer] : []
    })
  }
  // 从多选题切换到单选题
  else if (newType === 'single' && oldType === 'multiple') {
    // 取第一个选项作为单选答案
    const currentAnswer = props.modelValue.answer
    updateModelValue({
      answer: Array.isArray(currentAnswer) && currentAnswer.length > 0 ? currentAnswer[0] : ''
    })
  }

  // 确保选择题有选项
  if ((newType === 'single' || newType === 'multiple') && 
      (!props.modelValue.options || props.modelValue.options.length === 0)) {
    const optionsArray = [];
    for (let i = 0; i < 4; i++) {
      optionsArray.push({
        id: `${props.modelValue.id}_${String.fromCharCode(65 + i)}`,
        content: ''
      });
    }
    updateModelValue({ options: optionsArray });
  }
  
  if (newType === 'objective') {
    // 转为客观题时，确保objectiveAnswer字段存在
    if (!props.modelValue.objectiveAnswer && props.modelValue.answer) {
      // 如果没有objectiveAnswer但有answer，复制answer到objectiveAnswer
      updateModelValue({
        objectiveAnswer: Array.isArray(props.modelValue.answer) 
          ? props.modelValue.answer.join(',') 
          : props.modelValue.answer
      })
    }
  }
})

// 完整的编辑器工具栏配置
const fullToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'font': [] }],
  [{ 'align': ['', 'center', 'right', 'justify'] }],
  ['clean'],
  ['link', 'image', 'video', 'formula']
]

// 工具栏配置
const optionToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'align': ['', 'center', 'right', 'justify'] }],
  ['clean'],
  ['link', 'image', 'formula']
]

const answerToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'align': ['', 'center', 'right', 'justify'] }],
  ['link', 'image', 'formula']
]
</script>

<style scoped>
.question-editor {
  padding: 10px;
}

.option-item {
  margin-bottom: 20px;
}

:deep(.ql-editor) {
  min-height: 100px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
}

/* 确保富文本对齐方式生效 */
:deep([style*="text-align:center"]), 
:deep([align="center"]) {
  text-align: center !important;
}

:deep([style*="text-align:right"]), 
:deep([align="right"]) {
  text-align: right !important;
}

:deep([style*="text-align:justify"]), 
:deep([align="justify"]) {
  text-align: justify !important;
}

:deep([style*="text-align:left"]), 
:deep([align="left"]) {
  text-align: left !important;
}

/* 保证图片和表格样式 */
:deep(img) {
  max-width: 100%;
  height: auto;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

:deep(table td),
:deep(table th) {
  border: 1px solid #ddd;
  padding: 8px;
}

/* 处理列表样式 */
:deep(ul), 
:deep(ol) {
  padding-left: 20px;
  margin: 10px 0;
}

:deep(li) {
  margin: 5px 0;
}

/* 处理字体样式 */
:deep(b), 
:deep(strong) {
  font-weight: bold !important;
}

:deep(i), 
:deep(em) {
  font-style: italic !important;
}

:deep(u) {
  text-decoration: underline !important;
}

/* 处理标题样式 */
:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  margin: 16px 0 8px;
  font-weight: bold;
}

/* 处理引用区块样式 */
:deep(blockquote) {
  border-left: 4px solid #ccc;
  margin: 16px 0;
  padding: 10px 20px;
  background: #f9f9f9;
}

.horizontal-editor {
  width: 100%;
}

.add-option {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.option-label {
  font-weight: bold;
}

.answer-area {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.answer-label {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-label small {
  color: #909399;
}

.analysis-item {
  margin-top: 10px;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style> 