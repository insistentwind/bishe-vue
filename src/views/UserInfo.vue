<template>
  <div class="user-info">
    <div class="avatar-section">
      <UserAvatar v-model="userInfo.avatar" />
    </div>
    <el-form :model="userInfo" label-width="100px">
      <!-- 其他表单项... -->
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'

interface UserInfo {
  avatar: string
  // ... 其他字段
}

const userInfo = ref<UserInfo>({
  avatar: '',
  // ... 其他字段
})
</script>

<style scoped>
.user-info {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.avatar-section {
  margin-bottom: 30px;
}
</style> 