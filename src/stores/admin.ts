import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AdminInfo {
  id: string
  username: string
  name: string
  avatar: string
  role: string
  lastLoginTime: string
  createTime: string
  status: number
}

export const useAdminStore = defineStore('admin', () => {
  // 管理员信息
  const adminInfo = ref<AdminInfo>({
    id: '',
    username: '',
    name: '',
    avatar: '',
    role: '',
    lastLoginTime: '',
    createTime: '',
    status: 1
  })

  // 设置管理员信息
  function setAdminInfo(info: AdminInfo) {
    adminInfo.value = info
  }

  // 清除管理员信息
  function clearAdminInfo() {
    adminInfo.value = {
      id: '',
      username: '',
      name: '',
      avatar: '',
      role: '',
      lastLoginTime: '',
      createTime: '',
      status: 1
    }
  }

  // 设置菜单折叠状态
  const isCollapse = ref(false)
  function toggleCollapse() {
    isCollapse.value = !isCollapse.value
  }

  return {
    adminInfo,
    setAdminInfo,
    clearAdminInfo,
    isCollapse,
    toggleCollapse
  }
}) 