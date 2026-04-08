# Research Findings: Obsidian 宠物插件

**Date**: 2026-03-28  
**Feature**: obsidian-cat-pet

---

## 未知项调研结果

### 1. Claudian 插件 API 调研

**状态**: ✅ 已解决

**调研方式**: 
- 查阅 Claudian 插件文档
- 分析 Obsidian 插件间通信机制

**发现**:
- Obsidian 插件可以通过 `app.plugins.plugins['plugin-id']` 访问其他插件
- Claudian 插件暴露 `api` 对象，包含 `sendMessage()` 方法
- 需要检查插件是否存在，优雅降级

**决策**:
```typescript
// 封装 Claudian API 调用
class ClaudianAdapter {
  private getClaudian(): any {
    return (app as any).plugins.plugins['claudian'];
  }
  
  isAvailable(): boolean {
    const claudian = this.getClaudian();
    return claudian?.api?.sendMessage != null;
  }
  
  async sendMessage(message: string, context: ChatMessage[]): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Claudian not available');
    }
    const claudian = this.getClaudian();
    return await claudian.api.sendMessage(message, { context });
  }
}
```

**备选方案**:
- 如果 Claudian API 不可用，降级为纯陪伴模式
- 提示用户安装 Claudian 插件以使用 AI 功能

---

### 2. Obsidian 浮动容器最佳实践

**状态**: ✅ 已解决

**调研方式**:
- 参考 Obsidian 插件开发文档
- 分析现有浮动插件（如 obsidian-advanced-uri）

**发现**:
- Obsidian 使用 Electron，可以直接操作 DOM
- 最佳实践是在 `document.body` 上挂载浮动容器
- 使用 `z-index: 9999` 确保在最上层
- 需要监听 Obsidian 布局变化事件

**决策**:
```typescript
// 浮动容器实现
class PetContainer {
  private container: HTMLElement;
  
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'pet-floating-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 150px;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.container);
  }
  
  // 监听 Obsidian 布局变化
  onLayoutChange() {
    // 重新计算猫咪位置，确保在可视区域内
  }
}
```

---

## 技术决策总结

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 渲染方式 | Canvas 2D | 像素风最适合，性能优秀 |
| 动画驱动 | requestAnimationFrame | 标准做法，与屏幕刷新同步 |
| 状态管理 | 有限状态机 | 清晰管理多种行为状态 |
| 存储格式 | JSON | Obsidian 原生支持，易于调试 |
| 插件通信 | 直接访问 | Obsidian 官方支持的方式 |

---

## 参考资源

- [Obsidian Plugin API Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Claudian Plugin Repo](https://github.com/claudian-plugin/obsidian-claudian)
