# 皮埃诺预约系统

> 一个为高校学生设计的个人练琴室在线预约平台，采用图书馆式即时预约机制：提交即生效，先到先得，高并发安全。

<!-- Author: Jesse（刘家鑫） Contact: 13709406630 -->

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | Vue 3 · Vite · Element Plus · Pinia · TypeScript |
| 后端 | Spring Boot 3 · MyBatis · JWT |
| 数据库 | MySQL 8.0 |
| 反向代理 | Nginx 1.28.0 |

---

## 项目结构

```
finish3.0/
├── piano-room-vue3/            # Vue 3 前端项目
│   ├── src/
│   │   ├── api/                # Axios 请求封装
│   │   ├── composables/        # useSound 等组合式函数
│   │   ├── layouts/            # FrontLayout / AdminLayout
│   │   ├── stores/             # Pinia (auth / settings)
│   │   ├── views/              # 页面组件
│   │   └── main.ts
│   └── vite.config.ts
├── music-booking-system/       # Spring Boot 后端项目
│   └── src/main/java/com/bookingsystem/
│       ├── controller/         # REST 控制器
│       ├── service/            # 业务逻辑
│       ├── mapper/             # MyBatis Mapper
│       └── pojo/               # 实体类
├── db/
│   └── classroombookingdb.sql  # 数据库初始化脚本
├── nginx-1.28.0/
│   └── conf/nginx.conf         # Nginx 配置
└── docs/
    └── API.md                  # 接口文档
```

---

## 快速启动

### 1. 数据库初始化

```sql
-- 在 MySQL 8.0 中执行
CREATE DATABASE classroombookingdb CHARACTER SET utf8mb4;
USE classroombookingdb;
SOURCE db/classroombookingdb.sql;
```

### 2. 后端配置与启动

修改 `music-booking-system/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/classroombookingdb?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: 你的数据库密码
```

编译并启动：

```bash
cd music-booking-system
mvn package -DskipTests
java -jar target/classroom-booking-system-0.0.1-SNAPSHOT.jar
```

后端默认监听 **http://localhost:8099**

### 3. 前端构建

```bash
cd piano-room-vue3
npm install
npm run build
# 构建产物输出到 dist/
```

### 4. Nginx 启动

```bash
# 修改 nginx-1.28.0/conf/nginx.conf 中的 root 路径指向前端 dist/
cd nginx-1.28.0
./nginx          # Linux/Mac
nginx.exe        # Windows
```

前端默认监听 **http://localhost:82**

---

## 默认账号（密码均为 `123456`）

| 用户名 | 类型 | 说明 |
|--------|------|------|
| student1 | 学生 | 测试学生账号 |
| student2 | 学生 | 测试学生账号 |
| admin1 | 管理员 | 管理后台账号 |
| superadmin | 超级管理员 | 最高权限账号 |

---

## 功能特性

### 学生端

- **图书馆式即时预约**：选择琴房和时段，提交即锁定，无需审核
- **时段查询**：以日历+方块形式展示当日/次日可用时段，实时刷新
- **我的预约**：查看历史预约，支持取消尚未开始的预约
- **个人中心**：累计练琴时长、违约次数、封禁状态统计
- **提前预约规则**：当日时段随时可预，次日时段在每日零点后开放

### 管理端

- **预约管理**：查看全部预约记录，支持管理员介入取消
- **用户管理**：查看违约次数/封禁状态，支持手动解封
- **惩罚规则配置**：阶梯封禁（第1次警告，第2次封N天，第3次封N天），管理员可在后台调整
- **数据统计**：预约趋势、热门时段、练琴时长报表
- **系统设置**：系统名称、预约时段规则（开始时间/结束时间/时长/开放时间）

### 违约机制

| 违约次数 | 默认处理 |
|----------|----------|
| 第 1 次 | 系统警告 |
| 第 2 次 | 封禁 7 天 |
| 第 3 次及以上 | 封禁 30 天 |

> 预约后超过开始时间 10 分钟未签到，系统定时任务自动标记违约。

---

## 并发安全

预约采用双重保障防止超卖：
1. `SELECT ... FOR UPDATE` 悲观锁，同一琴房同一时段只允许一笔成功
2. 应用层冲突检测，失败时立即返回"时段已被抢占"提示

---

## 接口文档

详见 [docs/API.md](docs/API.md)

---

## 作者

**Jesse（刘家鑫）**  
联系方式：13709406630
