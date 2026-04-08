# Data Model: Obsidian 宠物插件

**Version**: 1.0  
**Date**: 2026-03-28

---

## Entity Overview

```
Cat (1) ────────< (N) ChatMessage
 │
 ├── CoatPattern (1:1)
 ├── Personality (1:1)
 ├── CatState (1:1)
 ├── Position (1:1)
 └── CatStats (1:1)
```

---

## Entities

### Cat (猫咪)

**Purpose**: 表示一只虚拟猫咪

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | 唯一标识，UUID v4 |
| name | string | Yes | 显示名称，默认「咪咪N」 |
| coat | CoatPattern | Yes | 花色配置 |
| personality | Personality | Yes | 性格参数 |
| state | CatState | Yes | 当前行为状态 |
| position | Position | Yes | 屏幕位置 |
| stats | CatStats | Yes | 状态数值 |
| createdAt | ISO8601 | Yes | 创建时间 |

**Validation Rules**:
- id: 必须唯一
- name: 1-20 字符
- createdAt: 合法日期字符串

**State Transitions**:
```
idle ──(timer)──> walk ──(arrive)──> idle
  │                                    │
  │                                    │
  └──(inactive 5min)──> sleep ──(click)──┘
```

---

### CoatPattern (花色)

**Purpose**: 定义猫咪外观

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| baseColor | hex | Yes | 底色，如 #FFA05C |
| patternColor | hex | Yes | 花纹色 |
| pattern | enum | Yes | solid / tabby / bicolor / calico |
| eyeColor | hex | Yes | 眼睛颜色 |

**Constraints**:
- baseColor ≠ patternColor（避免纯色无法区分）
- 所有颜色为 6 位 HEX 格式

---

### Personality (性格)

**Purpose**: 影响猫咪行为概率

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| activity | number | Yes | 活跃度 0.0-1.0，影响游走频率 |
| sociability | number | Yes | 社交性 0.0-1.0，影响跟随意愿 |
| sleepiness | number | Yes | 嗜睡度 0.0-1.0，影响入睡速度 |

**Constraints**:
- 所有值在 0.0-1.0 范围内
- 默认值：activity=0.5, sociability=0.5, sleepiness=0.3

---

### CatState (状态)

**Purpose**: 当前行为状态（变体类型）

**Variants**:

| Type | Fields | Description |
|------|--------|-------------|
| idle | since: number | 停留状态，时间戳 |
| walk | targetX: number | 游走状态，目标位置 |
| sleep | since: number | 睡眠状态，时间戳 |
| petted | since: number | 被摸状态，时间戳 |
| eating | - | 进食状态（固定2秒） |

---

### Position (位置)

**Purpose**: 猫咪在屏幕上的位置

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| x | number | Yes | 相对于视口的 X 坐标（像素） |
| y | number | Yes | 相对于视口的 Y 坐标（像素） |
| direction | enum | Yes | left / right，面向方向 |

**Constraints**:
- x: 0 - window.innerWidth
- y: 固定底部边距

---

### CatStats (状态数值)

**Purpose**: 可变化的数值状态

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| satiety | number | Yes | 饱食度 0-100 |
| mood | number | Yes | 心情值 0-100 |
| totalOnlineTime | number | Yes | 累计在线分钟数 |
| lastFedAt | ISO8601 | Yes | 上次投喂时间 |

**Constraints**:
- satiety: 0-100，投喂+20，自然下降
- mood: 0-100，互动增加
- totalOnlineTime: 只增不减

**Behavior Rules**:
- satiety ≤ 0: 强制进入 sleep 状态
- 每在线 1 分钟：satiety -= 0.1, totalOnlineTime += 1

---

### ChatMessage (对话消息)

**Purpose**: 单条对话记录

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | 唯一标识 |
| role | enum | Yes | user / cat / ai |
| content | string | Yes | 消息内容 |
| timestamp | ISO8601 | Yes | 发送时间 |

**Constraints**:
- content: 非空，最大 4000 字符
- role: user=用户输入, cat=陪伴模式回复, ai=AI模式回复

---

### ChatSession (对话会话)

**Purpose**: 按猫咪组织的对话历史

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| catId | string | Yes | 关联的猫咪 ID |
| messages | ChatMessage[] | Yes | 消息列表 |
| mode | enum | Yes | companion / ai，最后使用的模式 |

**Constraints**:
- 最多保留 100 条消息（滚动删除旧消息）

---

## Storage Schema

### cats.json
```json
{
  "version": "1.0",
  "cats": [
    {
      "id": "uuid",
      "name": "咪咪1",
      "coat": { "baseColor": "#FFA05C", "patternColor": "#CC6A00", "pattern": "tabby", "eyeColor": "#4A90E2" },
      "personality": { "activity": 0.6, "sociability": 0.7, "sleepiness": 0.3 },
      "state": { "type": "idle", "since": 1711523456789 },
      "position": { "x": 500, "y": 100, "direction": "right" },
      "stats": { "satiety": 80, "mood": 90, "totalOnlineTime": 120, "lastFedAt": "2026-03-28T10:00:00Z" },
      "createdAt": "2026-03-28T08:00:00Z"
    }
  ]
}
```

### {cat-id}.json (对话历史)
```json
{
  "catId": "uuid",
  "mode": "ai",
  "messages": [
    { "id": "msg-1", "role": "user", "content": "你好", "timestamp": "2026-03-28T10:00:00Z" },
    { "id": "msg-2", "role": "ai", "content": "喵~ 你好呀！", "timestamp": "2026-03-28T10:00:01Z" }
  ]
}
```

### settings.json
```json
{
  "enabled": true,
  "maxCats": 10,
  "showStats": false,
  "defaultMode": "companion"
}
```

---

## Indexes

- **cats.json**: 按 id 索引（内存中 Map）
- **{cat-id}.json**: 按 timestamp 索引（对话历史顺序）

---

## Migration Notes

**v1.0 → v1.1** (Future):
- 可能添加新字段：favoriteFood, accessories
- 保持向后兼容，新字段使用默认值
