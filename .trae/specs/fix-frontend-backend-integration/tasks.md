# Tasks

- [x] Task 1: 修复管理后台403权限问题
  - [x] SubTask 1.1: 在 SecurityConfig 中添加 CORS 配置，确保 Spring Security 在过滤器链中先处理 CORS 再做认证
  - [x] SubTask 1.2: 修复管理端 user.js store 的 login 方法，正确解析 AuthResponse 中的 playerInfo 字段（当前读取 data.username/data.role 应为 data.playerInfo.username/data.playerInfo.role）
  - [x] SubTask 1.3: 修复管理端 level.js 的 publishLevel 和 offlineLevel API，后端是 POST 但前端用了 PUT

- [x] Task 2: 修复前端游戏与后端API交互
  - [x] SubTask 2.1: 修复 app.js 中 backendAvailable 状态管理 - init() 时若有token应尝试连接后端，成功则设为 true；API成功时设为 true；网络失败时设为 false
  - [x] SubTask 2.2: 修复 app.js 中 startGame() 函数 - 当 backendAvailable=true 时，先调用后端 startLevel API，再用本地数据初始化游戏；后端失败时回退本地
  - [x] SubTask 2.3: 修复 app.js 中 handleGameClick() - 当 backendAvailable=true 时，发送 clickX/clickY 到后端 checkClick API，根据返回的 hit/diffIndex/score/combo/penalty 更新游戏状态；后端失败时回退本地判定
  - [x] SubTask 2.4: 修复 app.js 中 finishGame() - 当 backendAvailable=true 时，调用后端 completeLevel API 提交结果；后端失败时回退本地结算
  - [x] SubTask 2.5: renderLevelSelect() 和 renderLeaderboard() 已正确使用后端API，无需修改
  - [x] SubTask 2.6: api.js 数据格式对齐 - startGame() 已改为始终使用本地 generateLevel() 生成图片，无需修改 api.js

- [x] Task 3: 确保管理端差异点坐标正确存储
  - [x] SubTask 3.1: DiffMarker.vue 组件坐标计算逻辑正确（基于800x600基准坐标系）
  - [x] SubTask 3.2: LevelEdit.vue 的 saveDiffs/loadDiffs 方法正确映射字段名（themeId/chapterId/imageAUrl/imageBUrl + diffX→x/diffY→y）
  - [x] SubTask 3.3: 后端添加 GET /api/admin/levels/{id}/diffs 接口，AdminServiceImpl.getDiffs 正确将 diffX/diffY 映射到 DiffMark 的 x/y

- [x] Task 4: 验证所有修复
  - [x] SubTask 4.1: 11个检查点全部通过，管理后台403权限修复
  - [x] SubTask 4.2: 前端游戏 startGame/handleGameClick/finishGame 后端交互修复
  - [x] SubTask 4.3: 管理端差异点坐标存储链路完整

# Task Dependencies
- Task 2 depends on Task 1 (管理端权限修复后才能验证前端交互)
- Task 3 depends on Task 1 (管理端权限修复后才能验证差异点保存)
- Task 4 depends on Task 1, Task 2, Task 3
