import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '../views/login.vue'
import ExamEditor from '@/views/ExamEditor.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/creat',
            name: 'creat',
            component: () => import('../views/creat.vue'),
        },
        {
            path: '/home',
            name: 'home',
            component: () => import('../views/home.vue'),
            children: [{
                    path: '/welcome',
                    name: 'welcome',
                    component: () => import('../views/pages/welcome.vue')
                }, {
                    path: '/answer',
                    name: 'answer',
                    component: () => import('../views/pages/answer.vue')
                },
                {
                    path: '/statistics',
                    name: 'statistics',
                    component: () => import('../views/pages/statistics.vue')
                },
                {
                    path: '/resources',
                    name: 'resources',
                    component: () => import('../views/pages/resources.vue')
                },
                {
                    path: '/school',
                    name: 'school',
                    component: () => import('../views/pages/school.vue')
                },
                {
                    path: '/class',
                    name: 'class',
                    component: () => import('../views/pages/class.vue')
                },
                {
                    path: '/student',
                    name: 'student',
                    component: () => import('../views/pages/student.vue')
                },
                {
                    path: '/authority',
                    name: 'authority',
                    component: () => import('../views/pages/authority.vue')
                },
                {
                    path: '/myclass',
                    name: 'myclass',
                    component: () => import('../views/pages/myclass.vue')
                },
                {
                    path: '/test',
                    name: 'test',
                    component: () => import('../views/pages/test.vue')
                },
                {
                    path: '/exam',
                    name: 'exam',
                    component: () => import('../views/pages/exam.vue')
                },
                {
                    path: '/score',
                    name: 'score',
                    component: () => import('../views/pages/score.vue')
                },
                {
                    path: '/setScore',
                    name: 'setScore',
                    component: () => import('../views/pages/setScore.vue')
                },
                {
                    path: '/getScore',
                    name: 'getScore',
                    component: () => import('../views/pages/getScore.vue')
                },
                {
                    path: '/seeScore',
                    name: 'seeScore',
                    component: () => import('../views/pages/seeScore.vue')
                },
                {
                    path: '/studentScore',
                    name: 'studentScore',
                    component: () => import('../views/pages/studenScore.vue')
                },
                {
                    path: '/oneStudent',
                    name: 'oneStudent',
                    component: () => import('../views/pages/oneStudent.vue')
                },
                {
                    path: '/teacher',
                    name: 'teacher',
                    component: () => import('../views/pages/teacher.vue')
                },
                {
                    path: '/studentInfo',
                    name: 'studentInfo',
                    component: () => import('../views/pages/studentInfo.vue')
                },
                {
                    path: '/editor',
                    name: 'ExamEditor',
                    component: () => import('@/views/ExamEditor.vue')
                },
                {
                    path: '/announcement',
                    name: 'announcement',
                    component: () => import('../views/pages/announcement.vue')
                },
                // 学生专用页面
                {
                    path: '/myGrades',
                    name: 'myGrades',
                    component: () => import('../views/myGrades.vue')
                },
                {
                    path: '/studentCourses',
                    name: 'studentCourses',
                    component: () => import('../views/studentCourses.vue')
                },
                {
                    path: '/classInfo',
                    name: 'classInfo',
                    component: () => import('../views/pages/classInfo.vue')
                },
                {
                    path: '/myClassInfo',
                    name: 'myClassInfo',
                    component: () => import('../views/pages/myClassInfo.vue')
                },
                {
                    path: '/takeExam',
                    name: 'takeExam',
                    component: () => import('../views/takeExam.vue')
                },
                {
                    path: '/courseConsult',
                    name: 'courseConsult',
                    component: () => import('../views/pages/courseConsult.vue')
                },
                {
                    path: '/courseAnswer',
                    name: 'courseAnswer',
                    component: () => import('../views/pages/courseAnswer.vue')
                }
            ]
        },
        // 管理员系统路由
        {
            path: '/admin/login',
            name: 'adminLogin',
            component: () => import('../views/admin/login.vue')
        },
        {
            path: '/admin',
            component: () => import('../views/admin/layout.vue'),
            redirect: '/admin/dashboard',
            children: [
                {
                    path: 'dashboard',
                    name: 'adminDashboard',
                    component: () => import('../views/admin/dashboard.vue')
                },
                {
                    path: 'user',
                    name: 'adminUser',
                    component: () => import('../views/admin/user.vue')
                },
                {
                    path: 'user/create',
                    name: 'adminUserCreate',
                    component: () => import('../views/admin/userForm.vue')
                },
                {
                    path: 'user/edit/:id',
                    name: 'adminUserEdit',
                    component: () => import('../views/admin/userForm.vue')
                },
                {
                    path: 'user/detail/:id',
                    name: 'adminUserDetail',
                    component: () => import('../views/admin/userDetail.vue')
                },
                {
                    path: 'role',
                    name: 'adminRole',
                    component: () => import('../views/admin/role.vue')
                },
                {
                    path: 'permission',
                    name: 'adminPermission',
                    component: () => import('../views/admin/blank.vue')
                },
                {
                    path: 'college',
                    name: 'adminCollege',
                    component: () => import('../views/admin/college.vue')
                },
                {
                    path: 'major',
                    name: 'adminMajor',
                    component: () => import('../views/admin/major.vue')
                },
                {
                    path: 'class',
                    name: 'adminClass',
                    component: () => import('../views/admin/class.vue')
                },
                {
                    path: 'teacher',
                    name: 'adminTeacher',
                    component: () => import('../views/admin/blank.vue')
                },
                {
                    path: 'student',
                    name: 'adminStudent',
                    component: () => import('../views/admin/blank.vue')
                },
                {
                    path: 'course',
                    name: 'CourseList',
                    component: () => import('../views/admin/course.vue')
                },
                {
                    path: 'course/form',
                    name: 'CourseForm',
                    component: () => import('../views/admin/courseForm.vue')
                },
                {
                    path: 'course/create',
                    name: 'adminCourseCreate',
                    component: () => import('../views/admin/courseForm.vue')
                },
                {
                    path: 'course/edit/:id',
                    name: 'adminCourseEdit',
                    component: () => import('../views/admin/courseForm.vue')
                },
                {
                    path: 'exam',
                    name: 'adminExam',
                    component: () => import('../views/admin/blank.vue')
                },
                {
                    path: 'profile',
                    name: 'adminProfile',
                    component: () => import('../views/admin/profile.vue')
                },
                {
                    path: 'settings',
                    name: 'adminSettings',
                    component: () => import('../views/admin/blank.vue')
                },
                {
                    path: 'backup',
                    name: 'adminBackup',
                    component: () => import('../views/admin/blank.vue')
                },
                {
                    path: 'log',
                    name: 'adminLog',
                    component: () => import('../views/admin/blank.vue')
                },
                {
                    path: 'password',
                    name: 'adminPassword',
                    component: () => import('../views/admin/password.vue')
                }
            ]
        }
    ]
})

export default router
