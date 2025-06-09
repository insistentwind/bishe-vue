<template>
  <el-container class="layout-container">
    <el-header>
      <div class="header-content">
        <div class="logo">试卷管理系统</div>
        <el-menu
          mode="horizontal"
          router
          :default-active="route.path"
        >
          <el-menu-item index="/exam/editor">
            <el-icon><Edit /></el-icon>
            <span>试卷编辑</span>
          </el-menu-item>
          <!-- 其他菜单项 -->
        </el-menu>
      </div>
    </el-header>

    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'

const route = useRoute()
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>