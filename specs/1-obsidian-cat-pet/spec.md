# Feature Specification: Obsidian 宠物插件

**Short Name**: obsidian-cat-pet  
**Created**: 2026-03-28  
**Status**: Draft  

---

## 1. Overview

### 1.1 Feature Summary
为 Obsidian 笔记软件开发一款宠物插件，在编辑器界面中显示可爱的像素风格猫咪。猫咪会在屏幕边缘游走、与用户互动，并支持两种对话模式：陪伴模式（预设回复）和 AI 模式（对接 Claudian 插件）。用户可以投喂猫咪、与其对话，并通过右键菜单管理多只猫咪。

### 1.2 User Value
- **情感陪伴**：在长时间写作/笔记整理时提供轻松的互动体验
- **减压放松**：可爱的像素猫咪和简单互动帮助缓解工作压力
- **智能助手**：通过 AI 模式让猫咪协助笔记整理、提供灵感
- **养成乐趣**：简单的饱食度系统增加持续使用的动力

### 1.3 Scope

**In Scope:**
- 像素风格猫咪渲染（128x128px，32-bit 色彩）
- 多花色猫咪生成系统（底色+花纹色组合）
- 猫咪行为：游走、停留、睡眠、被摸反馈
- 眼球跟随鼠标移动
- 投喂系统（饱食度 0-100）
- 右键菜单管理（对话、投喂、改名、送走）
- 双模式对话系统（陪伴模式 + AI 模式）
- 对话历史持久化存储
- 多猫咪管理（不限量）
- 位置记忆（全局共享）

**Out of Scope:**
- 其他宠物类型（狗、鸟等）
- 复杂的养成机制（生病、成长、繁殖）
- 社交功能（分享猫咪、好友互动）
- 离线 AI 能力
- 移动端适配

---

## 2. User Scenarios & Testing

### 2.1 Primary User Flows

#### Scenario 1: 新建第一只猫咪
**Given** 用户刚安装插件  
**When** 用户执行「新建猫咪」命令  
**Then** 系统随机生成一只带花色的猫咪，显示在屏幕底部  

**Acceptance Criteria:**
- [ ] 猫咪生成时有随机的花色组合（底色+花纹色+眼睛颜色）
- [ ] 猫咪默认名称为「咪咪」+ 序号，用户可立即修改
- [ ] 猫咪出现在屏幕底部随机位置
- [ ] 猫咪立即开始游走行为

#### Scenario 2: 与猫咪互动
**Given** 猫咪在屏幕上显示  
**When** 用户移动鼠标  
**Then** 猫咪眼球跟随鼠标方向转动  

**Acceptance Criteria:**
- [ ] 眼球移动范围限制在合理角度（±30度）
- [ ] 移动平滑不卡顿
- [ ] 睡眠状态下眼球不跟随

#### Scenario 3: 投喂猫咪
**Given** 猫咪当前饱食度低于 100  
**When** 用户右键猫咪选择「投喂」  
**Then** 饱食度增加 20，猫咪播放进食动画  

**Acceptance Criteria:**
- [ ] 饱食度上限为 100
- [ ] 投喂后猫咪进入「eating」状态 2 秒
- [ ] 饱食度变化实时显示（可选小气泡）

#### Scenario 4: 开始 AI 对话
**Given** 用户想要咨询问题  
**When** 用户右键猫咪选择「开始对话」，切换到 AI 模式  
**Then** 弹出对话框，用户输入问题后猫咪通过 Claudian 回复  

**Acceptance Criteria:**
- [ ] 对话框顶部有模式切换按钮（陪伴/AI）
- [ ] AI 模式调用 Claudian 插件 API
- [ ] 对话历史按猫咪持久化保存
- [ ] 支持查看过往对话记录

#### Scenario 5: 猫咪进入睡眠
**Given** 用户 5 分钟无操作且猫咪活跃度低  
**When** 猫咪进入睡眠状态  
**Then** 猫咪播放睡眠动画，呼吸起伏  

**Acceptance Criteria:**
- [ ] 睡眠动画包含呼吸效果（4 帧循环）
- [ ] 点击或投喂可唤醒猫咪
- [ ] 睡眠时不进行游走行为

### 2.2 Edge Cases & Error Handling

| Case | Trigger | Expected Behavior |
|------|---------|-------------------|
| Claudian 插件未安装 | 用户尝试 AI 对话 | 提示「Claudian 插件未安装，已切换为陪伴模式」 |
| 饱食度归零 | 长时间未投喂 | 猫咪进入睡眠状态，减少主动行为 |
| 创建超过 10 只猫 | 用户不断新建 | 继续允许创建，但提供性能警告提示 |
| 存储写入失败 | 磁盘权限问题 | 降级到内存模式，提示用户检查权限 |
| Obsidian 窗口大小变化 | 用户调整窗口 | 猫咪位置自动适应，保持在可视区域内 |

---

## 3. Functional Requirements

### 3.1 Core Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | 猫咪以 128x128 像素 Canvas 渲染 | Must | 像素清晰，支持透明背景，不遮挡笔记内容 |
| FR-002 | 支持多种花色组合 | Must | 至少 5 种底色 × 3 种花纹 = 15 种组合 |
| FR-003 | 猫咪在屏幕底部游走 | Must | 速度 60px/s，有行走动画（8 帧） |
| FR-004 | 眼球跟随鼠标移动 | Must | 延迟 < 50ms，角度计算准确 |
| FR-005 | 右键菜单管理猫咪 | Must | 菜单项：开始对话、投喂、改名、送走 |
| FR-006 | 饱食度系统 | Must | 范围 0-100，影响猫咪活跃度 |
| FR-007 | 睡眠唤醒机制 | Must | 5 分钟无操作后入睡，点击/投喂唤醒 |
| FR-008 | 陪伴模式对话 | Must | 10+ 种预设回复，随机触发 |
| FR-009 | AI 模式对话 | Must | 对接 Claudian 插件，带上下文 |
| FR-010 | 对话历史存储 | Must | 按猫咪 ID 存储，支持查看历史 |
| FR-011 | 多猫咪管理 | Should | 支持新建/删除，数量不限 |
| FR-012 | 位置持久化 | Should | 记住猫咪位置，重启后恢复 |

### 3.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | 渲染性能 | 单猫咪 < 5ms/帧，10 只猫咪 < 20ms/帧 |
| NFR-002 | 内存占用 | 单猫咪 < 10MB（含历史记录） |
| NFR-003 | 启动加载 | 插件初始化 < 500ms |
| NFR-004 | 存储可靠性 | 自动保存，崩溃后数据不丢失 |
| NFR-005 | 界面响应 | 右键菜单 < 100ms，对话框 < 200ms |

---

## 4. Success Criteria

### 4.1 Measurable Outcomes

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| 用户日均互动次数 | 0 | > 5 次/天 | 本地事件统计 |
| 猫咪平均存活时间 | N/A | > 7 天 | 创建到删除的时间 |
| AI 对话使用率 | 0 | > 30% | 陪伴模式 vs AI 模式比例 |
| 插件启用留存率 | N/A | > 80% 7 日留存 | 启用后 7 天仍保持启用 |

### 4.2 Qualitative Goals
- 用户反馈「猫咪很可爱，工作时看到心情变好」
- AI 模式回复被认为「有帮助」或「有趣」
- 用户愿意主动分享猫咪截图

---

## 5. Key Entities

### 5.1 Data Models

```typescript
// 猫咪
Cat {
  id: string              // 唯一标识
  name: string            // 名字
  coat: CoatPattern       // 花色
  personality: Personality // 性格
  state: CatState         // 当前状态
  position: Position      // 位置
  stats: CatStats         // 状态数值
  createdAt: string       // 创建时间
}

// 花色
CoatPattern {
  baseColor: string       // 底色 #RRGGBB
  patternColor: string    // 花纹色
  pattern: 'solid' | 'tabby' | 'bicolor' | 'calico'
  eyeColor: string        // 眼睛颜色
}

// 性格
Personality {
  activity: number        // 活跃度 0-1
  sociability: number     // 社交性 0-1
  sleepiness: number      // 嗜睡度 0-1
}

// 状态数值
CatStats {
  satiety: number         // 饱食度 0-100
  mood: number            // 心情值 0-100
  totalOnlineTime: number // 累计在线分钟
  lastFedAt: string       // 上次投喂时间
}

// 对话记录
ChatMessage {
  id: string
  role: 'user' | 'cat' | 'ai'
  content: string
  timestamp: string
}
```

### 5.2 User Types
- **笔记写作者**：主要用户，长时间在 Obsidian 中写作，需要陪伴
- **知识整理者**：整理笔记库，偶尔与猫咪互动解压
- **AI 助手使用者**：主要通过 AI 模式获取帮助

---

## 6. Assumptions & Dependencies

### 6.1 Assumptions
- 用户使用桌面版 Obsidian（支持 Canvas 和 DOM 操作）
- 用户有权限写入 vault 的 workspace/pets/ 目录
- Claudian 插件 API 可访问（如果用户选择 AI 模式）
- 用户偏好像素风格而非写实风格

### 6.2 Dependencies
- **Obsidian API**: 插件框架、Modal、Menu、Settings
- **Claudian 插件**: AI 对话功能依赖（可选）
- **Canvas API**: 猫咪渲染
- **File System**: 持久化存储

### 6.3 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Canvas 性能问题（多猫咪） | Med | Med | 限制同时渲染数量，优化绘制频率 |
| Claudian API 不可用 | Med | High | 优雅降级为纯陪伴模式 |
| 用户觉得猫咪干扰工作 | Low | Med | 提供隐藏/显示切换命令 |
| 存储空间不足 | Low | Low | 限制单猫咪历史记录条数 |

---

## 7. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| 是否需要猫咪声音？ | Open | 目前无此计划，但可扩展 |
| 是否支持导入/导出猫咪？ | Open | 便于备份和分享 |
| 是否支持自定义猫咪外观？ | Open | 高级功能，后期考虑 |
