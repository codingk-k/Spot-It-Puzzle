# 找不同游戏（Spot the Difference）— 完整设计方案

## 一、项目概述

### 1.1 项目定义
一款 Web H5 找不同休闲益智游戏，包含**闯关模式**和**竞速模式**两大核心玩法。前端采用 Flutter Web（CanvasKit 模式），后端采用 Java Spring Boot，配套独立后台管理系统。

### 1.2 核心目标
- **闯关模式**：多关卡递进式找不同，难度逐步提升，每关限时完成
- **竞速模式**：多人在线实时对战 + 异步匹配排名，比拼找不同速度
- **后台管理**：关卡图片发布、差异点坐标管理、在线用户监控、数据统计分析
- **UI 风格**：参考精品小游戏的前卫设计，液态玻璃材质 + 动态渐变 + 微交互

### 1.3 技术选型总览

| 层次 | 技术选型 | 说明 |
|------|---------|------|
| 前端框架 | Flutter Web (CanvasKit) | 跨平台，2D 休闲游戏完全胜任 |
| 游戏引擎 | Flame 1.33+ | Flutter 生态 2D 游戏引擎，提供游戏循环/碰撞检测 |
| 状态管理 | flutter_bloc + flame_bloc | 事件驱动模型，适合游戏状态管理 |
| 后端框架 | Spring Boot 3.x + Java 17 | 成熟稳定，WebSocket 原生支持 |
| 实时通信 | WebSocket + STOMP | 双向实时通信，Pub/Sub 模式适合房间广播 |
| 消息协议 | JSON（初期）/ Protobuf（后期优化） | 初期 JSON 快速开发，后期 Protobuf 优化性能 |
| 缓存 | Redis | 会话管理、排行榜、匹配队列、在线统计 |
| 数据库 | MySQL 8.0 | 玩家数据、关卡配置、管理数据 |
| 异步处理 | Java 内存队列（BlockingQueue / ConcurrentLinkedQueue） | 事件采集、异步任务处理 |
| 后台前端 | Vue 3 + Element Plus | 管理后台 UI 框架 |
| 文件存储 | 本地文件系统（Spring ResourceLoader） | 关卡图片、差异图存储，后期可迁移至 OSS |
| 监控 | Spring Boot Admin | 应用监控、指标可视化 |

---

## 二、系统架构设计

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Flutter Web     │  │  Flutter Web     │  │  Vue 3 Admin  │  │
│  │  (游戏客户端)     │  │  (游戏客户端)     │  │  (管理后台)    │  │
│  │  Flame Engine    │  │  Flame Engine    │  │  Element Plus │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬────────┘  │
└───────────┼──────────────────────┼───────────────────┼───────────┘
            │   WebSocket/REST     │   WebSocket/REST  │   REST API
            ▼                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        网关层                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Nginx / API Gateway (负载均衡 + SSL + 静态资源)          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │                      │                   │
            ▼                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     应用服务层                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  Game Service   │  │  Game Service   │  │  Admin Service │  │
│  │  (游戏服务节点)   │  │  (游戏服务节点)   │  │  (管理服务)     │  │
│  │  - 闯关逻辑      │  │  - 闯关逻辑      │  │  - 关卡CRUD    │  │
│  │  - 房间管理      │  │  - 房间管理      │  │  - 发布工作流   │  │
│  │  - 匹配引擎      │  │  - 匹配引擎      │  │  - 数据统计     │  │
│  │  - WebSocket     │  │  - WebSocket     │  │  - 用户管理     │  │
│  └────────┬────────┘  └────────┬────────┘  └───────┬────────┘  │
└───────────┼────────────────────┼───────────────────┼───────────┘
            │                    │                   │
            ▼                    ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     数据与中间件层                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Redis   │  │  MySQL   │  │  Java 内存队列         │  │
│  │  缓存/   │  │  持久化   │  │  (事件采集/异步处理)    │  │
│  │  排行榜  │  │          │  │                      │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     监控层                                       │
│  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │ Spring Boot  │  │  Java 内存队列监控             │  │
│  │ Admin        │  │  (队列积压/消费速率)            │  │
│  └──────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 核心模块划分

| 模块 | 职责 | 技术要点 |
|------|------|---------|
| **游戏客户端** | Flutter Web 游戏界面、交互逻辑、动画特效 | Flame 引擎、Bloc 状态管理、WebSocket |
| **闯关服务** | 关卡加载、计时计分、进度保存、难度递进 | REST API + 本地缓存 |
| **竞速服务** | 实时匹配、房间管理、对战同步、结果结算 | WebSocket + STOMP + Redis |
| **用户服务** | 注册登录、个人信息、好友系统 | Spring Security + JWT |
| **关卡服务** | 关卡配置管理、图片资源分发 | REST API + CDN |
| **统计服务** | 在线人数、游戏数据采集、排行榜、分析报表 | Redis + 定时任务 + MySQL |
| **管理后台** | 关卡发布、差异点管理、用户管理、数据看板 | Vue 3 + Spring Boot Admin API |
| **文件服务** | 图片上传、存储、访问 | Spring ResourceLoader + 本地文件系统 + Nginx 静态资源 |

---

## 三、游戏核心设计

### 3.1 闯关模式设计

#### 3.1.1 难度递进系统

| 阶段 | 关卡范围 | 差异数量 | 差异面积 | 时间限制 | 差异类型 |
|------|---------|---------|---------|---------|---------|
| 入门期 | 1-20关 | 3处 | 大（明显） | 120秒 | 颜色变化、物体增删 |
| 成长期 | 21-50关 | 5处 | 中等 | 90秒 | 形状微变 + 颜色混合 |
| 进阶期 | 51-100关 | 7处 | 小面积 | 60秒 | 位置偏移、纹理变化 |
| 大师级 | 100+关 | 7-10处 | 极小 | 30-45秒 | 弧度差异、密集干扰 |

#### 3.1.2 计分系统

```
总分 = 基础分 + 用时奖励 + 连击加成 - 错误惩罚 - 提示扣分

- 基础分：每找到一个差异 +100 分
- 用时奖励：剩余时间 × 5 分/秒
- 连击加成：连续正确第N个 → ×(1 + N×0.1) 倍率
- 错误惩罚：点错一次 -20 分，同时扣减 3 秒时间
- 提示扣分：使用提示找到的差异不得分
- 星级评价：★★★ ≥ 80%总分 | ★★ ≥ 50% | ★ > 0%
```

#### 3.1.3 提示系统（渐进式）

| 级别 | 效果 | 触发条件 |
|------|------|---------|
| 第一级 | 屏幕边缘箭头指向差异点大致方向 | 玩家停留 30 秒无操作 |
| 第二级 | 差异点区域高亮闪烁（5秒） | 使用 1 次提示道具 |
| 第三级 | 直接标记差异点位置 | 使用 2 次提示道具 |

提示道具获取：每日登录 3 个、通关奖励、看广告获取。

#### 3.1.4 关卡解锁机制
- 线性解锁：通过第 N 关解锁第 N+1 关
- 条件解锁：获得 ≥2 星可解锁下一关
- 特殊关卡：累计获得一定星星数解锁隐藏关卡

### 3.2 竞速模式设计

#### 3.2.1 实时对战（同步匹配）

**流程：**
```
点击"实时对战" → 选择难度 → 进入匹配队列 → 匹配成功(2-4人)
→ 房间等待(倒计时5秒) → 游戏开始(同一组图) → 实时同步进度
→ 所有人完成或时间耗尽 → 结算排名 → 返回大厅
```

**匹配算法：**
- 基于玩家段位（ELO Rating）匹配，初始差距 ±200 分
- 等待超过 10 秒扩大搜索范围至 ±500 分
- 等待超过 30 秒扩大至不限段位
- 使用 Redis Sorted Set 管理匹配队列

**实时同步策略（状态同步）：**
- 服务端作为权威方，每 100ms 广播一次房间内所有玩家进度
- 同步内容：已找到差异列表、当前分数、剩余时间
- 客户端收到同步数据后更新对手进度 UI
- 使用 STOMP 协议的 `/game/room/{roomId}` 主题进行房间广播

**段位系统：**

| 段位 | 分数范围 | 图标 |
|------|---------|------|
| 青铜 | 0-999 | 🥉 |
| 白银 | 1000-1999 | 🥈 |
| 黄金 | 2000-2999 | 🥇 |
| 铂金 | 3000-3999 | 💎 |
| 钻石 | 4000-4999 | 👑 |
| 大师 | 5000+ | 🏆 |

**ELO 计算公式：**
```
新分数 = 旧分数 + K × (实际结果 - 预期结果)
K = 32（常规对局）
预期结果 = 1 / (1 + 10^((对手平均分 - 自己分数)/400))
实际结果：第1名=1.0, 第2名=0.5, 第3名=0.25, 第4名=0
```

#### 3.2.2 异步匹配（排行榜模式）

**流程：**
```
选择"异步挑战" → 选择关卡/难度 → 开始游戏(单人)
→ 完成后成绩上传 → 与历史玩家成绩对比 → 显示排名
```

**特点：**
- 无需同时在线，随时挑战
- 每个关卡独立排行榜（Top 100）
- 排行榜数据使用 Redis Sorted Set 存储
- 每小时定时持久化到 MySQL

### 3.3 差异点数据结构

```json
{
  "levelId": 1,
  "levelName": "城市街头",
  "difficulty": 1,
  "themeId": 1,
  "imageA": "https://cdn.example.com/levels/1/a.webp",
  "imageB": "https://cdn.example.com/levels/1/b.webp",
  "imageWidth": 800,
  "imageHeight": 600,
  "timeLimit": 120,
  "differences": [
    {
      "id": 1,
      "x": 150,
      "y": 200,
      "radius": 35,
      "type": "COLOR_CHANGE",
      "description": "左侧广告牌颜色从红色变为蓝色"
    },
    {
      "id": 2,
      "x": 400,
      "y": 100,
      "radius": 25,
      "type": "OBJECT_REMOVED",
      "description": "天空中的云朵被移除"
    }
  ]
}
```

**点击判定逻辑：**
```
命中判定 = sqrt((clickX - diffX)² + (clickY - diffY)²) ≤ radius × 1.2
// 容错系数 1.2，检测区域略大于实际差异区域
```

---

## 四、前端设计（Flutter Web）

### 4.1 项目结构

```
lib/
├── main.dart                    # 入口
├── app.dart                     # App 配置
├── core/
│   ├── constants/               # 常量定义
│   ├── theme/                   # 主题配置（液态玻璃、动态渐变）
│   ├── utils/                   # 工具类（坐标转换、计时器）
│   ├── network/                 # 网络层（REST API + WebSocket）
│   └── extensions/              # Dart 扩展方法
├── features/
│   ├── auth/                    # 登录注册
│   │   ├── bloc/
│   │   ├── pages/
│   │   └── widgets/
│   ├── home/                    # 首页大厅
│   │   ├── bloc/
│   │   ├── pages/
│   │   └── widgets/
│   ├── adventure/               # 闯关模式
│   │   ├── bloc/
│   │   ├── pages/
│   │   │   ├── level_select_page.dart
│   │   │   └── game_play_page.dart
│   │   └── widgets/
│   │       ├── difference_image.dart    # 差异图组件
│   │       ├── timer_widget.dart        # 计时器
│   │       ├── score_widget.dart        # 分数显示
│   │       ├── hint_button.dart         # 提示按钮
│   │       └── result_dialog.dart       # 结算弹窗
│   ├── versus/                  # 竞速模式
│   │   ├── bloc/
│   │   ├── pages/
│   │   │   ├── mode_select_page.dart
│   │   │   ├── matchmaking_page.dart
│   │   │   ├── realtime_battle_page.dart
│   │   │   └── async_challenge_page.dart
│   │   └── widgets/
│   │       ├── opponent_progress.dart   # 对手进度
│   │       ├── ranking_widget.dart      # 排名显示
│   │       └── countdown_overlay.dart   # 倒计时
│   ├── leaderboard/             # 排行榜
│   ├── profile/                 # 个人中心
│   └── settings/                # 设置
├── game/                        # Flame 游戏引擎层
│   ├── components/              # 游戏组件
│   │   ├── difference_spot.dart       # 差异点组件
│   │   ├── click_handler.dart         # 点击检测
│   │   ├── particle_effect.dart       # 粒子特效
│   │   └── background_music.dart      # 背景音乐
│   └── utils/
│       └── game_audio.dart            # 音频管理
└── shared/
    ├── widgets/                 # 通用组件
    │   ├── glass_card.dart            # 液态玻璃卡片
    │   ├── gradient_button.dart       # 渐变按钮
    │   ├── animated_counter.dart      # 动画计数器
    │   └── loading_widget.dart
    └── models/                  # 数据模型
        ├── level_model.dart
        ├── player_model.dart
        └── game_result_model.dart
```

### 4.2 UI 设计规范（前卫小游戏风格）

#### 4.2.1 视觉风格定义

**核心风格：赛博朋克 × 液态玻璃**

- **主色调**：深色背景 (#0A0E1A) + 霓虹渐变强调色（青色 #00F5FF → 紫色 #A855F7 → 粉色 #F472B6）
- **材质**：液态玻璃（Glassmorphism）+ 金属质感按钮
- **圆角**：大圆角 (16-24px)，柔和亲和
- **阴影**：多层彩色阴影，增加层次感
- **字体**：圆润无衬线字体（Nunito / 思源黑体 Rounded）

#### 4.2.2 核心页面 UI 设计

**首页大厅：**
- 顶部：玩家头像 + 等级 + 金币/钻石
- 中部：大号"开始游戏"按钮（渐变 + 呼吸光效）
- 两个模式入口卡片：闯关模式（书本图标）、竞速模式（闪电图标）
- 底部：每日签到、排行榜、设置入口
- 背景：动态粒子 + 缓慢流动的渐变色

**闯关模式 - 关卡选择页：**
- 路线图式关卡布局（S 形蜿蜒路径）
- 每个关卡节点显示：关卡号、星级评价、锁定状态
- 当前关卡放大 + 脉冲光效
- 顶部显示当前主题和总星星数

**闯关模式 - 游戏页：**
- 双图并列（上下或左右布局，响应式适配）
- 顶部栏（毛玻璃效果）：倒计时 | 关卡号 | 分数 | 连击数
- 底部栏：提示按钮 | 道具栏 | 暂停按钮
- 找到差异时：粒子爆发 + 圆圈标记 + 音效 + 分数飞出动画
- 错误点击：红色 X 标记 + 短暂震动

**竞速模式 - 实时对战页：**
- 主区域：自己的找不同图（占 60%）
- 侧边栏：对手进度列表（头像 + 已找数量 + 进度条）
- 顶部：倒计时 + 房间信息
- 找到差异时：自己区域绿色标记，对手区域实时更新
- 对手找到差异时：对手头像闪烁 + 提示音

**结算页：**
- 全屏庆祝动画（粒子 + 光效）
- 星级评价（1-3 星逐个亮起动画）
- 分数明细（基础分、用时奖励、连击加成等）
- 排名展示（竞速模式）
- 按钮：下一关 / 重玩 / 返回

#### 4.2.3 微交互设计

| 交互场景 | 动画效果 |
|---------|---------|
| 按钮按下 | 缩放 0.95 + 涟漪扩散 |
| 按钮悬停 | 发光增强 + 轻微上浮 |
| 找到差异 | 粒子爆发(20颗) + 圆圈扩散 + 分数飞出(+100) |
| 错误点击 | 红色 X 淡入淡出 + 轻微震动 |
| 关卡完成 | 全屏五彩纸屑 + 星级逐个亮起 |
| 倒计时<10秒 | 数字变红 + 脉冲动画 + 紧张音效 |
| 匹配成功 | 房间卡片飞入 + 对手头像依次展示 |
| 排名变化 | 数字滚动动画 |

---

## 五、后端设计（Java Spring Boot）

### 5.1 项目结构

```
spot-the-difference-server/
├── pom.xml
├── src/main/java/com/game/std/
│   ├── SpotTheDifferenceApplication.java
│   ├── common/
│   │   ├── config/              # 配置类（Redis、WebSocket、Security）
│   │   ├── exception/           # 全局异常处理
│   │   ├── result/              # 统一响应封装
│   │   ├── util/                # 工具类
│   │   └── annotation/          # 自定义注解
│   ├── auth/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── dto/
│   │   └── filter/              # JWT 认证过滤器
│   ├── level/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── entity/
│   │   ├── mapper/
│   │   └── dto/
│   ├── adventure/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── entity/
│   │   ├── mapper/
│   │   └── dto/
│   ├── versus/
│   │   ├── controller/
│   │   ├── service/
│   │   │   ├── MatchmakingService.java    # 匹配服务
│   │   │   ├── RoomService.java           # 房间管理
│   │   │   ├── BattleService.java         # 对战逻辑
│   │   │   └── RankingService.java        # 排行榜
│   │   ├── entity/
│   │   ├── mapper/
│   │   ├── dto/
│   │   └── websocket/
│   │       ├── GameWebSocketHandler.java  # WebSocket 处理器
│   │       └── RoomMessageBroker.java     # 房间消息广播
│   ├── player/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── entity/
│   │   ├── mapper/
│   │   └── dto/
│   ├── statistics/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── entity/
│   │   ├── mapper/
│   │   └── dto/
│   ├── event/                      # 事件采集（内存队列）
│   │   ├── GameEventQueue.java     # 内存事件队列
│   │   ├── GameEventConsumer.java  # 异步消费线程
│   │   └── GameEventPublisher.java # 事件发布
│   ├── file/                       # 文件服务（本地存储）
│   │   ├── LocalFileService.java   # 本地文件上传/读取
│   │   └── FileController.java     # 文件访问接口
│   └── admin/
│       ├── controller/
│       ├── service/
│       ├── entity/
│       ├── mapper/
│       └── dto/
├── src/main/resources/
│   ├── application.yml
│   ├── mapper/                   # MyBatis XML
│   └── proto/                    # Protobuf 定义（后期）
└── src/main/resources/db/
    └── schema.sql                # 数据库初始化脚本
```

### 5.2 数据库设计

#### 5.2.1 核心数据表

**玩家表 (player)**
```sql
CREATE TABLE `player` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `nickname` VARCHAR(64) NOT NULL COMMENT '昵称',
  `avatar_url` VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
  `level` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '等级',
  `exp` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '经验值',
  `gold` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '金币',
  `diamond` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '钻石',
  `hint_count` INT UNSIGNED NOT NULL DEFAULT 3 COMMENT '提示次数',
  `elo_rating` INT UNSIGNED NOT NULL DEFAULT 1000 COMMENT 'ELO积分',
  `rank_tier` VARCHAR(32) NOT NULL DEFAULT 'BRONZE' COMMENT '段位',
  `total_games` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总对局数',
  `win_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '胜利次数',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1:正常 0:封禁',
  `last_login_time` DATETIME DEFAULT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_elo` (`elo_rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**关卡表 (game_level)**
```sql
CREATE TABLE `game_level` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL COMMENT '关卡名称',
  `difficulty` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '难度1-5',
  `theme_id` INT UNSIGNED NOT NULL COMMENT '主题ID',
  `chapter_id` INT UNSIGNED NOT NULL COMMENT '章节ID',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  `image_a_url` VARCHAR(512) NOT NULL COMMENT '原图URL',
  `image_b_url` VARCHAR(512) NOT NULL COMMENT '差异图URL',
  `image_width` INT UNSIGNED NOT NULL COMMENT '图片宽度',
  `image_height` INT UNSIGNED NOT NULL COMMENT '图片高度',
  `time_limit` INT UNSIGNED NOT NULL DEFAULT 120 COMMENT '时间限制(秒)',
  `diff_count` TINYINT UNSIGNED NOT NULL DEFAULT 3 COMMENT '差异点数量',
  `reward_gold` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '通关金币',
  `reward_exp` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '通关经验',
  `unlock_condition` JSON DEFAULT NULL COMMENT '解锁条件',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0:草稿 1:待审核 2:已发布 3:已下线',
  `publish_time` DATETIME DEFAULT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chapter_sort` (`chapter_id`, `sort_order`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**差异点表 (level_difference)**
```sql
CREATE TABLE `level_difference` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level_id` INT UNSIGNED NOT NULL COMMENT '关卡ID',
  `diff_index` TINYINT UNSIGNED NOT NULL COMMENT '差异序号',
  `pos_x` INT UNSIGNED NOT NULL COMMENT 'X坐标(基于原图)',
  `pos_y` INT UNSIGNED NOT NULL COMMENT 'Y坐标(基于原图)',
  `radius` INT UNSIGNED NOT NULL COMMENT '检测半径',
  `diff_type` VARCHAR(32) NOT NULL COMMENT '差异类型(COLOR_CHANGE/OBJECT_REMOVED/POSITION_SHIFT/SHAPE_CHANGE)',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '差异描述',
  PRIMARY KEY (`id`),
  KEY `idx_level_id` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**玩家关卡进度表 (player_level_progress)**
```sql
CREATE TABLE `player_level_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id` BIGINT UNSIGNED NOT NULL,
  `level_id` INT UNSIGNED NOT NULL,
  `best_score` INT UNSIGNED NOT NULL DEFAULT 0,
  `star_count` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-3星',
  `best_time` INT UNSIGNED DEFAULT NULL COMMENT '最快通关时间(秒)',
  `play_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_completed` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `last_play_time` DATETIME DEFAULT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_player_level` (`player_id`, `level_id`),
  KEY `idx_player_completed` (`player_id`, `is_completed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**对战记录表 (battle_record)**
```sql
CREATE TABLE `battle_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` VARCHAR(64) NOT NULL COMMENT '房间ID',
  `mode` TINYINT UNSIGNED NOT NULL COMMENT '1:实时对战 2:异步挑战',
  `level_id` INT UNSIGNED NOT NULL,
  `player_id` BIGINT UNSIGNED NOT NULL,
  `score` INT UNSIGNED NOT NULL DEFAULT 0,
  `found_count` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `time_used` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '用时(秒)',
  `rank_position` TINYINT UNSIGNED DEFAULT NULL COMMENT '排名',
  `elo_change` INT DEFAULT NULL COMMENT 'ELO变化值',
  `result` TINYINT UNSIGNED NOT NULL COMMENT '1:胜利 0:失败',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_player` (`player_id`),
  KEY `idx_room` (`room_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**游戏事件表 (game_event)**
```sql
CREATE TABLE `game_event` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id` BIGINT UNSIGNED NOT NULL,
  `event_type` VARCHAR(64) NOT NULL COMMENT '事件类型',
  `event_data` JSON DEFAULT NULL COMMENT '事件数据',
  `session_id` VARCHAR(64) DEFAULT NULL,
  `client_version` VARCHAR(32) DEFAULT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_player_type` (`player_id`, `event_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**主题表 (level_theme)**
```sql
CREATE TABLE `level_theme` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '主题名称',
  `description` VARCHAR(255) DEFAULT NULL,
  `cover_url` VARCHAR(512) DEFAULT NULL,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**章节表 (level_chapter)**
```sql
CREATE TABLE `level_chapter` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '章节名称',
  `theme_id` INT UNSIGNED NOT NULL,
  `difficulty_range` VARCHAR(32) NOT NULL COMMENT '难度范围如1-3',
  `unlock_stars` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '解锁所需星星数',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_theme` (`theme_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 5.3 WebSocket 通信设计

#### 5.3.1 消息协议

```json
// 客户端 → 服务端：加入匹配
{
  "type": "JOIN_MATCH",
  "data": {
    "playerId": 1001,
    "difficulty": 3,
    "mode": "REALTIME"
  }
}

// 服务端 → 客户端：匹配成功
{
  "type": "MATCH_FOUND",
  "data": {
    "roomId": "room_abc123",
    "players": [
      {"playerId": 1001, "nickname": "玩家A", "avatarUrl": "...", "eloRating": 1200},
      {"playerId": 1002, "nickname": "玩家B", "avatarUrl": "...", "eloRating": 1150}
    ],
    "levelId": 42,
    "countdown": 5
  }
}

// 客户端 → 服务端：找到差异
{
  "type": "DIFF_FOUND",
  "data": {
    "roomId": "room_abc123",
    "playerId": 1001,
    "diffIndex": 2,
    "timestamp": 1700000000000
  }
}

// 服务端 → 客户端：房间状态同步（每100ms）
{
  "type": "ROOM_STATE",
  "data": {
    "roomId": "room_abc123",
    "remainingTime": 85,
    "players": [
      {
        "playerId": 1001,
        "foundDiffs": [0, 2],
        "score": 250,
        "isFinished": false
      },
      {
        "playerId": 1002,
        "foundDiffs": [0, 1, 2],
        "score": 380,
        "isFinished": false
      }
    ]
  }
}

// 服务端 → 客户端：游戏结束
{
  "type": "BATTLE_END",
  "data": {
    "roomId": "room_abc123",
    "rankings": [
      {"playerId": 1002, "rank": 1, "score": 450, "timeUsed": 42, "eloChange": +25},
      {"playerId": 1001, "rank": 2, "score": 320, "timeUsed": 58, "eloChange": -15}
    ]
  }
}
```

#### 5.3.2 STOMP 端点设计

```
WebSocket 端点: /ws/game

客户端订阅:
  /user/queue/matching     — 个人匹配状态
  /game/room/{roomId}      — 房间消息广播

客户端发送:
  /app/matching/join        — 加入匹配
  /app/matching/cancel      — 取消匹配
  /app/game/found           — 上报找到差异
  /app/game/ready           — 准备就绪
```

### 5.4 REST API 设计

```
# 认证
POST   /api/auth/register          — 注册
POST   /api/auth/login             — 登录
POST   /api/auth/refresh           — 刷新Token

# 闯关模式
GET    /api/adventure/chapters     — 获取章节列表
GET    /api/adventure/chapters/{id}/levels — 获取章节下关卡
GET    /api/adventure/levels/{id}  — 获取关卡详情（含差异点）
POST   /api/adventure/levels/{id}/complete — 提交通关结果
GET    /api/adventure/progress     — 获取玩家进度

# 竞速模式
POST   /api/versus/async/start     — 开始异步挑战
POST   /api/versus/async/submit    — 提交异步成绩
GET    /api/versus/leaderboard/{levelId} — 获取关卡排行榜
GET    /api/versus/rank            — 获取个人段位信息

# 玩家
GET    /api/player/profile         — 获取个人信息
PUT    /api/player/profile         — 更新个人信息
GET    /api/player/stats           — 获取玩家统计

# 管理后台 API
GET    /api/admin/dashboard        — 数据看板概览
GET    /api/admin/online-count     — 实时在线人数
GET    /api/admin/levels           — 关卡列表（分页）
POST   /api/admin/levels           — 创建关卡
PUT    /api/admin/levels/{id}      — 更新关卡
POST   /api/admin/levels/{id}/publish — 发布关卡
POST   /api/admin/levels/{id}/offline  — 下线关卡
POST   /api/admin/levels/{id}/diffs — 批量设置差异点
GET    /api/admin/players          — 玩家列表
PUT    /api/admin/players/{id}/ban — 封禁玩家
GET    /api/admin/statistics/retention — 留存率统计
GET    /api/admin/statistics/level-funnel — 关卡漏斗分析
GET    /api/admin/statistics/revenue — 收入统计
```

---

## 六、后台管理系统设计

### 6.1 功能模块

```
后台管理系统
├── 📊 数据看板
│   ├── 实时在线人数（折线图，按小时）
│   ├── 今日活跃用户 / 新增用户
│   ├── 游戏局数统计（闯关/竞速）
│   ├── 关卡完成率漏斗图
│   ├── 留存率趋势（次日/7日/30日）
│   └── 收入统计（金币消耗/钻石消费）
│
├── 🎮 关卡管理
│   ├── 关卡列表（搜索/筛选/分页）
│   ├── 创建/编辑关卡
│   │   ├── 上传原图 + 差异图
│   │   ├── 设置难度/时间限制/奖励
│   │   ├── 在图片上标记差异点（拖拽标记圆形区域）
│   │   └── 预览 + 测试
│   ├── 关卡发布工作流（草稿 → 审核 → 发布）
│   ├── 批量操作（批量发布/下线）
│   └── 关卡数据看板（完成率/平均时间/流失率）
│
├── 📁 主题 & 章节管理
│   ├── 主题 CRUD
│   ├── 章节 CRUD
│   └── 关卡分配
│
├── 👥 玩家管理
│   ├── 玩家列表（搜索/筛选/分页）
│   ├── 玩家详情（游戏记录、消费记录、行为日志）
│   ├── 封禁/解封
│   └── 玩家分层（鲸鱼/海豚/小鱼/零消费/流失风险）
│
├── 📈 数据统计
│   ├── 用户活跃分析（DAU/MAU/PCU 趋势）
│   ├── 留存分析（次日/7日/30日留存曲线）
│   ├── 关卡漏斗分析（每关开始→完成→失败转化率）
│   ├── 竞速模式分析（匹配时长分布/段位分布/对局时长）
│   ├── 经济系统分析（金币产出/消耗趋势）
│   └── 自定义报表（灵活查询 + 导出）
│
├── ⚙️ 系统配置
│   ├── 游戏参数配置（初始金币/提示次数/匹配超时等）
│   ├── 公告管理
│   ├── 版本管理
│   └── 权限管理（RBAC）
│
└── 📋 操作日志
    ├── 管理员操作日志
    ├── 系统异常日志
    └── 审计日志
```

### 6.2 关卡差异点标记工具

后台核心功能——在图片上可视化标记差异点：

**交互流程：**
1. 上传原图和差异图，系统并排展示
2. 管理员在任一图片上点击，创建差异点标记（圆形区域）
3. 可拖拽调整位置、滚轮调整半径
4. 自动计算并显示坐标值 (X, Y, Radius)
5. 支持预览模式：模拟玩家视角，测试点击判定
6. 保存时自动校验差异点不重叠、在图片范围内

---

## 七、Redis 缓存设计

| Key 模式 | 数据类型 | 用途 | 过期时间 |
|---------|---------|------|---------|
| `session:{playerId}` | Hash | 玩家在线会话 | 30 分钟 |
| `online:players` | HyperLogLog | 实时在线人数统计 | - |
| `online:hourly:{date}` | ZSet | 每小时在线人数趋势 | 7 天 |
| `matching:queue:{difficulty}` | ZSet | 匹配队列（score=ELO） | 5 分钟 |
| `room:{roomId}` | Hash | 房间状态 | 1 小时 |
| `room:players:{roomId}` | Set | 房间内玩家列表 | 1 小时 |
| `leaderboard:level:{levelId}` | ZSet | 关卡排行榜 | 永久 |
| `leaderboard:elo` | ZSet | ELO 总排行榜 | 永久 |
| `level:config:{levelId}` | Hash | 关卡配置缓存 | 10 分钟 |
| `level:list:published` | List | 已发布关卡列表 | 5 分钟 |
| `player:info:{playerId}` | Hash | 玩家基础信息缓存 | 30 分钟 |

---

## 八、实施阶段规划

### 第一阶段：核心基础（MVP）
- 后端基础框架搭建（Spring Boot + MySQL + Redis）
- 用户认证系统（注册/登录/JWT）
- 关卡数据管理（CRUD + 图片上传）
- Flutter Web 项目初始化 + Flame 引擎集成
- 闯关模式核心玩法（双图展示、点击判定、计时计分）
- 后台管理系统基础框架（Vue 3 + 关卡管理）

### 第二阶段：闯关完善
- 难度递进系统
- 提示系统 + 道具系统
- 关卡解锁机制
- 星级评价系统
- 进度保存与恢复
- 后台关卡发布工作流 + 差异点标记工具

### 第三阶段：竞速模式
- WebSocket 实时通信
- 匹配系统（实时 + 异步）
- 房间管理
- 实时对战同步
- ELO 段位系统
- 排行榜

### 第四阶段：数据与运营
- 数据采集系统（Java 内存队列 + 异步消费线程）
- 后台数据看板
- 留存/漏斗分析
- 玩家管理功能
- 公告系统
- 性能优化 + 压力测试

### 第五阶段：打磨优化
- UI 动画特效打磨
- 音效系统
- 多主题场景扩展
- 社交功能（好友、分享）
- 国际化支持
- 安全加固

---

## 九、假设与决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 差异生成方式 | 手动标注（后台管理） | 初期内容量可控，质量有保障 |
| 图片格式 | WebP | 比 PNG 减少 25-35% 体积，Flutter 支持 |
| 状态同步策略 | 状态同步（非帧同步） | 找不同游戏不需要严格帧同步，状态同步更简单可靠 |
| 消息协议 | 初期 JSON，后期 Protobuf | JSON 快速开发，后期优化性能 |
| 实时对战人数 | 2-4 人 | 找不同游戏节奏快，2-4 人最佳体验 |
| 匹配算法 | ELO + 扩大范围 | 公平性与匹配速度的平衡 |
| 后台框架 | Vue 3 + Element Plus | 成熟稳定，管理后台首选 |
| 文件存储 | 本地文件系统 + Nginx | 初期简化部署，后期可无缝迁移至 OSS |
| 异步处理 | Java 内存队列（BlockingQueue） | 初期无需引入消息中间件，降低运维复杂度 |
| 监控 | Spring Boot Admin | 轻量级监控，满足初期需求 |

---

## 十、验证步骤

1. **核心玩法验证**：手动创建 3 个测试关卡，验证双图展示、点击判定、计时计分功能正确
2. **难度递进验证**：创建不同难度的关卡，验证差异数量/面积/时间限制参数生效
3. **实时对战验证**：2 个客户端同时连接，验证匹配 → 对战 → 结算全流程
4. **后台管理验证**：通过后台创建关卡、标记差异点、发布，验证客户端正确加载
5. **性能验证**：模拟 100 并发用户进行实时对战，验证 WebSocket 稳定性
6. **数据统计验证**：完成多局游戏后，验证后台数据看板数据准确性
