# 夹心 Room — 琴房预约系统

> 一个为高校学生设计的琴房在线预约平台，采用 **Figma × Apple** 融合设计风格，支持即时预约、先到先得，前后端完全重构。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Zustand · ky |
| 后端 | Go (Gin) · GORM · JWT · 分布式限流 |
| 数据库 | MySQL 8.0 · Redis 7 |
| 设计 | Figma × Apple 融合风格 · shadcn/ui · CSS Variables 设计令牌 |

---

## 项目结构

```
Piano-room/
├── jiaxin-room-api/               # Go 后端
│   ├── cmd/server/main.go         # 入口
│   ├── configs/config.yaml        # 配置文件
│   ├── internal/
│   │   ├── config/                # 配置加载
│   │   ├── middleware/            # JWT · CORS · 限流 · 日志
│   │   ├── model/                 # 数据模型 & DTO/VO
│   │   ├── handler/               # HTTP 处理器（12 个模块）
│   │   ├── service/               # 业务逻辑（11 个模块）
│   │   ├── repository/            # 数据库初始化
│   │   └── cache/                 # Redis 缓存 & 分布式锁
│   └── pkg/                       # JWT · 统一响应
├── jiaxin-room-next/              # Next.js 前端
│   ├── src/
│   │   ├── app/                   # 页面路由（App Router）
│   │   │   ├── (front)/           # 前台页面
│   │   │   ├── (auth)/            # 登录/注册/忘记密码
│   │   │   └── (admin)/           # 管理后台
│   │   ├── components/            # UI · 布局 · 动画组件
│   │   ├── lib/                   # API 客户端 · 工具函数
│   │   ├── stores/                # Zustand 状态管理
│   │   ├── hooks/                 # 自定义 Hook
│   │   └── styles/                # 全局样式 & 设计令牌
│   └── public/                    # 静态资源 & PWA
├── db/
│   └── classroombookingdb.sql     # 数据库初始化脚本
└── docs/
    ├── API.md                     # 接口文档
    └── IMAGE_ASSETS_LIST.md       # 图片素材清单
```

---

## 环境要求

| 工具 | 版本要求 |
|------|----------|
| Go | 1.23+ |
| Node.js | 18+ |
| pnpm | 9+ |
| MySQL | 8.0+ |
| Redis | 7+ |

---

## 快速启动

### 1. 数据库初始化

```sql
CREATE DATABASE classroombookingdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE classroombookingdb;
SOURCE db/classroombookingdb.sql;
```

### 2. 启动 Redis

```bash
redis-server
```

### 3. 后端启动

```bash
cd jiaxin-room-api

# 修改配置（数据库密码、Redis 地址等）
# 编辑 configs/config.yaml

# 安装依赖并启动
go mod tidy
go run cmd/server/main.go
```

后端默认监听 **http://localhost:8099**

### 4. 前端启动

```bash
cd jiaxin-room-next

# 安装依赖
pnpm install

# 开发模式
pnpm dev
```

前端默认访问 **http://localhost:3000**

---

## 默认账号（密码均为 `123456`）

| 用户名 | 类型 | 说明 |
|--------|------|------|
| student1 | 学生 | 测试学生账号 |
| student2 | 学生 | 测试学生账号 |
| admin1 | 管理员 | 管理后台账号 |
| superadmin | 超级管理员 | 最高权限 |

---

## 功能特性

### 学生端
- **即时预约** — 选择琴房和时段，提交即锁定，无需审核
- **时段查询** — 日历 + 方块展示可用时段，实时刷新
- **我的预约** — 历史记录查看、取消未开始的预约
- **个人中心** — 累计练琴时长、违约统计
- **PWA 支持** — 可安装至手机桌面，原生 App 体验

### 管理端
- **预约管理** — 查看全部预约记录，支持管理员取消
- **用户管理** — 违约次数/封禁状态管理
- **琴房管理** — 琴房信息维护、状态切换
- **惩罚规则** — 阶梯封禁配置
- **数据统计** — 预约趋势、热门时段、使用率报表
- **系统设置** — 预约规则、时段配置

---

## 安全机制

- **JWT 认证** — 所有 API 请求需携带 Token
- **RBAC 权限** — 管理员/超级管理员路由组分离
- **分布式限流** — Redis 滑动窗口防暴力请求
- **分布式锁** — Redis 防止预约并发超卖
- **文件上传白名单** — 仅允许图片格式

---

## 违约机制

| 违约次数 | 默认处理 |
|----------|----------|
| 第 1 次 | 系统警告 |
| 第 2 次 | 封禁 7 天 |
| 第 3 次及以上 | 封禁 30 天 |

---

## 接口文档

详见 [docs/API.md](docs/API.md)

## 图片素材清单

详见 [docs/IMAGE_ASSETS_LIST.md](docs/IMAGE_ASSETS_LIST.md)
