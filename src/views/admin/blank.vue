<template>
  <div class="blank-container">
    <el-empty 
      description="此功能正在开发中，敬请期待" 
      :image-size="240"
    >
      <template #description>
        <p>正在开发中</p>
        <p class="sub-text">此功能即将推出，敬请期待</p>
      </template>
      <el-button type="primary" @click="goBack">返回</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回上一页
const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.blank-container {
  padding: 60px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  
  .sub-text {
    color: #909399;
    font-size: 14px;
    margin-top: 8px;
  }
}
</style> 