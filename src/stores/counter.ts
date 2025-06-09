import { defineStore } from 'pinia';
import { ref } from 'vue';

interface StudentScoreDto {
  studentId: string;
  studentName: string;
  examId: string;
  totalScore: number;
}
interface User {
  id:string,
  name: string,
  username: string,
  avatar: string,
  oldPassword: string,
  newPassword: string,
  description: string,
  authorityRole: string,
  identity: string,
  email?: string,
  collegeId?: string,
  collegeName?: string,
  phone?: string
}

// 从localStorage获取用户数据
const getPersistedUserInfo = (): User => {
  try {
    return {
      id: localStorage.getItem('id') || '',
      name: localStorage.getItem('name') || '',
      username: localStorage.getItem('username') || '',
      avatar: localStorage.getItem('avatar') || '',
      oldPassword: '',
      newPassword: '',
      description: localStorage.getItem('description') || '',
      authorityRole: localStorage.getItem('authorityRole') || '',
      identity: localStorage.getItem('identity') || '',
      email: localStorage.getItem('email') || '',
      collegeId: localStorage.getItem('collegeId') || '',
      collegeName: localStorage.getItem('collegeName') || '',
      phone: localStorage.getItem('phone') || ''
    };
  } catch (e) {
    console.error('Failed to load user data from localStorage:', e);
    return {} as User;
  }
};

export const useStudentStore = defineStore({
  id: 'student',
  state: () => ({
    studentScoreList: [] as StudentScoreDto[],
    studentInfo:{} as StudentScoreDto,
    userInfo: getPersistedUserInfo(),
  }),
  actions: {
    setStudentScoreList(studentScoreList: StudentScoreDto[]) {
      this.studentScoreList = studentScoreList;
    },
    setStudentInfo(studentInfo: StudentScoreDto) {
      this.studentInfo = studentInfo;
    },
    setUserInfo(userInfo: User) {
      this.userInfo = userInfo;
      
      // 将用户信息保存到localStorage，确保页面刷新后数据不丢失
      localStorage.setItem('name', userInfo.name || '');
      localStorage.setItem('id', userInfo.id || '');
      localStorage.setItem('username', userInfo.username || '');
      localStorage.setItem('avatar', userInfo.avatar || '');
      localStorage.setItem('description', userInfo.description || '');
      localStorage.setItem('authorityRole', userInfo.authorityRole || '');
      localStorage.setItem('identity', userInfo.identity || '');
      
      // 保存可能为undefined的字段
      if (userInfo.email) localStorage.setItem('email', userInfo.email);
      if (userInfo.collegeId) localStorage.setItem('collegeId', userInfo.collegeId);
      if (userInfo.collegeName) localStorage.setItem('collegeName', userInfo.collegeName);
      if (userInfo.phone) localStorage.setItem('phone', userInfo.phone);
    },
    // 新增方法，用于初始化或更新特定字段
    updateUserField(field: keyof User, value: string) {
      if (this.userInfo) {
        // @ts-ignore - 忽略类型检查错误
        this.userInfo[field] = value;
        
        // 同时更新localStorage
        localStorage.setItem(field === 'username' ? 'id' : field, value);
        
        console.log(`字段 ${field} 已更新为:`, value);
      }
    }
  }
});
