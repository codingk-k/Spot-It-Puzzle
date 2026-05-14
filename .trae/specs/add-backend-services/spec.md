# 补充后端服务与全栈改造 Spec

## Why
当前找不同游戏为纯前端实现，点击判定、数据存储均在前端完成，存在安全风险（差异点坐标暴露、可作弊）且无法支持真正的多人实时对战。需要按照设计文档补充 Java Spring Boot 后端服务、MySQL 数据库、Redis 缓存、Vue 3 管理后台，并将核心判定逻辑迁移至后端。

## What Changes
- 新增 Java Spring Boot 后端服务（多模块：auth、level、adventure、versus、player、statistics、admin、file、event）
- 新增 MySQL 数据库（7张核心表：player、game_level、level_difference、player_level_progress、battle_record、game_event、level_theme、level_chapter）
- 新增 Redis 缓存层（会话管理、排行榜、匹配队列、在线统计）
- 新增 WebSocket + STOMP 实时通信（竞速模式房间同步）
- 新增 Vue 3 + Element Plus 管理后台（关卡管理、差异点标记工具、玩家管理、数据看板）
- **BREAKING** 改造前端点击判定：从本地判定改为调用后端 API 验证
- **BREAKING** 改造前端数据存储：从 localStorage 改为后端 API + JWT 认证
- 修复前端差异点坐标与视觉位置不匹配的问题（后端统一管理差异点坐标）

## Impact
- Affected specs: build-spot-the-difference-game（前端需大幅改造）
- Affected code:
  - `/workspace/spot-the-difference/js/app.js` — 点击判定改为 API 调用，数据存储改为后端
  - `/workspace/spot-the-difference/js/storage.js` — 改为 API 通信层
  - `/workspace/spot-the-difference/js/levels.js` — 关卡数据从后端加载
  - 新增 `/workspace/spot-the-difference-server/` — Java 后端项目
  - 新增 `/workspace/spot-the-difference-admin/` — Vue 3 管理后台

## ADDED Requirements

### Requirement: Java Spring Boot 后端服务
系统 SHALL 提供 Java Spring Boot 3.x + Java 17 后端服务，包含以下模块：
- auth 模块：用户注册/登录/JWT 认证/Token 刷新
- level 模块：关卡 CRUD、差异点管理、图片资源分发
- adventure 模块：闯关模式逻辑、进度保存、星级计算
- versus 模块：实时匹配、房间管理、对战同步、ELO 段位
- player 模块：玩家信息管理、统计
- statistics 模块：数据采集、在线统计
- admin 模块：管理后台 API
- file 模块：图片上传/存储/访问
- event 模块：游戏事件采集（内存队列 + 异步消费）

#### Scenario: 后端服务启动
- **WHEN** 执行 `mvn spring-boot:run`
- **THEN** 服务在 8080 端口启动，所有 REST API 和 WebSocket 端点可用

### Requirement: 点击判定后端验证
系统 SHALL 将点击判定逻辑从前端迁移到后端：
- 前端发送点击坐标 (levelId, clickX, clickY) 到后端 API
- 后端根据数据库中存储的差异点坐标进行判定：`sqrt((clickX - diffX)² + (clickY - diffY)²) ≤ radius × 1.2`
- 后端返回判定结果（命中/未命中）、命中的差异点信息、当前分数
- 前端不再持有差异点坐标数据，仅根据后端返回结果渲染 UI

#### Scenario: 正确点击判定
- **WHEN** 玩家点击位置在差异点容错范围内
- **THEN** 后端返回 `{ hit: true, diffIndex: 2, description: "..." , score: 130, combo: 3 }`

#### Scenario: 错误点击判定
- **WHEN** 玩家点击位置不在任何差异点容错范围内
- **THEN** 后端返回 `{ hit: false, penalty: -20, timePenalty: -3, combo: 0 }`

### Requirement: MySQL 数据库
系统 SHALL 使用 MySQL 8.0 存储核心数据，包含以下表：
- player：玩家信息（用户名、密码哈希、昵称、等级、金币、钻石、ELO 等）
- game_level：关卡配置（名称、难度、图片URL、时间限制、差异数量等）
- level_difference：差异点坐标（关卡ID、X坐标、Y坐标、半径、类型、描述）
- player_level_progress：玩家闯关进度（最佳分数、星级、通关状态）
- battle_record：对战记录（房间ID、模式、分数、排名、ELO 变化）
- game_event：游戏事件（事件类型、事件数据 JSON）
- level_theme：主题表
- level_chapter：章节表

#### Scenario: 数据库初始化
- **WHEN** 首次启动后端服务
- **THEN** schema.sql 自动创建所有数据表，并插入初始关卡数据和差异点数据

### Requirement: Redis 缓存
系统 SHALL 使用 Redis 管理以下缓存：
- 玩家会话（session:{playerId}，30分钟过期）
- 在线人数统计（online:players，HyperLogLog）
- 匹配队列（matching:queue:{difficulty}，ZSet，5分钟过期）
- 房间状态（room:{roomId}，Hash，1小时过期）
- 关卡排行榜（leaderboard:level:{levelId}，ZSet）
- ELO 排行榜（leaderboard:elo，ZSet）
- 关卡配置缓存（level:config:{levelId}，Hash，10分钟过期）
- 玩家信息缓存（player:info:{playerId}，Hash，30分钟过期）

#### Scenario: 缓存命中
- **WHEN** 请求关卡配置且 Redis 中存在缓存
- **THEN** 直接从 Redis 返回数据，不查询 MySQL

### Requirement: JWT 认证系统
系统 SHALL 提供 JWT 认证：
- 注册：POST /api/auth/register（用户名 + 密码）
- 登录：POST /api/auth/login（返回 JWT Token）
- Token 刷新：POST /api/auth/refresh
- 所有游戏 API 需要 JWT Token 认证
- Token 过期时间 2 小时，刷新 Token 7 天

#### Scenario: 用户登录
- **WHEN** 用户提交正确的用户名和密码
- **THEN** 返回 JWT Token 和玩家基本信息

#### Scenario: 未认证请求
- **WHEN** 请求游戏 API 但未携带有效 Token
- **THEN** 返回 401 Unauthorized

### Requirement: WebSocket 实时通信（竞速模式）
系统 SHALL 提供 WebSocket + STOMP 实时通信：
- 端点：/ws/game
- 客户端订阅：/user/queue/matching（个人匹配状态）、/game/room/{roomId}（房间广播）
- 客户端发送：/app/matching/join、/app/matching/cancel、/app/game/found、/app/game/ready
- 服务端每 100ms 广播房间状态（玩家进度、分数、剩余时间）
- 匹配算法：基于 ELO Rating，初始 ±200，等待 10s 扩大至 ±500，等待 30s 不限段位

#### Scenario: 实时对战同步
- **WHEN** 房间内任一玩家找到差异
- **THEN** 服务端广播房间状态到所有玩家，包含更新后的进度

### Requirement: Vue 3 管理后台
系统 SHALL 提供 Vue 3 + Element Plus 管理后台，包含：
- 数据看板：实时在线人数、今日活跃、游戏局数、关卡完成率、留存率
- 关卡管理：CRUD、图片上传、差异点可视化标记工具（拖拽标记圆形区域）、发布工作流
- 主题/章节管理：CRUD、关卡分配
- 玩家管理：列表、详情、封禁/解封
- 数据统计：DAU/MAU、留存分析、关卡漏斗、竞速分析
- 系统配置：游戏参数、公告管理

#### Scenario: 差异点标记工具
- **WHEN** 管理员在图片上点击创建差异点标记
- **THEN** 显示圆形标记区域，可拖拽调整位置和半径，自动计算坐标值

#### Scenario: 关卡发布
- **WHEN** 管理员点击"发布"按钮
- **THEN** 关卡状态从"草稿"变为"已发布"，前端可加载该关卡

### Requirement: 前端改造为后端通信
系统 SHALL 改造现有前端，将核心逻辑迁移到后端通信：
- 点击判定：前端发送点击坐标到 POST /api/adventure/levels/{id}/check，后端返回判定结果
- 关卡加载：从 GET /api/adventure/levels/{id} 获取关卡详情（含图片URL，不含差异点坐标）
- 进度保存：POST /api/adventure/levels/{id}/complete 提交通关结果
- 玩家数据：GET /api/player/profile 获取，PUT /api/player/profile 更新
- 排行榜：GET /api/versus/leaderboard/{levelId} 获取
- 竞速模式：通过 WebSocket 通信
- 登录/注册：替换现有的 localStorage 模拟登录

#### Scenario: 前端点击判定流程
- **WHEN** 玩家在游戏图片上点击
- **THEN** 前端将 (levelId, clickX, clickY) 发送到后端 API，根据返回结果渲染命中/未命中动画

#### Scenario: 离线模式兼容
- **WHEN** 后端服务不可用
- **THEN** 前端提示"无法连接服务器"，不回退到本地判定

### Requirement: 差异点坐标统一管理
系统 SHALL 将差异点坐标统一由后端管理：
- 差异点坐标存储在 level_difference 表中
- 前端加载关卡时，不返回差异点坐标（仅返回图片URL、时间限制等）
- 点击判定完全由后端完成
- 管理后台提供可视化工具管理差异点坐标
- 初始数据通过 schema.sql 插入，坐标与现有前端 Canvas 生成图片中的差异位置一致

#### Scenario: 差异点坐标一致性
- **WHEN** 管理后台标记差异点并发布关卡
- **THEN** 前端展示的图片差异位置与后端存储的坐标完全一致

## MODIFIED Requirements

### Requirement: 闯关模式核心玩法（原前端本地判定改为后端判定）
系统 SHALL 实现找不同核心玩法，但点击判定由后端完成：
- 双图并列展示（响应式布局）
- 顶部栏：倒计时 | 关卡号 | 分数 | 连击数
- 点击时前端发送坐标到后端，后端返回判定结果
- 前端根据后端结果渲染：命中动画（粒子+圆圈+分数飞出）或未命中动画（红色X+震动）
- 计分逻辑在后端完成，前端仅展示结果

### Requirement: 竞速模式（原模拟AI改为真实多人+保留AI填充）
系统 SHALL 实现竞速模式：
- 实时对战：通过 WebSocket 匹配真实玩家，2-4人房间
- 当匹配人数不足时，用 AI 对手填充
- 异步挑战：单人挑战 + 排行榜
- 对战同步：服务端每 100ms 广播房间状态

### Requirement: 数据持久化（原 localStorage 改为后端 API）
系统 SHALL 使用后端 API 替代 localStorage：
- 玩家信息通过 /api/player/profile 管理
- 闯关进度通过 /api/adventure/progress 管理
- 排行榜通过 /api/versus/leaderboard 管理
- 前端可缓存后端数据用于展示，但权威数据源为后端

## REMOVED Requirements

### Requirement: 前端本地点击判定
**Reason**: 安全风险，差异点坐标暴露可作弊，需改为后端判定
**Migration**: 前端点击事件改为调用 POST /api/adventure/levels/{id}/check

### Requirement: 前端 Canvas 程序化生成关卡图片
**Reason**: 后端管理关卡图片，通过后台上传，前端从 URL 加载
**Migration**: 初始关卡图片仍可由 Canvas 生成后上传到后端文件服务，后续由管理后台管理

### Requirement: localStorage 数据存储
**Reason**: 改为后端 API + 数据库存储
**Migration**: 前端 storage.js 改为 API 通信层，保留少量本地缓存用于性能优化
