# Tasks

- [ ] Task 1: 项目初始化与基础架构搭建
  - [ ] SubTask 1.1: 创建项目目录结构（index.html, css/, js/, assets/）
  - [ ] SubTask 1.2: 创建 index.html 主入口，引入所有依赖和样式
  - [ ] SubTask 1.3: 实现单页应用路由系统（hash-based routing）
  - [ ] SubTask 1.4: 实现 CSS 变量体系（赛博朋克配色、液态玻璃效果）
  - [ ] SubTask 1.5: 实现动态粒子背景系统

- [ ] Task 2: 通用 UI 组件开发
  - [ ] SubTask 2.1: 液态玻璃卡片组件（GlassCard）
  - [ ] SubTask 2.2: 渐变按钮组件（呼吸光效、悬停/按下动画）
  - [ ] SubTask 2.3: 动画计数器组件（数字滚动）
  - [ ] SubTask 2.4: 加载动画组件
  - [ ] SubTask 2.5: 模态弹窗组件
  - [ ] SubTask 2.6: Toast 提示组件

- [ ] Task 3: 首页大厅页面
  - [ ] SubTask 3.1: 顶部信息栏（头像、等级、金币、钻石）
  - [ ] SubTask 3.2: "开始游戏"大按钮（渐变 + 呼吸光效）
  - [ ] SubTask 3.3: 闯关模式 / 竞速模式入口卡片
  - [ ] SubTask 3.4: 底部功能入口（每日签到、排行榜、设置）
  - [ ] SubTask 3.5: 入场交错动画

- [ ] Task 4: 关卡图片程序化生成系统
  - [ ] SubTask 4.1: Canvas 场景绘制引擎（多主题：城市、自然、室内等）
  - [ ] SubTask 4.2: 差异生成算法（颜色变化、物体增删、位置偏移）
  - [ ] SubTask 4.3: 关卡数据定义（10个预设关卡的 JSON 配置）
  - [ ] SubTask 4.4: 图片缓存机制（避免重复绘制）

- [ ] Task 5: 闯关模式 - 关卡选择页
  - [ ] SubTask 5.1: S 形蜿蜒路径布局
  - [ ] SubTask 5.2: 关卡节点组件（编号、星级、锁定状态）
  - [ ] SubTask 5.3: 当前关卡脉冲光效
  - [ ] SubTask 5.4: 主题/章节切换
  - [ ] SubTask 5.5: 总星星数显示

- [ ] Task 6: 闯关模式 - 游戏核心玩法
  - [ ] SubTask 6.1: 双图并列展示组件（响应式布局）
  - [ ] SubTask 6.2: 点击检测系统（坐标映射 + 容错判定）
  - [ ] SubTask 6.3: 计时器组件（倒计时 + <10秒脉冲警告）
  - [ ] SubTask 6.4: 计分系统（基础分 + 用时奖励 + 连击加成 - 错误惩罚）
  - [ ] SubTask 6.5: 差异标记动画（圆圈扩散 + 粒子爆发）
  - [ ] SubTask 6.6: 错误点击反馈（红色 X + 震动）
  - [ ] SubTask 6.7: 分数飞出动画
  - [ ] SubTask 6.8: 暂停功能

- [ ] Task 7: 渐进式提示系统
  - [ ] SubTask 7.1: 30秒无操作自动方向箭头提示
  - [ ] SubTask 7.2: 手动提示 - 区域高亮闪烁
  - [ ] SubTask 7.3: 提示道具计数与管理

- [ ] Task 8: 结算页面
  - [ ] SubTask 8.1: 全屏庆祝动画（五彩纸屑 + 光效）
  - [ ] SubTask 8.2: 星级评价逐个亮起动画
  - [ ] SubTask 8.3: 分数明细展示
  - [ ] SubTask 8.4: 下一关 / 重玩 / 返回按钮

- [ ] Task 9: 竞速模式
  - [ ] SubTask 9.1: 模式选择页（实时对战 / 异步挑战）
  - [ ] SubTask 9.2: 模拟匹配动画（假匹配过程 3-5 秒）
  - [ ] SubTask 9.3: AI 对手模拟系统（不同速度/准确率）
  - [ ] SubTask 9.4: 对战界面（主区域 + 对手进度侧边栏）
  - [ ] SubTask 9.5: 对手进度实时更新动画
  - [ ] SubTask 9.6: 对战结算（排名 + 模拟 ELO 变化）

- [ ] Task 10: 排行榜与个人中心
  - [ ] SubTask 10.1: 排行榜页面（关卡排行 + ELO 排行）
  - [ ] SubTask 10.2: 个人中心页面（统计信息、历史记录）
  - [ ] SubTask 10.3: 设置页面（音效开关、重置进度）

- [ ] Task 11: 本地数据持久化
  - [ ] SubTask 11.1: localStorage 存储管理器
  - [ ] SubTask 11.2: 玩家数据模型与 CRUD
  - [ ] SubTask 11.3: 闯关进度保存与恢复
  - [ ] SubTask 11.4: 排行榜数据管理

- [ ] Task 12: 音效系统
  - [ ] SubTask 12.1: Web Audio API 音效引擎
  - [ ] SubTask 12.2: 游戏音效（点击、找到差异、错误、倒计时警告、完成）
  - [ ] SubTask 12.3: 背景音乐（程序化生成简单旋律）

- [ ] Task 13: 整合测试与优化
  - [ ] SubTask 13.1: 全流程功能验证
  - [ ] SubTask 13.2: 响应式布局测试（桌面 + 移动端）
  - [ ] SubTask 13.3: 性能优化（Canvas 缓存、动画帧率）
  - [ ] SubTask 13.4: 浏览器兼容性检查

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1, Task 2
- Task 5 depends on Task 1, Task 2, Task 11
- Task 6 depends on Task 4, Task 2, Task 11
- Task 7 depends on Task 6
- Task 8 depends on Task 6
- Task 9 depends on Task 4, Task 2, Task 11
- Task 10 depends on Task 2, Task 11
- Task 11 depends on Task 1
- Task 12 depends on Task 1
- Task 13 depends on all other tasks
