# Quick Start: Obsidian 宠物插件开发

**Target**: 新加入的开发者  
**Prerequisites**: Node.js 18+, 熟悉 TypeScript 和 Obsidian 插件开发

---

## 5-Minute Setup

### 1. Clone & Install

```bash
cd obsidian-cat-pet
npm install
```

### 2. Development Mode

```bash
npm run dev
```

这会启动 esbuild watcher，自动编译到 `main.js`。

### 3. Install in Obsidian

1. 打开 Obsidian → 设置 → 社区插件
2. 关闭安全模式
3. 点击「加载已解压的插件」
4. 选择 `obsidian-cat-pet` 目录
5. 启用插件

---

## Project Structure

```
obsidian-cat-pet/
├── manifest.json          # 插件元数据
├── main.ts                # 插件入口
├── settings.ts            # 设置面板
├── styles.css             # 样式
├── src/
│   ├── models/            # 数据模型
│   │   ├── cat.ts
│   │   ├── coat.ts
│   │   └── chat.ts
│   ├── renderer/          # 渲染层
│   │   ├── cat-renderer.ts
│   │   └── animations.ts
│   ├── engine/            # 行为引擎
│   │   ├── behavior-engine.ts
│   │   └── eye-tracking.ts
│   ├── ui/                # 界面组件
│   │   ├── chat-modal.ts
│   │   ├── context-menu.ts
│   │   └── create-modal.ts
│   ├── storage/           # 存储层
│   │   ├── cat-storage.ts
│   │   └── chat-storage.ts
│   └── utils/             # 工具函数
│       └── random.ts
└── specs/                 # 需求文档
    └── 1-obsidian-cat-pet/
```

---

## Key Concepts

### 1. Cat (猫咪)

所有猫咪相关数据的中心实体。

```typescript
const cat: Cat = {
  id: generateUUID(),
  name: '咪咪1',
  coat: generateRandomCoat(),  // 随机花色
  personality: generateRandomPersonality(),
  state: { type: 'idle', since: Date.now() },
  position: { x: 500, y: 0, direction: 'right' },
  stats: { satiety: 100, mood: 100, totalOnlineTime: 0, lastFedAt: new Date().toISOString() },
  createdAt: new Date().toISOString()
};
```

### 2. State Machine (状态机)

猫咪行为由有限状态机驱动：

```
idle ──(timer)──> walk ──(arrive)──> idle
  │                                    │
  └──(inactive 5min)──> sleep ──(click)──┘
```

状态转换在 `CatBehaviorEngine` 中处理。

### 3. Rendering (渲染)

猫咪使用 Canvas 2D 渲染：

```typescript
// 简化示例
const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128;
const ctx = canvas.getContext('2d');

// 绘制身体
catRenderer.renderBody(ctx, cat.coat, frame);
// 绘制眼睛（跟随鼠标）
catRenderer.renderEyes(ctx, mouseX, mouseY);
```

### 4. Storage (存储)

数据存储在 vault 的 `workspace/pets/` 目录：

```
workspace/pets/
├── cats.json          # 所有猫咪
├── settings.json      # 插件设置
└── chat-history/
    └── {cat-id}.json  # 每只猫的对话历史
```

---

## Common Tasks

### 添加新猫咪花色

1. 编辑 `src/models/coat.ts`:
```typescript
export const CAT_PALETTE = {
  // ... 现有颜色
  siamese: { base: '#F5DEB3', pattern: '#8B4513' },  // 新增
};
```

2. 更新 `CatRenderer` 支持新的花纹样式。

### 添加新行为状态

1. 在 `src/models/cat.ts` 添加状态类型：
```typescript
type CatState = 
  | { type: 'idle'; since: number }
  | { type: 'walk'; targetX: number }
  | { type: 'sleep'; since: number }
  | { type: 'new_state'; ... };  // 新增
```

2. 在 `CatBehaviorEngine` 中处理状态逻辑。

3. 在 `CatRenderer` 中添加渲染逻辑。

### 调试技巧

**开启调试日志**：
```typescript
// 在 console 运行
app.plugins.plugins['obsidian-cat-pet'].debug = true;
```

**查看当前猫咪状态**：
```typescript
// 在 console 运行
app.plugins.plugins['obsidian-cat-pet'].getCats();
```

---

## Testing

### Manual Testing Checklist

- [ ] 新建猫咪正常显示
- [ ] 猫咪游走动画流畅
- [ ] 眼球跟随鼠标
- [ ] 右键菜单功能正常
- [ ] 投喂增加饱食度
- [ ] 5分钟无操作后入睡
- [ ] 点击唤醒
- [ ] 陪伴模式对话正常
- [ ] AI 模式对接 Claudian（如已安装）
- [ ] 对话历史保存/加载
- [ ] 多猫咪管理

### Performance Testing

```bash
# 创建 10 只猫咪测试性能
for (let i = 0; i < 10; i++) {
  app.plugins.plugins['obsidian-cat-pet'].createCat();
}
```

观察 DevTools Performance 面板，确保帧率 > 30fps。

---

## Resources

- [Obsidian Plugin Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Feature Spec](spec.md)
- [Data Model](data-model.md)
- [API Contracts](api.md)

---

## Troubleshooting

### 猫咪不显示

1. 检查插件是否启用
2. 检查 Console 是否有错误
3. 检查 `workspace/pets/` 目录权限

### Claudian 对接失败

1. 确认 Claudian 插件已安装并启用
2. 检查 Claudian 版本兼容性
3. 查看 Console 错误信息

### 性能问题

1. 减少同时显示的猫咪数量
2. 检查 DevTools Performance 面板
3. 确保使用 `requestAnimationFrame`
