<template>
  <div class="user-avatar">
    <el-upload
      class="avatar-uploader"
      action="#"
      :show-file-list="false"
      :auto-upload="false"
      accept="image/*"
      @change="handleAvatarChange"
    >
      <div class="avatar-wrapper">
        <img v-if="modelValue" :src="modelValue" class="avatar" />
        <el-icon v-else class="avatar-icon"><Plus /></el-icon>
      </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 处理头像变更
const handleAvatarChange = (file: any) => {
  // 创建一个本地预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    emit('update:modelValue', e.target?.result as string)
  }
  reader.readAsDataURL(file.raw)
}
</script>

<style scoped>
.avatar-uploader {
  text-align: center;
}

.avatar-wrapper {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.avatar-wrapper:hover {
  border-color: #409eff;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 