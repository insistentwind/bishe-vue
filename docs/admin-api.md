# 管理员系统API接口文档

## 基础信息

- **基础URL**: `http://localhost:8989`
- **响应格式**: 所有API响应均为JSON格式
- **认证方式**: 基于Token的认证，Token需要在HTTP请求头中的`token`字段中提供

## 通用响应格式

```json
{
  "code": 200,           // 状态码，200表示成功，非200表示失败
  "data": {},            // 响应数据，具体格式根据接口而定
  "message": "success"   // 响应消息，用于描述请求结果
}
```

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或Token已过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 接口列表

### 1. 登录认证

#### 管理员登录

- **URL**: `/admin/login`
- **方法**: `POST`
- **说明**: 管理员账号登录
- **请求参数**:

```json
{
  "username": "admin",     // 管理员用户名
  "password": "password"   // 管理员密码
}
```

- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": "1",
    "username": "admin",
    "name": "系统管理员",
    "avatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    "role": "ADMIN",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "lastLoginTime": "2025-05-03T14:30:45.000Z",
    "createTime": "2025-01-01T00:00:00.000Z"
  },
  "message": "登录成功"
}
```

### 2. 系统概览

#### 获取系统概览数据

- **URL**: `/admin/overview`
- **方法**: `GET`
- **需要认证**: 是
- **说明**: 获取系统概览数据，包括用户数量、学院数量、班级数量等
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "userCount": 2453,
    "userGrowth": 8.2,
    "collegeCount": 12,
    "collegeGrowth": 0,
    "classCount": 82,
    "classGrowth": 5.6,
    "activityCount": 589,
    "activityGrowth": 12.4,
    "userDistribution": {
      "role": [
        {"name": "学生", "value": 1850},
        {"name": "教师", "value": 420},
        {"name": "管理员", "value": 25},
        {"name": "其他", "value": 158}
      ],
      "college": [
        {"name": "计算机学院", "value": 620},
        {"name": "信息工程学院", "value": 535},
        {"name": "机械学院", "value": 410},
        {"name": "电气学院", "value": 385},
        {"name": "外国语学院", "value": 300},
        {"name": "其他", "value": 203}
      ]
    },
    "visitTrend": {
      "week": [820, 932, 901, 934, 1290, 530, 320],
      "month": [3200, 4500, 5800, 6200]
    },
    "recentActivities": [
      {
        "content": "系统管理员更新了系统配置",
        "time": "2025-05-03 20:46",
        "type": "primary"
      },
      {
        "content": "添加了新学院：人工智能学院",
        "time": "2025-05-03 18:30",
        "type": "success"
      },
      {
        "content": "导入了100名新学生账号",
        "time": "2025-05-03 15:20",
        "type": "info"
      }
    ]
  },
  "message": "success"
}
```

### 3. 用户管理

#### 获取用户列表

- **URL**: `/admin/users`
- **方法**: `GET`
- **需要认证**: 是
- **说明**: 获取用户列表
- **请求参数**:

| 参数名 | 必填 | 类型 | 说明 |
|--------|------|------|------|
| page | 否 | number | 页码，默认1 |
| pageSize | 否 | number | 每页条数，默认10 |
| role | 否 | string | 角色筛选(TEACHER/STUDENT/ADMIN) |
| keyword | 否 | string | 搜索关键词 |

- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "total": 2453,
    "list": [
      {
        "id": "1",
        "username": "admin",
        "name": "系统管理员",
        "avatar": "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
        "role": "ADMIN",
        "email": "admin@example.com",
        "phone": "13800138000",
        "status": 1,
        "createTime": "2025-01-01T00:00:00.000Z"
      },
      // ... 更多用户数据
    ]
  },
  "message": "success"
}
```

#### 创建用户

- **URL**: `/admin/users`
- **方法**: `POST`
- **需要认证**: 是
- **说明**: 创建新用户
- **请求参数**:

```json
{
  "username": "teacher1",         // 用户名
  "password": "password123",      // 密码
  "name": "张教授",               // 姓名
  "role": "TEACHER",              // 角色类型
  "email": "teacher1@example.com", // 邮箱
  "phone": "13900001234",         // 电话
  "collegeId": "1",               // 学院ID
  "description": "计算机科学教授"  // 描述
}
```

- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": "101",
    "username": "teacher1",
    "name": "张教授",
    "role": "TEACHER",
    "email": "teacher1@example.com",
    "phone": "13900001234",
    "collegeId": "1",
    "description": "计算机科学教授",
    "createTime": "2025-05-03T21:30:45.000Z"
  },
  "message": "用户创建成功"
}
```

#### 更新用户信息

- **URL**: `/admin/users/{id}`
- **方法**: `PUT`
- **需要认证**: 是
- **说明**: 更新用户信息
- **请求参数**:

```json
{
  "name": "张教授",                // 姓名
  "email": "teacher1@example.com", // 邮箱
  "phone": "13900001234",         // 电话
  "collegeId": "1",               // 学院ID
  "description": "计算机科学教授",  // 描述
  "status": 1                     // 状态：1启用，0禁用
}
```

- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "id": "101",
    "username": "teacher1",
    "name": "张教授",
    "role": "TEACHER",
    "email": "teacher1@example.com",
    "phone": "13900001234",
    "collegeId": "1",
    "description": "计算机科学教授",
    "status": 1,
    "updateTime": "2025-05-03T22:15:30.000Z"
  },
  "message": "用户信息更新成功"
}
```

#### 删除用户

- **URL**: `/admin/users/{id}`
- **方法**: `DELETE`
- **需要认证**: 是
- **说明**: 删除用户
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "data": null,
  "message": "用户删除成功"
}
```

### 4. 学院管理

#### 获取学院列表

- **URL**: `/admin/colleges`
- **方法**: `GET`
- **需要认证**: 是
- **说明**: 获取学院列表
- **请求参数**:

| 参数名 | 必填 | 类型 | 说明 |
|--------|------|------|------|
| page | 否 | number | 页码，默认1 |
| pageSize | 否 | number | 每页条数，默认10 |
| keyword | 否 | string | 搜索关键词 |

- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "total": 12,
    "list": [
      {
        "collegeId": "1",
        "collegeName": "计算机学院",
        "description": "计算机科学与技术学院",
        "createTime": "2024-01-01T00:00:00.000Z",
        "studentCount": 620,
        "teacherCount": 45
      },
      // ... 更多学院数据
    ]
  },
  "message": "success"
}
```

### 5. 班级管理

#### 获取班级列表

- **URL**: `/admin/classes`
- **方法**: `GET`
- **需要认证**: 是
- **说明**: 获取班级列表
- **请求参数**:

| 参数名 | 必填 | 类型 | 说明 |
|--------|------|------|------|
| page | 否 | number | 页码，默认1 |
| pageSize | 否 | number | 每页条数，默认10 |
| collegeId | 否 | string | 学院ID |
| keyword | 否 | string | 搜索关键词 |

- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "total": 82,
    "list": [
      {
        "classId": "1",
        "className": "计算机科学2023级1班",
        "collegeId": "1",
        "collegeName": "计算机学院",
        "majorName": "计算机科学与技术",
        "grade": "2023",
        "studentCount": 35,
        "headTeacher": "张教授",
        "createTime": "2023-09-01T00:00:00.000Z"
      },
      // ... 更多班级数据
    ]
  },
  "message": "success"
}
```

### 6. 系统设置

#### 获取系统设置

- **URL**: `/admin/settings`
- **方法**: `GET`
- **需要认证**: 是
- **说明**: 获取系统设置
- **请求参数**: 无
- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "siteName": "在线批阅系统",
    "siteDescription": "高效的在线试卷批阅和管理系统",
    "systemVersion": "2.0.1",
    "allowRegistration": true,
    "mailServerEnabled": true,
    "backupInterval": 24,
    "lastBackupTime": "2025-05-02T03:00:00.000Z",
    "theme": "default",
    "logoUrl": "https://cdn.jsdelivr.net/npm/@vant/assets/logo.png"
  },
  "message": "success"
}
```

#### 更新系统设置

- **URL**: `/admin/settings`
- **方法**: `PUT`
- **需要认证**: 是
- **说明**: 更新系统设置
- **请求参数**:

```json
{
  "siteName": "在线批阅系统",
  "siteDescription": "高效的在线试卷批阅和管理系统",
  "allowRegistration": true,
  "mailServerEnabled": true,
  "backupInterval": 24,
  "theme": "default",
  "logoUrl": "https://cdn.jsdelivr.net/npm/@vant/assets/logo.png"
}
```

- **响应示例**:

```json
{
  "code": 200,
  "data": {
    "siteName": "在线批阅系统",
    "siteDescription": "高效的在线试卷批阅和管理系统",
    "systemVersion": "2.0.1",
    "allowRegistration": true,
    "mailServerEnabled": true,
    "backupInterval": 24,
    "lastBackupTime": "2025-05-02T03:00:00.000Z",
    "theme": "default",
    "logoUrl": "https://cdn.jsdelivr.net/npm/@vant/assets/logo.png",
    "updateTime": "2025-05-03T23:45:30.000Z"
  },
  "message": "系统设置更新成功"
}
```

## 常见问题

1. **如何处理认证失败的情况？**
   当认证失败时（错误码401），前端应自动跳转到登录页面，清除已保存的token。

2. **如何处理权限不足的情况？**
   当权限不足时（错误码403），前端应提示用户没有操作权限，并回退到上一页或首页。

3. **接口请求频率限制是多少？**
   为防止滥用，系统对管理员接口设置了每分钟100次的请求限制。超过限制将返回429错误码。 