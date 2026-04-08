# Development Tasks: Obsidian 宠物插件

**Feature**: obsidian-cat-pet  
**Created**: 2026-03-28  
**Total Tasks**: 35  
**Total Estimate**: 11 天

---

## Phase 0: Research & Foundation
**Duration**: 0.5 天

### R1. 调研 Claudian 插件 API [2h]
- **Type**: Research
- **Priority**: High
- **Dependencies**: None
- **Description**: 
  - 确认 Claudian 插件暴露的 API 接口
  - 测试 `app.plugins.plugins['claudian']` 访问方式
  - 确定 `sendMessage` 方法的参数和返回值
  - 文档化调用示例和错误处理方式
- **Acceptance Criteria**:
  - [ ] 能在 console 成功调用 Claudian API
  - [ ] 文档化 API 接口定义
  - [ ] 确定降级策略

### R2. 调研 Obsidian 浮动容器最佳实践 [2h]
- **Type**: Research
- **Priority**: High
- **Dependencies**: None
- **Description**:
  - 调研如何在 Obsidian 中创建浮动 DOM 容器
  - 确认 z-index、pointer-events 等 CSS 属性的处理方式
  - 调研 Obsidian 布局变化事件的监听方式
  - 参考其他浮动插件的实现
- **Acceptance Criteria**:
  - [ ] 确定浮动容器的挂载点
  - [ ] 确认与 Obsidian UI 的兼容性
  - [ ] 文档化实现方案

---

## Phase 1: 核心框架 (MVP)
**Duration**: 2 天

### P1-T1. 创建插件基础结构 [2h] ✅ DONE
- **Type**: Setup
- **Priority**: High
- **Dependencies**: R1, R2
- **Completed**: 2026-03-28
- **Description**:
  - 创建 `manifest.json` 配置
  - 创建 `main.ts` 插件入口类
  - 配置 `esbuild` 构建脚本
  - 创建 `settings.ts` 设置面板基础
  - 创建 `styles.css` 样式文件
- **Acceptance Criteria**:
  - [ ] 插件能在 Obsidian 中加载
  - [ ] 控制台输出 "Obsidian Cat Pet Plugin Loaded"
  - [ ] 设置面板显示基本选项

### P1-T2. 实现 Cat 数据模型 [2h] ✅ DONE
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P1-T1
- **Completed**: 2026-03-28
- **Description**:
  - 创建 `src/models/cat.ts`
  - 定义 `Cat`, `CoatPattern`, `Personality` 接口
  - 定义 `CatState`, `Position`, `CatStats` 类型
  - 实现 `generateUUID()` 工具函数
  - 实现 `createDefaultCat()` 工厂函数
- **Acceptance Criteria**:
  - [ ] TypeScript 类型定义完整
  - [ ] 能成功创建猫咪实例
  - [ ] 类型检查通过

### P1-T3. 实现 Canvas 猫咪渲染器（静态） [4h] ✅ DONE
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P1-T2
- **Completed**: 2026-03-28
- **Description**:
  - 创建 `src/renderer/cat-renderer.ts`
  - 实现 `CatRenderer` 类
  - 绘制猫咪基础形状（身体、头部、耳朵）
  - 实现纯色花纹 (`solid` pattern)
  - 绘制眼睛（基础圆形）
- **Acceptance Criteria**:
  - [ ] 能渲染 128x128 像素的猫咪
  - [ ] 支持自定义底色
  - [ ] 透明背景

### P1-T4. 实现花色生成算法 [2h] ✅ DONE (合并到 P1-T2)
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P1-T3
- **Completed**: 2026-03-28 (合并实现)
- **Description**:
  - 创建 `src/models/coat.ts`
  - 定义 `CAT_PALETTE` 颜色配置
  - 实现 `generateRandomCoat()` 函数
  - 实现 `generateRandomPersonality()` 函数
  - 确保底色和花纹色不相同
- **Acceptance Criteria**:
  - [ ] 生成 5 种底色 × 3 种花纹 = 15 种组合
  - [ ] 颜色搭配合理（不相同）
  - [ ] 单元测试通过

### P1-T5. 实现 PetContainer 浮动容器 [3h] ✅ DONE (合并到 P1-T3)
- **Type**: Feature
- **Priority**: High
- **Dependencies**: R2, P1-T3
- **Completed**: 2026-03-28 (合并实现)
- **Description**:
  - 创建 `src/ui/pet-container.ts`
  - 实现 `PetContainer` 类
  - 在 `document.body` 挂载浮动 div
  - 设置正确的 z-index 和 pointer-events
  - 监听 Obsidian 布局变化事件
- **Acceptance Criteria**:
  - [ ] 浮动容器始终在最上层
  - [ ] 不遮挡笔记内容的鼠标事件
  - [ ] 调整窗口大小时位置正确

### P1-T6. 实现 CatStorage 存储层 [3h] ✅ DONE (已完成)
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P1-T2
- **Completed**: 2026-03-28
- **Description**:
  - 创建 `src/storage/cat-storage.ts`
  - 实现 `CatStorage` 类
  - 实现 `loadCats()` 方法
  - 实现 `saveCats()` 方法
  - 处理文件读写错误
  - 创建 `workspace/pets/` 目录
- **Acceptance Criteria**:
  - [ ] 能成功读写 `workspace/pets/cats.json`
  - [ ] 文件不存在时返回空数组
  - [ ] 错误时抛出有意义的异常

### P1-T7. 实现新建猫咪命令 [2h] ✅ DONE (已完成)
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P1-T4, P1-T5, P1-T6
- **Completed**: 2026-03-28
- **Description**:
  - 创建 `src/commands/create-cat.ts`
  - 注册 `cat-pet:create-new-cat` 命令
  - 生成随机猫咪并显示
  - 保存到存储
  - 添加到 PetContainer
- **Acceptance Criteria**:
  - [ ] 命令面板显示「新建猫咪」
  - [ ] 执行后显示一只新猫咪
  - [ ] 猫咪数据保存到文件

---

## Phase 2: 行为系统
**Duration**: 2 天

### P2-T1. 实现 CatBehaviorEngine 状态机 [3h]
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P1-T2
- **Description**:
  - 创建 `src/engine/behavior-engine.ts`
  - 实现 `CatBehaviorEngine` 类
  - 定义状态转换规则
  - 实现 `update()` 主循环方法
  - 实现 `transitionTo()` 状态切换
- **Acceptance Criteria**:
  - [ ] 能正确管理 idle/walk/sleep 状态
  - [ ] 状态转换符合设计规则
  - [ ] 单元测试覆盖主要路径

### P2-T2. 实现行走动画 (8帧) [3h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P2-T1
- **Description**:
  - 创建 `src/renderer/animations.ts`
  - 定义行走动画帧数据
  - 在 `CatRenderer` 中添加行走渲染
  - 实现腿部摆动动画
  - 实现尾巴摆动动画
- **Acceptance Criteria**:
  - [ ] 行走动画有 8 帧
  - [ ] 帧率 12fps，流畅自然
  - [ ] 速度约 60px/s

### P2-T3. 实现待机动画 (4帧) + 眨眼 [2h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P2-T2
- **Description**:
  - 添加待机动画帧
  - 实现随机眨眼效果
  - 添加呼吸起伏效果
  - 实现耳朵微动
- **Acceptance Criteria**:
  - [ ] 待机动画有 4 帧
  - [ ] 随机眨眼（间隔 3-8 秒）
  - [ ] 整体效果生动

### P2-T4. 实现眼球跟随算法 [2h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P1-T3
- **Description**:
  - 创建 `src/engine/eye-tracking.ts`
  - 实现 `EyeTrackingEngine` 类
  - 计算鼠标相对于猫咪的角度
  - 限制眼球移动范围（±30度）
  - 平滑过渡，避免抖动
- **Acceptance Criteria**:
  - [ ] 眼球跟随鼠标移动
  - [ ] 移动范围限制在 ±30度
  - [ ] 延迟 < 50ms

### P2-T5. 实现睡眠检测和睡眠动画 [3h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P2-T1
- **Description**:
  - 实现用户活动检测（鼠标、键盘）
  - 5 分钟无操作触发睡眠
  - 创建睡眠动画（4帧呼吸效果）
  - 睡眠时减少主动行为
- **Acceptance Criteria**:
  - [ ] 准确检测用户活动
  - [ ] 5 分钟后自动入睡
  - [ ] 睡眠动画有呼吸起伏效果

### P2-T6. 实现唤醒机制 [1h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P2-T5
- **Description**:
  - 点击猫咪唤醒
  - 投喂时唤醒
  - 唤醒动画（从睡眠到 idle 的过渡）
  - 重置睡眠计时器
- **Acceptance Criteria**:
  - [ ] 点击唤醒
  - [ ] 投喂唤醒
  - [ ] 唤醒后恢复正常行为

---

## Phase 3: 交互系统
**Duration**: 2 天

### P3-T1. 实现右键菜单 [2h]
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P1-T5
- **Description**:
  - 创建 `src/ui/context-menu.ts`
  - 实现 `CatContextMenu` 类
  - 菜单项：开始对话、投喂、改名、送走
  - 绑定到 Canvas 右键事件
  - 使用 Obsidian `Menu` API
- **Acceptance Criteria**:
  - [ ] 右键猫咪显示菜单
  - [ ] 菜单项功能正常
  - [ ] 样式与 Obsidian 一致

### P3-T2. 实现饱食度系统 [2h]
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P1-T2
- **Description**:
  - 在 `CatStats` 中管理饱食度
  - 实现在线时饱食度自然下降（每分钟 -0.1）
  - 饱食度影响猫咪活跃度
  - 饱食度 ≤ 0 时强制睡眠
- **Acceptance Criteria**:
  - [ ] 饱食度在 0-100 范围
  - [ ] 自然下降逻辑正确
  - [ ] 影响猫咪行为

### P3-T3. 实现投喂动画 [2h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P3-T2
- **Description**:
  - 创建投喂效果（小鱼干图标）
  - 猫咪进入 eating 状态（2秒）
  - 饱食度增加 20
  - 播放进食动画
- **Acceptance Criteria**:
  - [ ] 投喂后显示小鱼干
  - [ ] 猫咪进入 eating 状态
  - [ ] 饱食度正确增加

### P3-T4. 实现被摸反馈动画 [2h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P2-T1
- **Description**:
  - 左键点击猫咪触发抚摸
  - 进入 petted 状态（2秒）
  - 播放开心动画（4帧）
  - 显示爱心气泡效果
  - 心情值增加
- **Acceptance Criteria**:
  - [ ] 点击触发抚摸
  - [ ] 开心动画播放
  - [ ] 心情值增加

### P3-T5. 实现改名功能 [2h]
- **Type**: Feature
- **Priority**: Low
- **Dependencies**: P3-T1
- **Description**:
  - 右键菜单「改名」选项
  - 弹出输入框
  - 验证名称长度（1-20 字符）
  - 保存新名称
- **Acceptance Criteria**:
  - [ ] 能修改猫咪名称
  - [ ] 验证输入有效性
  - [ ] 保存到存储

### P3-T6. 实现送走功能 [1h]
- **Type**: Feature
- **Priority**: Low
- **Dependencies**: P3-T1
- **Description**:
  - 右键菜单「送走」选项
  - 确认对话框
  - 从 PetContainer 移除
  - 从存储删除
  - 删除对话历史
- **Acceptance Criteria**:
  - [ ] 确认后删除
  - [ ] 清理所有相关数据
  - [ ] 不再显示该猫咪

---

## Phase 4: 对话系统
**Duration**: 2 天

### P4-T1. 实现 ChatModal 对话框 UI [3h]
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P3-T1
- **Description**:
  - 创建 `src/ui/chat-modal.ts`
  - 继承 Obsidian `Modal`
  - 实现消息列表显示
  - 实现输入框和发送按钮
  - 样式美化
- **Acceptance Criteria**:
  - [ ] 对话框样式美观
  - [ ] 消息列表可滚动
  - [ ] 输入框功能正常

### P4-T2. 实现模式切换 [2h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P4-T1
- **Description**:
  - 对话框顶部添加模式切换开关
  - 「🐱 陪伴模式」和「🤖 AI 模式」
  - 保存当前模式到对话历史
  - 切换时显示提示
- **Acceptance Criteria**:
  - [ ] 能切换模式
  - [ ] 模式状态持久化
  - [ ] UI 反馈清晰

### P4-T3. 实现陪伴模式预设回复库 [2h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P4-T2
- **Description**:
  - 创建 `src/data/companion-replies.ts`
  - 定义 10+ 种预设回复
  - 按关键词匹配回复
  - 默认随机回复
  - 添加猫咪语气词（喵~）
- **Acceptance Criteria**:
  - [ ] 10+ 种不同回复
  - [ ] 回复有猫咪特色
  - [ ] 随机触发自然

### P4-T4. 实现 Claudian API 对接 [3h]
- **Type**: Feature
- **Priority**: High
- **Dependencies**: R1, P4-T2
- **Description**:
  - 创建 `src/api/claudian-adapter.ts`
  - 实现 `ClaudianAdapter` 类
  - 检查 Claudian 是否可用
  - 调用 `sendMessage` API
  - 处理 API 错误
  - 降级到陪伴模式
- **Acceptance Criteria**:
  - [ ] 能检测 Claudian 状态
  - [ ] 成功调用 API 获取回复
  - [ ] 错误时优雅降级

### P4-T5. 实现对话历史存储/加载 [2h]
- **Type**: Feature
- **Priority**: High
- **Dependencies**: P1-T6, P4-T1
- **Description**:
  - 创建 `src/storage/chat-storage.ts`
  - 实现 `ChatStorage` 类
  - 按猫咪 ID 存储对话历史
  - 限制最多 100 条消息
  - 自动保存机制
- **Acceptance Criteria**:
  - [ ] 能保存和加载对话历史
  - [ ] 限制 100 条消息
  - [ ] 按猫咪隔离

### P4-T6. 实现历史消息展示 [2h]
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P4-T5
- **Description**:
  - 对话框打开时加载历史
  - 区分 user/cat/ai 消息样式
  - 显示时间戳
  - 滚动到最新消息
- **Acceptance Criteria**:
  - [ ] 历史消息正确显示
  - [ ] 不同角色样式区分
  - [ ] 自动滚动到底部

---

## Phase 5: 多猫管理与优化 ⏸️ 暂停开发
**Duration**: 1.5 天（剩余约 1 天）

### P5-T1. 多猫咪容器管理优化 [3h] ✅ DONE (基础实现)
- **Type**: Feature
- **Priority**: Medium
- **Dependencies**: P1-T5
- **Completed**: 2026-03-29 (基础实现，性能优化待 P5-T3)
  - 优化 PetContainer 支持多只猫咪
  - 猫咪间碰撞检测（避免重叠）
  - 统一动画帧调度
  - 性能监控
- **Acceptance Criteria**:
  - [ ] 支持多只猫咪同时显示
  - [ ] 猫咪不重叠
  - [ ] 10 只猫咪性能正常

### P5-T2. 位置持久化实现 [2h] ⏳ TODO
- **Type**: Feature
- **Priority**: Low
- **Dependencies**: P1-T6
- **Status**: 待开发
- **Description**:
  - 定期保存猫咪位置
  - 重启后恢复位置
  - 窗口大小变化时调整位置
  - 确保位置在可视区域内
- **Acceptance Criteria**:
  - [ ] 位置持久化保存
  - [ ] 重启后恢复
  - [ ] 不会出现在屏幕外

### P5-T3. 渲染性能优化 [3h] ⏳ TODO
- **Type**: Optimization
- **Priority**: High
- **Dependencies**: P5-T1
- **Status**: 待开发
- **Description**:
  - 使用 `requestAnimationFrame` 优化
  - 离屏 Canvas 预渲染
  - 减少不必要的重绘
  - 性能监控和警告
- **Acceptance Criteria**:
  - [ ] 单猫咪 < 5ms/帧
  - [ ] 10 只猫咪 < 20ms/帧
  - [ ] 帧率稳定在 30fps+

### P5-T4. 实现设置面板 [2h] ✅ DONE (基础实现)
- **Type**: Feature
- **Priority**: Low
- **Dependencies**: P1-T1
- **Completed**: 2026-03-29 (基础功能完成，统计功能待增强)
  - 完善 `settings.ts`
  - 添加「显示/隐藏猫咪」选项
  - 添加「默认对话模式」选项
  - 添加「最大猫咪数量」选项
  - 显示当前猫咪列表
- **Acceptance Criteria**:
  - [ ] 设置面板功能完整
  - [ ] 选项即时生效
  - [ ] 保存到存储

### P5-T5. 性能警告提示 [1h] ⏳ TODO
- **Type**: Feature
- **Priority**: Low
- **Dependencies**: P5-T3
- **Status**: 待开发
- **Description**:
  - 创建超过 10 只猫时显示警告
  - 帧率过低时提示
  - 提供优化建议
  - 可关闭的提示框
- **Acceptance Criteria**:
  - [ ] 超过 10 只猫显示警告
  - [ ] 性能问题提示
  - [ ] 提示可关闭

---

## Phase 6: 测试与发布 ⏸️ 暂停开发
**Duration**: 1 天（待开始）

### P6-T1. 功能测试 (所有场景) [3h] ⏳ TODO
- **Type**: Testing
- **Priority**: High
- **Dependencies**: P5-T4
- **Status**: 待执行
- **Description**:
  - 按 User Scenarios 测试
  - 边界情况测试
  - 错误处理测试
  - 跨平台测试（Windows/Mac/Linux）
- **Acceptance Criteria**:
  - [ ] 所有 Scenario 通过
  - [ ] 边界情况处理正确
  - [ ] 无明显 bug

### P6-T2. 性能测试 (10 只猫咪) [2h] ⏳ TODO
- **Type**: Testing
- **Priority**: High
- **Dependencies**: P5-T3
- **Status**: 待执行
- **Description**:
  - 创建 10 只猫咪测试
  - DevTools Performance 分析
  - 内存占用监控
  - 长时间运行测试
- **Acceptance Criteria**:
  - [ ] 10 只猫咪帧率 > 30fps
  - [ ] 内存占用 < 100MB
  - [ ] 24 小时运行无内存泄漏

### P6-T3. README 文档 [2h] ✅ DONE
- **Type**: Documentation
- **Priority**: Medium
- **Dependencies**: None
- **Completed**: 2026-03-29
- **Description**:
  - 编写插件介绍
  - 安装说明
  - 使用指南
  - 功能截图
  - 更新日志
- **Acceptance Criteria**:
  - [ ] README 内容完整
  - [ ] 有截图展示
  - [ ] 安装步骤清晰

### P6-T4. 打包构建 [1h] ✅ DONE
- **Type**: Release
- **Priority**: High
- **Dependencies**: P6-T1, P6-T2, P6-T3
- **Completed**: 2026-03-29
- **Description**:
  - 生产构建 (`npm run build`)
  - 验证构建产物
  - 创建 release tag
  - 准备发布到社区
- **Acceptance Criteria**:
  - [ ] 构建成功
  - [ ] 产物在 Obsidian 中可用
  - [ ] 版本号正确

---

## Task Dependency Graph

```
Phase 0:
  R1 ──┐
       ├──> Phase 1
  R2 ──┘

Phase 1:
  P1-T1 ──> P1-T2 ──> P1-T3 ──> P1-T4 ──┐
                                        ├──> P1-T7
  P1-T5 ────────────────────────────────┤
  P1-T6 ────────────────────────────────┘

Phase 2:
  P2-T1 ──> P2-T2 ──> P2-T3
  P2-T4 (独立)
  P2-T5 ──> P2-T6

Phase 3:
  P3-T1 ──> P3-T5, P3-T6
  P3-T2 ──> P3-T3
  P3-T4 (依赖 P2-T1)

Phase 4:
  P4-T1 ──> P4-T2 ──> P4-T3, P4-T4
  P4-T5 ──> P4-T6

Phase 5:
  P5-T1 ──> P5-T3
  P5-T2 (独立)
  P5-T4 (独立)
  P5-T5 (依赖 P5-T3)

Phase 6:
  所有测试和发布任务依赖前面所有功能完成
```

---

## Notes

- 优先级说明: High = 必须完成, Medium = 应该完成, Low = 可以延后
- 每个任务完成后需更新此文档中的复选框
- 遇到阻塞及时更新依赖关系
