# 修复前后端交互与管理端权限问题 Spec

## Why
前端游戏目前使用本地数据运行，未与后端API交互（点击判定、关卡加载、进度保存等）；管理后台登录后所有操作返回403"没有操作权限"；管理端创建关卡时差异点标记功能需确保x/y坐标正确存储到后端。

## What Changes
- 修复前端游戏与后端API的交互：确保 `backendAvailable` 状态正确管理，登录后所有操作走后端API
- 修复管理后台403权限问题：Spring Security CORS配置缺失导致预检请求被拦截
- 确保管理端差异点标记的x/y坐标正确保存到后端 `level_difference` 表

## Impact
- Affected code:
  - `spot-the-difference/js/app.js` - 前端游戏主逻辑，`backendAvailable` 状态管理
  - `spot-the-difference/js/api.js` - API通信层
  - `spot-the-difference-server/.../config/SecurityConfig.java` - Spring Security配置
  - `spot-the-difference-server/.../config/CorsConfig.java` - CORS配置
  - `spot-the-difference-admin/src/stores/user.js` - 管理端登录状态管理
  - `spot-the-difference-admin/src/api/level.js` - 管理端关卡API
  - `spot-the-difference-admin/src/views/LevelEdit.vue` - 关卡编辑页

## ADDED Requirements

### Requirement: 前端游戏与后端API交互
前端游戏 SHALL 在后端可用时通过API进行所有数据交互，包括：
1. 登录/注册调用后端API
2. 关卡加载从后端获取
3. 点击判定发送坐标到后端验证
4. 通关结果提交到后端
5. 进度/排行榜从后端获取

#### Scenario: 用户登录后开始游戏
- **WHEN** 用户已登录且后端可用，点击开始关卡
- **THEN** 前端调用 `POST /api/adventure/levels/{id}/start`，后端创建游戏会话

#### Scenario: 用户点击图片判定差异
- **WHEN** 用户在游戏图片上点击某个位置
- **THEN** 前端发送 `POST /api/adventure/levels/{id}/check`，携带 `{clickX, clickY}`，后端根据数据库中的差异点坐标判定是否命中，返回 `{hit, diffIndex, score, combo, penalty, timePenalty}`

#### Scenario: 后端不可用时回退本地模式
- **WHEN** 后端API请求失败（网络错误、超时）
- **THEN** 前端回退到本地逻辑，使用 `GameLevels.generateLevel()` 生成本地关卡数据和本地点击判定

### Requirement: 管理后台权限修复
管理后台 SHALL 在管理员登录后正常访问所有管理API。

#### Scenario: 管理员登录后访问数据看板
- **WHEN** 管理员用户（role=ADMIN）登录后访问 `/api/admin/dashboard`
- **THEN** 后端正确识别ADMIN角色，返回200和看板数据，而非403

## MODIFIED Requirements

### Requirement: Spring Security CORS配置
Spring Security SHALL 在安全过滤器链中正确处理CORS预检请求（OPTIONS），确保 `CorsConfig` 的CORS规则在Spring Security过滤器之前生效。

### Requirement: 前端 backendAvailable 状态管理
前端 `backendAvailable` SHALL 在以下时机正确更新：
- 初始值 `false`
- `init()` 时，如果有token，尝试调用 `getProfile()`，成功则设为 `true`
- 任何API调用成功时设为 `true`
- 任何API调用因网络错误失败时设为 `false` 并回退本地模式

### Requirement: 管理端差异点坐标存储
管理端创建关卡时标记的差异点 SHALL 正确保存x/y坐标到后端 `level_difference` 表，坐标基于800x600的基准坐标系。

## REMOVED Requirements
无
