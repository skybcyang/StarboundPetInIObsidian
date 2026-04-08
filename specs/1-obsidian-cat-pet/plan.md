# Implementation Plan: Obsidian 宠物插件

**Short Name**: 1-obsidian-cat-pet  
**Created**: 2026-03-28  
**Status**: Draft  

---

## Technical Context

### Technology Stack
- **Runtime**: Obsidian Desktop App (Electron-based)
- **Framework**: Obsidian Plugin API
- **Language**: TypeScript 4.x+
- **Build Tool**: esbuild (Obsidian 官方推荐)
- **Key Libraries**: 
  - Obsidian API (Modal, Menu, Plugin, Setting)
  - Canvas API (猫咪渲染)
  - Native File System API (持久化存储)

### Existing System
- **目标平台**: Obsidian 笔记软件 (桌面版)
- **插件架构**: 基于 Obsidian 官方插件系统
- **已有依赖**: 
  - Claudian 插件 (AI 对话依赖，可选)
- **集成点**: 
  - 浮动容器叠加在 Obsidian 工作区
  - 命令面板注册自定义命令
  - 设置面板注册配置项

### Constraints
- **性能**: 单猫咪 < 5ms/帧，10 只猫咪 < 20ms/帧
- **内存**: 单猫咪 < 10MB（含历史记录）
- **存储**: 写入 vault 的 workspace/pets/ 目录
- **兼容性**: Obsidian v0.15.0+
- **渲染**: Canvas 2D 上下文，128x128px 像素风格

### Unknowns (Research Needed)
- [NEEDS CLARIFICATION: Claudian 插件的 API 具体暴露方式]
- [NEEDS CLARIFICATION: Obsidian 浮动容器的最佳实践]

---

## Constitution Check

### Design Principles Applied
- [x] **单一职责**: 每个模块只负责单一功能（渲染、行为、存储分离）
- [x] **可扩展性**: 行为状态机设计，方便添加新状态
- [x] **降级优雅**: Claudian 不可用时自动切换到陪伴模式
- [x] **性能优先**: requestAnimationFrame 驱动动画，避免 DOM 操作

### Gate Evaluation
| Gate | Status | Evidence |
|------|--------|----------|
| 技术可行性 | ✅ | Canvas + Obsidian API 成熟方案 |
| 性能可接受 | ✅ | 128x128 像素渲染开销低 |
| 依赖可控 | ✅ | 仅依赖 Obsidian API 和可选 Claudian |
| 维护性 | ✅ | 模块化设计，职责清晰 |

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Obsidian Workspace                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PetContainer (Floating)                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   │
│  │  │ CatView │  │ CatView │  │ CatView │  ...        │   │
│  │  │(Canvas) │  │(Canvas) │  │(Canvas) │             │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘             │   │
│  │       │            │            │                   │   │
│  │       └────────────┴────────────┘                   │   │
│  │              CatBehaviorEngine                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │ ChatModal   │  │ ContextMenu │  │ SettingsPanel   │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    ▼               ▼
            ┌──────────────┐ ┌──────────────┐
            │ CatStorage   │ │ ChatStorage  │
            │ (cats.json)  │ │ ({id}.json)  │
            └──────────────┘ └──────────────┘
```

### Component Breakdown

#### Component 1: CatRenderer (渲染层)
**Responsibility**: 使用 Canvas 绘制像素风格猫咪
**Interface**: 
```typescript
render(cat: Cat, frame: number, ctx: CanvasRenderingContext2D): void
updateEyePosition(mouseX: number, mouseY: number): void
```
**Dependencies**: Canvas 2D API, Cat 数据模型

#### Component 2: CatBehaviorEngine (行为引擎)
**Responsibility**: 管理猫咪状态机，驱动行为变化
**Interface**:
```typescript
update(cat: Cat, deltaTime: number): void
transitionTo(cat: Cat, newState: CatState): void
```
**Dependencies**: Cat 状态定义，时间/用户活动检测

#### Component 3: PetContainer (容器管理)
**Responsibility**: 管理浮动容器，协调多只猫咪
**Interface**:
```typescript
addCat(cat: Cat): void
removeCat(catId: string): void
updateAll(deltaTime: number): void
```
**Dependencies**: Obsidian Workspace, CatRenderer

#### Component 4: ChatModal (对话界面)
**Responsibility**: 对话框 UI，模式切换，历史显示
**Interface**:
```typescript
open(cat: Cat): void
sendMessage(content: string): void
toggleMode(): void
```
**Dependencies**: Obsidian Modal, ChatStorage, Claudian API

#### Component 5: Storage Layer (存储层)
**Responsibility**: 猫咪数据和对话历史的持久化
**Interface**:
```typescript
loadCats(): Cat[]
saveCats(cats: Cat[]): void
loadChatHistory(catId: string): ChatMessage[]
saveChatHistory(catId: string, messages: ChatMessage[]): void
```
**Dependencies**: Obsidian Vault API, File System

### Data Flow

```
1. 用户新建猫咪
   Command → CatFactory.create() → CatStorage.save() → PetContainer.add() → CatRenderer.render()

2. 猫咪行为更新
   requestAnimationFrame → CatBehaviorEngine.update() → Cat.position/state 更新 → CatRenderer.render()

3. 用户投喂
   ContextMenu → Cat.feed() → CatStats.satiety 更新 → Cat.transitionTo('eating') → CatStorage.save()

4. AI 对话
   ChatModal.sendMessage() → ClaudianAPI.call() → ChatStorage.save() → UI 显示回复

5. 持久化
   Auto-save trigger → CatStorage.save() / ChatStorage.save() → vault/workspace/pets/
```

---

## Phase Breakdown

### Phase 0: Research & Foundation
**Goal**: 解决技术未知项，确定实现方案
**Duration**: 0.5 天

**Deliverables**:
- [ ] research.md - Claudian API 调研
- [ ] 技术决策确认 - 浮动容器方案

**Tasks**:
| ID | Task | Est. |
|----|------|------|
| R1 | 调研 Claudian 插件 API 可用性 | 2h |
| R2 | 调研 Obsidian 浮动容器最佳实践 | 2h |

---

### Phase 1: 核心框架 (MVP)
**Goal**: 完成基础框架，能显示一只静态猫咪
**Prerequisites**: Phase 0 complete
**Duration**: 2 天

**Deliverables**:
- [ ] data-model.md - 完整数据模型定义
- [ ] 插件基础结构 (manifest.json, main.ts)
- [ ] 猫咪渲染器 (基础形状 + 花色)
- [ ] 浮动容器管理
- [ ] 存储层实现

**Tasks**:
| ID | Task | Est. |
|----|------|------|
| P1-T1 | 创建插件基础结构 | 2h |
| P1-T2 | 实现 Cat 数据模型 | 2h |
| P1-T3 | 实现 Canvas 猫咪渲染器（静态） | 4h |
| P1-T4 | 实现花色生成算法 | 2h |
| P1-T5 | 实现 PetContainer 浮动容器 | 3h |
| P1-T6 | 实现 CatStorage 存储层 | 3h |
| P1-T7 | 实现新建猫咪命令 | 2h |

---

### Phase 2: 行为系统
**Goal**: 猫咪动起来，有基本行为
**Prerequisites**: Phase 1 complete
**Duration**: 2 天

**Deliverables**:
- [ ] 有限状态机实现
- [ ] 游走动画 (8帧)
- [ ] 眼球跟随鼠标
- [ ] 睡眠/唤醒机制

**Tasks**:
| ID | Task | Est. |
|----|------|------|
| P2-T1 | 实现 CatBehaviorEngine 状态机 | 3h |
| P2-T2 | 实现行走动画 (8帧) | 3h |
| P2-T3 | 实现待机动画 (4帧) + 眨眼 | 2h |
| P2-T4 | 实现眼球跟随算法 | 2h |
| P2-T5 | 实现睡眠检测和睡眠动画 | 3h |
| P2-T6 | 实现唤醒机制 | 1h |

---

### Phase 3: 交互系统
**Goal**: 用户能与猫咪互动
**Prerequisites**: Phase 2 complete
**Duration**: 2 天

**Deliverables**:
- [ ] 右键菜单
- [ ] 投喂系统 (饱食度)
- [ ] 被摸反馈动画
- [ ] 改名/送走功能

**Tasks**:
| ID | Task | Est. |
|----|------|------|
| P3-T1 | 实现右键菜单 | 2h |
| P3-T2 | 实现饱食度系统 | 2h |
| P3-T3 | 实现投喂动画 | 2h |
| P3-T4 | 实现被摸反馈动画 | 2h |
| P3-T5 | 实现改名功能 | 2h |
| P3-T6 | 实现送走功能 | 1h |

---

### Phase 4: 对话系统
**Goal**: 双模式对话功能
**Prerequisites**: Phase 3 complete
**Duration**: 2 天

**Deliverables**:
- [ ] ChatModal UI
- [ ] 陪伴模式预设回复
- [ ] AI 模式对接 Claudian
- [ ] 对话历史存储

**Tasks**:
| ID | Task | Est. |
|----|------|------|
| P4-T1 | 实现 ChatModal 对话框 UI | 3h |
| P4-T2 | 实现模式切换 | 2h |
| P4-T3 | 实现陪伴模式预设回复库 | 2h |
| P4-T4 | 实现 Claudian API 对接 | 3h |
| P4-T5 | 实现对话历史存储/加载 | 2h |
| P4-T6 | 实现历史消息展示 | 2h |

---

### Phase 5: 多猫管理与优化
**Goal**: 支持多只猫咪，性能优化
**Prerequisites**: Phase 4 complete
**Duration**: 1.5 天

**Deliverables**:
- [ ] 多猫咪管理
- [ ] 位置持久化
- [ ] 性能优化
- [ ] 设置面板

**Tasks**:
| ID | Task | Est. |
|----|------|------|
| P5-T1 | 多猫咪容器管理优化 | 3h |
| P5-T2 | 位置持久化实现 | 2h |
| P5-T3 | 渲染性能优化 (requestAnimationFrame) | 3h |
| P5-T4 | 实现设置面板 | 2h |
| P5-T5 | 性能警告提示 | 1h |

---

### Phase 6: 测试与发布
**Goal**: 确保质量，发布插件
**Prerequisites**: Phase 5 complete
**Duration**: 1 天

**Deliverables**:
- [ ] 功能测试
- [ ] 性能测试
- [ ] 文档完善
- [ ] 打包发布

**Tasks**:
| ID | Task | Est. |
|----|------|------|
| P6-T1 | 功能测试 (所有场景) | 3h |
| P6-T2 | 性能测试 (10 只猫咪) | 2h |
| P6-T3 | README 文档 | 2h |
| P6-T4 | 打包构建 | 1h |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Canvas 性能不足 | Med | Med | 使用离屏 Canvas，限制渲染频率 |
| Claudian API 不稳定 | Med | High | 封装 API 层，优雅降级 |
| 多猫咪卡顿 | Low | Med | 性能监控，自动隐藏部分猫咪 |
| 存储权限问题 | Low | Med | 降级内存模式，提示用户 |

---

## Rollback Plan

1. **功能回退**: 禁用插件即可完全移除所有功能
2. **数据回退**: 删除 `workspace/pets/` 目录清除所有数据
3. **版本回退**: 保留上一版本插件备份，可随时降级

---

## Appendix

### A. Research Findings
See [research.md](research.md)

### B. Data Model
See [data-model.md](data-model.md)

### C. API Contracts
See [contracts/](./contracts/)

### D. Quick Start
See [quickstart.md](quickstart.md)
