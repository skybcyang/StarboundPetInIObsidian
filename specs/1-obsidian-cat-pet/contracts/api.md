# API Contracts: Obsidian 宠物插件

**Version**: 1.0  
**Date**: 2026-03-28

---

## Overview

本插件为 Obsidian 内部插件，不提供外部 HTTP API。以下定义的是内部模块间的接口契约。

---

## Commands (Obsidian Command API)

### Create New Cat
创建一只新猫咪

```typescript
// Command ID: cat-pet:create-new-cat
interface CreateCatCommand {
  id: 'cat-pet:create-new-cat';
  name: '新建猫咪';
  callback: () => void;
}

// Effect: 打开 CreateCatModal，生成随机猫咪
```

### Toggle Visibility
切换猫咪显示/隐藏

```typescript
// Command ID: cat-pet:toggle-visibility
interface ToggleVisibilityCommand {
  id: 'cat-pet:toggle-visibility';
  name: '显示/隐藏猫咪';
  callback: () => void;
}

// Effect: 切换 PetContainer 的 display 状态
```

### Feed All Cats
投喂所有猫咪

```typescript
// Command ID: cat-pet:feed-all
interface FeedAllCommand {
  id: 'cat-pet:feed-all';
  name: '投喂所有猫咪';
  callback: () => void;
}

// Effect: 所有猫咪 satiety += 20
```

---

## Internal APIs

### CatStorage

#### loadCats
加载所有猫咪数据

```typescript
interface LoadCatsRequest {
  // 无参数
}

interface LoadCatsResponse {
  cats: Cat[];
  success: boolean;
  error?: string;
}

// 失败场景: 文件不存在返回空数组，其他错误返回 error
```

#### saveCats
保存猫咪数据

```typescript
interface SaveCatsRequest {
  cats: Cat[];
}

interface SaveCatsResponse {
  success: boolean;
  error?: string;
}
```

### ChatStorage

#### loadChatHistory
加载单只猫咪的对话历史

```typescript
interface LoadChatHistoryRequest {
  catId: string;
}

interface LoadChatHistoryResponse {
  messages: ChatMessage[];
  mode: 'companion' | 'ai';
  success: boolean;
  error?: string;
}
```

#### saveChatHistory
保存对话历史

```typescript
interface SaveChatHistoryRequest {
  catId: string;
  messages: ChatMessage[];
  mode: 'companion' | 'ai';
}

interface SaveChatHistoryResponse {
  success: boolean;
  error?: string;
}
```

#### appendMessage
追加单条消息

```typescript
interface AppendMessageRequest {
  catId: string;
  message: ChatMessage;
}

interface AppendMessageResponse {
  success: boolean;
  error?: string;
}
```

### CatBehaviorEngine

#### update
更新猫咪状态（每帧调用）

```typescript
interface UpdateRequest {
  cat: Cat;
  deltaTime: number;  // 毫秒
  mousePosition: { x: number; y: number };
}

interface UpdateResponse {
  cat: Cat;  // 更新后的猫咪状态
  events: CatEvent[];  // 触发的事件
}

type CatEvent = 
  | { type: 'state_changed'; from: string; to: string }
  | { type: 'position_changed'; x: number; y: number }
  | { type: 'fed'; amount: number };
```

#### transitionTo
强制状态转换

```typescript
interface TransitionToRequest {
  cat: Cat;
  newState: CatState;
}

interface TransitionToResponse {
  success: boolean;
  cat: Cat;
}
```

### ClaudianAdapter

#### isAvailable
检查 Claudian 是否可用

```typescript
interface IsAvailableResponse {
  available: boolean;
  version?: string;
}
```

#### sendMessage
发送消息到 Claudian

```typescript
interface SendMessageRequest {
  message: string;
  context: ChatMessage[];  // 历史上下文
}

interface SendMessageResponse {
  success: boolean;
  response?: string;
  error?: string;
}

// 失败场景: 
// - Claudian 未安装: error = "Claudian plugin not installed"
// - Claudian 未启用: error = "Claudian plugin not enabled"
// - 网络错误: error = "Network error"
```

---

## UI Components

### CreateCatModal

**Purpose**: 新建猫咪对话框

**Inputs**:
```typescript
interface CreateCatModalProps {
  onCreate: (cat: Partial<Cat>) => void;
  onCancel: () => void;
}
```

**Outputs**:
- 生成随机猫咪数据
- 允许用户修改名称
- 可选：预览花色

### ChatModal

**Purpose**: 与猫咪对话

**Inputs**:
```typescript
interface ChatModalProps {
  cat: Cat;
  initialMode?: 'companion' | 'ai';
}
```

**Outputs**:
- 消息列表（用户 + 猫咪回复）
- 当前模式
- 发送消息事件

### ContextMenu

**Purpose**: 右键猫咪菜单

**Inputs**:
```typescript
interface ContextMenuProps {
  cat: Cat;
  position: { x: number; y: number };
}
```

**Actions**:
| Menu Item | Action |
|-----------|--------|
| 开始对话 | openChatModal(cat) |
| 投喂 | feedCat(cat) |
| 改名 | renameCat(cat) |
| 送走 | removeCat(cat) |

---

## Events

### Cat Events (内部事件总线)

```typescript
interface CatCreatedEvent {
  type: 'cat:created';
  cat: Cat;
}

interface CatRemovedEvent {
  type: 'cat:removed';
  catId: string;
}

interface CatStateChangedEvent {
  type: 'cat:state_changed';
  catId: string;
  from: string;
  to: string;
}

interface CatFedEvent {
  type: 'cat:fed';
  catId: string;
  amount: number;
  newSatiety: number;
}

interface MessageReceivedEvent {
  type: 'chat:message_received';
  catId: string;
  message: ChatMessage;
}
```

---

## Error Handling

### Error Codes

| Code | Description | Recovery |
|------|-------------|----------|
| STORAGE_READ_ERROR | 读取存储失败 | 使用内存模式，提示用户 |
| STORAGE_WRITE_ERROR | 写入存储失败 | 重试 3 次，失败则提示 |
| CLAUDIAN_NOT_FOUND | Claudian 未安装 | 切换到陪伴模式 |
| CLAUDIAN_API_ERROR | Claudian API 错误 | 显示错误，可重试 |
| INVALID_CAT_STATE | 无效的猫咪状态 | 重置为 idle 状态 |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```
