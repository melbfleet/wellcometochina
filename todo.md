# Wayseek 中国之旅 - 全站迁移与 CMS 构建

## 阶段 1：源仓库分析与迁移规划

- [ ] 克隆并分析源仓库 wayseekchinatravel 的目录结构
- [ ] 识别所有前台页面组件与资源
- [ ] 列出源仓库中的所有设计资源（图片、字体、样式）
- [ ] 规划组件迁移映射表

## 阶段 2：数据库 Schema 设计与迁移

- [x] 设计 team_members 表（已有基础，需扩展）
- [x] 设计 cities 表（目的地信息）
- [x] 设计 experiences 表（体验信息）
- [x] 设计 itineraries 表（行程信息）
- [x] 设计 stories 表（故事内容）
- [x] 设计 videos 表（视频资源）
- [x] 设计 tags 表（标签系统）
- [x] 生成 Drizzle 迁移文件
- [x] 执行数据库迁移

## 阶段 3：后端 tRPC 路由与数据库查询

- [x] 实现 teamMembers 路由（list、get、create、update、delete）
- [x] 实现 cities 路由（list、get、create、update、delete）
- [x] 实现 experiences 路由（list、get、create、update、delete）
- [x] 实现 itineraries 路由（list、get、create、update、delete）
- [x] 实现 stories 路由（list、get、create、update、delete）
- [x] 实现 videos 路由（list、get、create、update、delete）
- [x] 实现 tags 路由（list、get、create、update、delete）
- [x] 为所有路由添加权限检查（后台操作需管理员权限）

## 阶段 4：前台页面迁移与设计还原

- [x] 迁移首页 (Home.tsx) - 保留原有设计风格
  - [x] 深色导航栏
  - [x] 全屏 Banner
  - [x] 证言轮播
  - [x] 目的地卡片（已链接到数据库）
  - [x] 行程展示（已链接到数据库）
  - [x] 媒体库
- [ ] 创建城市详情页面 (CityDetail.tsx)
- [ ] 创建体验详情页面 (ExperienceDetail.tsx)
- [ ] 迁移目的地页面 (Destinations.tsx)
- [ ] 迁移体验页面 (Experiences.tsx)
- [ ] 迁移关于我们页面 (About.tsx)
- [ ] 迁移 Our Team 页面 (OurTeam.tsx) - 从数据库动态读取
- [ ] 迁移故事页面 (Stories.tsx)
- [ ] 迁移媒体库页面 (MediaLibrary.tsx)
- [ ] 迁移导航组件 (Navigation.tsx)
- [ ] 迁移页脚组件 (Footer.tsx)
- [ ] 迁移所有样式和主题配置

## 阶段 5：后台 CMS 管理界面

- [x] 创建后台布局框架 (AdminLayout.tsx)
- [x] 创建 Itineraries 管理页面（包含完整的新增/编辑表单）
- [ ] 创建 Team Members 管理页面
- [ ] 创建 Cities 管理页面
- [ ] 创建 Experiences 管理页面
- [ ] 创建 Stories 管理页面
- [ ] 创建 Videos 管理页面
- [ ] 创建 Tags 管理页面
- [ ] 实现列表视图、编辑表单、删除确认等通用 UI 模式

## 阶段 6：文件上传与媒体存储

- [ ] 配置 Manus Storage 集成
- [ ] 实现头像上传功能
- [ ] 实现图片上传功能
- [ ] 实现视频上传功能
- [ ] 创建文件上传组件
- [ ] 集成上传进度显示

## 阶段 7：认证与权限控制

- [ ] 配置管理员身份验证
- [ ] 实现后台登录页面
- [ ] 实现权限检查中间件
- [ ] 为所有后台路由添加权限保护
- [ ] 实现会话管理

## 阶段 8：测试、优化与首次部署

- [ ] 运行类型检查 (pnpm check)
- [ ] 运行单元测试 (pnpm test)
- [ ] 运行生产构建 (pnpm build)
- [ ] 验证前台页面正常显示
- [ ] 验证后台 CMS 功能正常
- [ ] 验证文件上传功能
- [ ] 验证权限控制
- [ ] 首次部署到 Manus

## 数据库表设计参考

### team_members
- id, name, role, bio1, bio2, quote, image, specialty, storyTitle, storySubtitle, storyText, storyImage, storyImage2, sortOrder, createdAt, updatedAt

### cities
- id, name, description, image, highlights, sortOrder, createdAt, updatedAt

### experiences
- id, name, description, image, duration, price, highlights, sortOrder, createdAt, updatedAt

### itineraries
- id, name, description, days, highlights, image, sortOrder, createdAt, updatedAt

### stories
- id, title, content, author, image, publishedAt, createdAt, updatedAt

### videos
- id, title, description, url, thumbnail, sortOrder, createdAt, updatedAt

### tags
- id, name, type, createdAt, updatedAt

## 主页管理后台模块

- [x] 数据库：新增 homepage_hero（Banner 设置）表
- [x] 数据库：新增 homepage_intro（简介板块）表
- [x] 数据库：新增 homepage_stories（Stories 卡片）表
- [x] 数据库：新增 homepage_sponsors（赞助商 Logo）表
- [x] 后端：homepage router（get/update hero、intro、stories CRUD、sponsors CRUD）
- [x] 后台：AdminHomepage.tsx 管理页面（四个板块的编辑界面）
- [x] 后台：注册 /admin/homepage 路由和导航
- [x] 前台：主页 Hero Banner 从数据库读取（保留现有 media assets 逻辑）
- [x] 前台：主页简介板块从数据库读取（LuxuryTravelExperts.tsx）
- [x] 前台：CarouselSection Stories 从数据库读取
- [x] 前台：PartnerLogos 赞助商从数据库读取


## 当前会话任务

- [x] 验证 Sponsor Logos 上传功能是否正常（已改用 assetType: "general"）
- [x] 对齐 ItineraryDetail.tsx 排版与 CityPage.tsx 样式（字体粗细、字间距、响应式尺寸）
- [ ] 完成 AdminItineraries.tsx 多图片上传功能测试
- [ ] 完成 AdminHomepage.tsx Sponsor Logos 管理功能测试
- [ ] 完成权限检查与文件上传权限验证
