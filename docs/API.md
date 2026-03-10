# 皮埃诺预约系统 · 接口文档

<!-- Author: Jesse（刘家鑫） Contact: 13709406630 -->

**Base URL**: `http://localhost:8099`

**鉴权方式**: JWT Token，需在请求头携带 `Authorization: Bearer <token>`

**统一响应格式**:
```json
{
  "code": 1,        // 1=成功，0=失败
  "msg": "success",
  "data": {}        // 具体数据
}
```

---

## 目录

1. [用户模块 `/user`](#1-用户模块)
2. [琴房模块 `/room`](#2-琴房模块)
3. [预约模块 `/reservations`](#3-预约模块)
4. [系统配置 `/system`](#4-系统配置)
5. [统计报表 `/reports`](#5-统计报表)
6. [维修管理 `/maintenance`](#6-维修管理)
7. [管理员管理 `/admin`](#7-管理员管理)

---

## 1. 用户模块

### 1.1 获取验证码

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/user/captcha` |
| 鉴权 | 不需要 |

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | Integer | 是 | `0`=登录验证码，`1`=注册验证码 |

**响应 data**: Base64 图片字符串 `data:image/png;base64,...`

---

### 1.2 用户登录

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/user/login` |
| 鉴权 | 不需要 |

**Request Body**:
```json
{
  "username": "student1",
  "password": "e10adc3949ba59abbe56e057f20f883e",
  "captcha": "ab3k",
  "rememberMe": false
}
```

**响应 data**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userType": "student",
  "realName": "张三"
}
```

---

### 1.3 用户注册

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/user/register` |
| 鉴权 | 不需要 |

**Request Body**:
```json
{
  "username": "newuser",
  "password": "e10adc3949ba59abbe56e057f20f883e",
  "realName": "新用户",
  "email": "user@example.com",
  "captcha": "ab3k",
  "emailCode": "123456"
}
```

---

### 1.4 发送邮件验证码

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/user/email/code` |
| 鉴权 | 不需要 |

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | String | 是 | 目标邮箱 |
| type | Integer | 是 | `0`=注册，`1`=找回密码，`2`=修改密码 |

---

### 1.5 获取用户列表（管理端）

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/user/list` |
| 鉴权 | 需要（管理员） |

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | Integer | 否 | 页码（默认1） |
| pageSize | Integer | 否 | 每页条数（默认10） |
| userType | String | 否 | 用户类型筛选 |
| status | Integer | 否 | `1`=正常，`0`=禁用 |
| usernameOrRealNameOrStudentId | String | 否 | 关键词搜索 |

**响应 data**:
```json
{
  "total": 100,
  "records": [
    {
      "id": 1,
      "username": "student1",
      "realName": "张三",
      "studentId": "20230001",
      "userType": "student",
      "status": 1,
      "violationCount": 0,
      "banUntil": null,
      "lastLoginTime": "2025-01-01T10:00:00"
    }
  ]
}
```

---

### 1.6 根据 ID 获取用户信息

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/user/{id}` |
| 鉴权 | 需要 |

**Path 参数**: `id` — 用户 ID

---

### 1.7 获取用户预约统计（个人中心）

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/user/{id}/reservation-stats` |
| 鉴权 | 需要 |

**响应 data**:
```json
{
  "totalReservations": 10,
  "completedReservations": 8,
  "cancelledReservations": 1,
  "violationCount": 1,
  "totalPracticeMinutes": 480
}
```

---

### 1.8 更新用户信息

| 项目 | 内容 |
|------|------|
| Method | `PUT` |
| URL | `/user/info` |
| 鉴权 | 需要 |

**Request Body**: User 对象（含 id，只更新非空字段）

---

### 1.9 重置用户密码

| 项目 | 内容 |
|------|------|
| Method | `PUT` |
| URL | `/user/password` |
| 鉴权 | 需要 |

**Request Body**:
```json
{
  "userId": 1,
  "newPassword": "e10adc3949ba59abbe56e057f20f883e"
}
```

---

### 1.10 设置用户账号状态

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/user/status` |
| 鉴权 | 需要（管理员） |

**Request Body**:
```json
{
  "userId": 1,
  "status": 0
}
```

---

### 1.11 添加用户（管理员）

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/user/add` |
| 鉴权 | 需要（管理员） |

---

### 1.12 批量删除用户

| 项目 | 内容 |
|------|------|
| Method | `DELETE` |
| URL | `/user` |
| 鉴权 | 需要（管理员） |

**Query 参数**: `ids` — 用户 ID 数组，例如 `?ids=1&ids=2`

---

## 2. 琴房模块

### 2.1 查询琴房列表（管理端分页）

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/room` |
| 鉴权 | 需要 |

**Query 参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| page | Integer | 页码 |
| pageSize | Integer | 每页条数 |
| name | String | 琴房名称关键词 |
| status | Integer | `1`=可用，`0`=维护中 |
| roomTypeId | Long | 琴房类型 ID |

---

### 2.2 前台可用琴房搜索

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/room/search` |
| 鉴权 | 不需要 |

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | String | 否 | 查询日期 `yyyy-MM-dd` |
| pageNum | Integer | 否 | 页码（默认1） |
| pageSize | Integer | 否 | 每页条数（默认12） |

**响应 data**:
```json
{
  "total": 8,
  "records": [
    {
      "id": 1,
      "roomNumber": "P101",
      "name": "101号立式钢琴室",
      "floor": 1,
      "capacity": 1,
      "roomTypeName": "立式钢琴室",
      "status": 1,
      "description": "..."
    }
  ]
}
```

---

### 2.3 根据 ID 获取琴房详情

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/room/{id}` |
| 鉴权 | 不需要 |

---

### 2.4 今日热门琴房

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/room/hot-today` |
| 鉴权 | 不需要 |

**响应 data**: `HotRoomVO[]` — 含琴房基本信息和今日预约数量

---

### 2.5 新增琴房

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/room` |
| 鉴权 | 需要（管理员） |

---

### 2.6 修改琴房信息

| 项目 | 内容 |
|------|------|
| Method | `PUT` |
| URL | `/room` |
| 鉴权 | 需要（管理员） |

---

### 2.7 删除琴房

| 项目 | 内容 |
|------|------|
| Method | `DELETE` |
| URL | `/room/{id}` |
| 鉴权 | 需要（管理员） |

---

### 2.8 新增维护记录

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/room/maintenance` |
| 鉴权 | 需要（管理员） |

**Request Body**:
```json
{
  "roomId": 1,
  "startTime": "2025-06-01T08:00:00",
  "endTime": "2025-06-01T18:00:00",
  "reason": "年度保养",
  "maintenanceType": "定期维护"
}
```

---

### 2.9 查询/更新维护记录

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/room/maintenance/{roomId}` |
| 鉴权 | 需要 |

| Method | URL | 说明 |
|--------|-----|------|
| `POST` | `/room/maintenance/update-or-insert` | 新增或更新维护记录 |

---

## 3. 预约模块

### 3.1 图书馆式快速预约（核心接口）

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/reservations/quick` |
| 鉴权 | **需要**（从 JWT 自动获取用户身份） |

**Request Body**:
```json
{
  "roomId": 1,
  "startTime": "2025-06-01T08:00:00",
  "endTime": "2025-06-01T10:00:00"
}
```

**响应 data**: 预约成功后的 Reservation 对象

**说明**: 采用 `SELECT ... FOR UPDATE` 悲观锁防止并发超卖，同一时段同一琴房只允许一笔成功，抢占失败返回错误信息。

---

### 3.2 查询预约列表

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/reservations/list` |
| 鉴权 | 不需要 |

**Query 参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| page | Integer | 页码 |
| pageSize | Integer | 每页条数 |
| userId | Long | 用户 ID 筛选 |
| roomId | Long | 琴房 ID 筛选 |
| status | String | `approved` / `cancelled` / `completed` / `occupied` |
| startTime | String | 开始时间筛选 |
| endTime | String | 结束时间筛选 |

---

### 3.3 查询可用时段

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/reservations/availability` |
| 鉴权 | 不需要 |

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roomId | Long | 是 | 琴房 ID |
| date | String | 是 | 查询日期 `yyyy-MM-dd` |

**响应 data**: `TimeSlot[]`
```json
[
  {
    "startTime": "2025-06-01T08:00:00",
    "endTime": "2025-06-01T10:00:00",
    "available": true
  }
]
```

---

### 3.4 取消预约

| 项目 | 内容 |
|------|------|
| Method | `PUT` |
| URL | `/reservations/{id}/cancel` |
| 鉴权 | 需要 |

**Request Body**:
```json
{
  "remarks": "临时有事"
}
```

---

### 3.5 签到

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/reservations/{id}/sign-in` |
| 鉴权 | 需要 |

---

### 3.6 签退

| 项目 | 内容 |
|------|------|
| Method | `POST` |
| URL | `/reservations/{id}/sign-out` |
| 鉴权 | 需要 |

---

### 3.7 根据 ID 获取预约详情

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/reservations/{id}` |
| 鉴权 | 需要 |

---

### 3.8 获取用户预约统计

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/reservations/userStatistics` |
| 鉴权 | 需要 |

**Query 参数**: `userId` — 用户 ID

---

### 3.9 练琴时长管理列表

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/reservations/practiceduration` |
| 鉴权 | 需要（管理员） |

---

## 4. 系统配置

### 4.1 获取系统基本配置

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/system/settings/basic` |
| 鉴权 | 不需要 |

**响应 data**:
```json
{
  "systemName": "皮埃诺预约系统",
  "description": "学生个人练琴室在线预约平台",
  "primaryColor": "#ff69b4",
  "slotStartHour": 8,
  "slotEndHour": 22,
  "slotDurationMinutes": 120,
  "bookingResetHour": 0
}
```

---

### 4.2 更新系统配置

| 项目 | 内容 |
|------|------|
| Method | `PUT` |
| URL | `/system` |
| 鉴权 | 需要（管理员） |

---

### 4.3 获取惩罚规则列表

| 项目 | 内容 |
|------|------|
| Method | `GET` |
| URL | `/system/penalty-rules` |
| 鉴权 | 需要（管理员） |

**响应 data**:
```json
[
  { "id": 1, "violationCount": 1, "banDays": 0, "description": "第1次违约：警告" },
  { "id": 2, "violationCount": 2, "banDays": 7, "description": "第2次违约：封禁7天" },
  { "id": 3, "violationCount": 3, "banDays": 30, "description": "第3次及以上：封禁30天" }
]
```

---

### 4.4 修改惩罚规则

| 项目 | 内容 |
|------|------|
| Method | `PUT` |
| URL | `/system/penalty-rules/{id}` |
| 鉴权 | 需要（管理员） |

**Request Body**:
```json
{
  "banDays": 14,
  "description": "第2次违约：封禁14天"
}
```

---

### 4.5 解除用户封禁

| 项目 | 内容 |
|------|------|
| Method | `DELETE` |
| URL | `/system/penalty-rules/ban/{userId}` |
| 鉴权 | 需要（管理员） |

---

## 5. 统计报表

> 所有报表接口均需管理员鉴权（`classroomUsageRate` 和 `classroomDistribution` 除外）

| Method | URL | 说明 | 参数 |
|--------|-----|------|------|
| `GET` | `/reports/countReservations` | 预约总数统计 | `start`, `end`（日期） |
| `GET` | `/reports/approvalRate` | 预约完成率 | `start`, `end` |
| `GET` | `/reports/activeUsers` | 活跃用户数 | `start`, `end` |
| `GET` | `/reports/registeredUsers` | 注册用户总数 | 无 |
| `GET` | `/reports/pendingReservations` | 当前进行中预约数 | 无 |
| `GET` | `/reports/classroomUsageRate` | 琴房使用率 | `start`, `end` |
| `GET` | `/reports/classroomDistribution` | 琴房类型分布 | 无 |
| `GET` | `/reports/reservationStatusDistribution` | 预约状态分布 | 无 |
| `GET` | `/reports/weekly` | 本周每日预约趋势 | 无 |
| `GET` | `/reports/time-slot-report` | 热门时段分析 | `start`, `end`（`yyyy-MM-dd`） |
| `GET` | `/reports/usage` | 琴房使用情况汇总 | `start`, `end`（ISO DateTime） |
| `GET` | `/reports/typeusage` | 各类型琴房使用统计 | `start`, `end`（ISO DateTime） |
| `GET` | `/reports/bookingOverview` | 今日预约概览（已预约数/可用数） | 无 |
| `GET` | `/reports/totalPracticeHours` | 今日总练琴时长（分钟） | 无 |

---

## 6. 维修管理

| Method | URL | 鉴权 | 说明 |
|--------|-----|------|------|
| `GET` | `/maintenance/list` | 需要（管理员） | 获取维修记录（支持分页筛选） |
| `DELETE` | `/maintenance/batch` | 需要（管理员） | 批量删除维修记录，Body：`[1,2,3]` |
| `POST` | `/maintenance/updateStatus` | 需要（管理员） | 更新维修状态，Param：`roomId`, `status` |

---

## 7. 管理员管理

> 路径 `/admin`，仅超级管理员可访问

| Method | URL | 说明 |
|--------|-----|------|
| `GET` | `/admin/list` | 查询管理员列表 |
| `POST` | `/admin/add` | 添加管理员 |
| `DELETE` | `/admin/{id}` | 删除管理员 |

---

## 状态说明

### 预约状态（`reservations.status`）

| 值 | 含义 |
|----|------|
| `approved` | 已预约（生效中） |
| `cancelled` | 已取消 |
| `completed` | 已完成（正常签退） |
| `occupied` | 违约（超时未签到被系统标记） |

### 用户状态（`users.status`）

| 值 | 含义 |
|----|------|
| `1` | 正常 |
| `0` | 禁用 |

---

*接口文档版本：1.0 · 作者：Jesse（刘家鑫）· 联系：13709406630*
