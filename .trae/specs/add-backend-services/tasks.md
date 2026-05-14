# Tasks

- [x] Task 1: 后端项目初始化与基础框架
  - [x] SubTask 1.1: 创建 Spring Boot 项目结构（pom.xml、主类、包结构）
  - [x] SubTask 1.2: 配置 application.yml（MySQL、Redis、文件存储、JWT 密钥）
  - [x] SubTask 1.3: 实现统一响应封装（Result<T>）和全局异常处理
  - [x] SubTask 1.4: 实现 JWT 工具类和认证过滤器
  - [x] SubTask 1.5: 配置 Spring Security（JWT 认证 + 白名单路径）

- [x] Task 2: 数据库设计与初始化
  - [x] SubTask 2.1: 创建 schema.sql（7张核心表 + 索引）
  - [x] SubTask 2.2: 插入初始关卡数据（10个关卡 + 差异点坐标，与前端Canvas图片一致）
  - [x] SubTask 2.3: 插入初始主题和章节数据
  - [x] SubTask 2.4: 配置 MyBatis Plus 和数据源

- [x] Task 3: 认证模块（auth）
  - [x] SubTask 3.1: Player 实体类和 Mapper
  - [x] SubTask 3.2: 注册接口 POST /api/auth/register
  - [x] SubTask 3.3: 登录接口 POST /api/auth/login（返回 JWT Token）
  - [x] SubTask 3.4: Token 刷新接口 POST /api/auth/refresh

- [x] Task 4: 关卡模块（level）
  - [x] SubTask 4.1: GameLevel、LevelDifference、LevelTheme、LevelChapter 实体类和 Mapper
  - [x] SubTask 4.2: 获取章节列表 GET /api/adventure/chapters
  - [x] SubTask 4.3: 获取章节下关卡 GET /api/adventure/chapters/{id}/levels
  - [x] SubTask 4.4: 获取关卡详情 GET /api/adventure/levels/{id}（返回图片URL、时间限制，不返回差异点坐标）
  - [x] SubTask 4.5: 关卡配置 Redis 缓存

- [x] Task 5: 闯关模式核心 - 点击判定后端验证
  - [x] SubTask 5.1: 点击判定接口 POST /api/adventure/levels/{id}/check（接收clickX/clickY，返回命中结果）
  - [x] SubTask 5.2: 判定算法实现：sqrt((clickX-diffX)² + (clickY-diffY)²) ≤ radius × 1.2
  - [x] SubTask 5.3: 计分逻辑（基础分+用时奖励+连击加成-错误惩罚-提示扣分）
  - [x] SubTask 5.4: 游戏会话管理（Redis 存储当前游戏状态：已找到差异、连击数、分数）
  - [x] SubTask 5.5: 提交通关结果 POST /api/adventure/levels/{id}/complete
  - [x] SubTask 5.6: 获取玩家进度 GET /api/adventure/progress

- [x] Task 6: 玩家模块（player）
  - [x] SubTask 6.1: PlayerLevelProgress 实体类和 Mapper
  - [x] SubTask 6.2: 获取个人信息 GET /api/player/profile
  - [x] SubTask 6.3: 更新个人信息 PUT /api/player/profile
  - [x] SubTask 6.4: 获取玩家统计 GET /api/player/stats
  - [x] SubTask 6.5: 玩家信息 Redis 缓存

- [x] Task 7: 文件服务模块（file）
  - [x] SubTask 7.1: 本地文件上传/存储服务
  - [x] SubTask 7.2: 文件访问接口 GET /api/files/{filename}
  - [x] SubTask 7.3: 初始关卡图片生成并上传（从 Canvas 生成后保存为文件）

- [x] Task 8: WebSocket 实时通信（竞速模式）
  - [x] SubTask 8.1: WebSocket + STOMP 配置
  - [x] SubTask 8.2: 匹配服务（ELO + 扩大范围算法，Redis Sorted Set 管理队列）
  - [x] SubTask 8.3: 房间管理服务（创建/加入/离开房间，Redis 存储房间状态）
  - [x] SubTask 8.4: 对战逻辑服务（差异点判定、分数计算、房间状态广播）
  - [x] SubTask 8.5: 房间消息广播（每100ms广播房间状态）
  - [x] SubTask 8.6: 异步挑战接口 POST /api/versus/async/start 和 POST /api/versus/async/submit
  - [x] SubTask 8.7: 排行榜服务 GET /api/versus/leaderboard/{levelId}
  - [x] SubTask 8.8: ELO 段位信息 GET /api/versus/rank

- [x] Task 9: 事件采集模块（event）
  - [x] SubTask 9.1: 内存事件队列（BlockingQueue）
  - [x] SubTask 9.2: 异步消费线程（批量写入 game_event 表）
  - [x] SubTask 9.3: 事件发布接口

- [x] Task 10: 管理后台 API（admin）
  - [x] SubTask 10.1: 数据看板 GET /api/admin/dashboard
  - [x] SubTask 10.2: 在线人数 GET /api/admin/online-count
  - [x] SubTask 10.3: 关卡 CRUD（列表/创建/更新/发布/下线）
  - [x] SubTask 10.4: 差异点批量设置 POST /api/admin/levels/{id}/diffs
  - [x] SubTask 10.5: 玩家管理（列表/封禁）
  - [x] SubTask 10.6: 统计接口（留存率/关卡漏斗/收入统计）

- [x] Task 11: Vue 3 管理后台前端
  - [x] SubTask 11.1: Vue 3 + Element Plus + Vue Router 项目初始化
  - [x] SubTask 11.2: 登录页和管理后台布局框架
  - [x] SubTask 11.3: 数据看板页面（ECharts 图表）
  - [x] SubTask 11.4: 关卡管理页面（列表/创建/编辑）
  - [x] SubTask 11.5: 差异点可视化标记工具（图片上拖拽标记圆形区域）
  - [x] SubTask 11.6: 玩家管理页面
  - [x] SubTask 11.7: 系统配置页面

- [x] Task 12: 前端游戏改造
  - [x] SubTask 12.1: 新增 API 通信层（替代 storage.js 的 localStorage 操作）
  - [x] SubTask 12.2: 改造登录/注册流程（调用后端 API + JWT Token 管理）
  - [x] SubTask 12.3: 改造关卡加载（从后端 API 获取关卡详情和图片URL）
  - [x] SubTask 12.4: 改造点击判定（发送坐标到后端，根据返回结果渲染动画）
  - [x] SubTask 12.5: 改造进度保存（调用后端 API 而非 localStorage）
  - [x] SubTask 12.6: 改造竞速模式（WebSocket 通信替代模拟 AI）
  - [x] SubTask 12.7: 改造排行榜（从后端 API 获取）
  - [x] SubTask 12.8: 修复差异点坐标与视觉位置不匹配的问题

- [x] Task 13: 集成测试与部署配置
  - [x] SubTask 13.1: 后端 API 全流程测试
  - [x] SubTask 13.2: WebSocket 对战流程测试
  - [x] SubTask 13.3: 前后端联调测试
  - [x] SubTask 13.4: Docker Compose 部署配置（MySQL + Redis + 后端 + Nginx）

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1, Task 2
- Task 4 depends on Task 1, Task 2
- Task 5 depends on Task 4
- Task 6 depends on Task 3
- Task 7 depends on Task 1
- Task 8 depends on Task 3, Task 4
- Task 9 depends on Task 1
- Task 10 depends on Task 2, Task 6
- Task 11 depends on Task 10
- Task 12 depends on Task 3, Task 4, Task 5, Task 8
- Task 13 depends on all other tasks
