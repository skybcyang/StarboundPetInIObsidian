// AI 智能聊天气泡 - 支持对接 AgentWindowInObsidian

import { App, Notice, Modal } from 'obsidian';
import { Pet } from '../models/pet';

export interface ChatMessage {
	role: 'user' | 'cat';
	content: string;
	timestamp: number;
}

interface AIHistoryMessage {
	role: 'user' | 'assistant';
	content: string;
}

export class ChatBubbleModal extends Modal {
	private pet: Pet;
	private messages: ChatMessage[] = [];
	private messagesContainer: HTMLElement;
	private inputEl: HTMLInputElement;
	private isLoading: boolean = false;
	private aiPlugin: any = null;

	constructor(app: App, pet: Pet) {
		super(app);
		this.pet = pet;
		this.findAIPlugin();
	}

	/**
	 * 查找可用的 AI 插件
	 */
	private findAIPlugin(): void {
		const plugins = (this.app as any).plugins.plugins;
		
		// 优先查找 AgentWindowInObsidian
		if (plugins['agent-window-in-obsidian']) {
			this.aiPlugin = plugins['agent-window-in-obsidian'];
			console.log('[PetChat] Found AI plugin: agent-window-in-obsidian');
			return;
		}
		
		// 备用：查找 Claudian
		if (plugins['claudian']) {
			this.aiPlugin = plugins['claudian'];
			console.log('[PetChat] Found AI plugin: claudian');
			return;
		}
		
		console.log('[PetChat] No AI plugin found');
	}

	/**
	 * 检查是否有 AI 可用
	 */
	private hasAI(): boolean {
		return this.aiPlugin !== null && this.aiPlugin.embeddedChatService !== null;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.addClass('pet-chat-modal', 'pi-chat-modal');

		// 创建头部
		const header = contentEl.createDiv('chat-modal-header pi-chat-header');
		header.createEl('span', { text: `🐱 ${this.pet.name}`, cls: 'chat-modal-title pi-chat-title' });

		// 按钮组
		const btnGroup = header.createDiv('chat-modal-btns pi-chat-btns');

		// 转化为卡片按钮
		const convertBtn = btnGroup.createEl('button', {
			text: '📝 转卡片',
			cls: 'chat-modal-convert-btn pi-chat-convert-btn'
		});
		convertBtn.addEventListener('click', () => this.convertToCard());

		// 消息区域
		this.messagesContainer = contentEl.createDiv('chat-modal-messages pi-chat-messages');

		// 显示欢迎语 - 根据是否有AI显示不同提示
		if (this.hasAI()) {
			this.addMessage('cat', `喵~ 我是 ${this.pet.name}，我是智能猫咪，可以回答你的问题哦！`);
		} else {
			this.addMessage('cat', `喵~ 我是 ${this.pet.name}，来找我聊天吧！（提示：安装 AgentWindowInObsidian 插件可启用AI）`);
		}

		// 输入区域
		const inputArea = contentEl.createDiv('chat-modal-input-area pi-chat-input-area');

		this.inputEl = inputArea.createEl('input', {
			type: 'text',
			placeholder: this.hasAI() ? '问点什么...' : '和猫咪说说话...',
			cls: 'chat-modal-input pi-chat-input'
		});

		this.inputEl.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !this.isLoading) {
				this.sendMessage();
			}
		});

		const sendBtn = inputArea.createEl('button', {
			text: '发送',
			cls: 'chat-modal-send pi-chat-send'
		});
		sendBtn.addEventListener('click', () => {
			if (!this.isLoading) {
				this.sendMessage();
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * 发送消息
	 */
	private async sendMessage(): Promise<void> {
		const content = this.inputEl.value.trim();
		if (!content || this.isLoading) return;

		// 添加用户消息
		this.addMessage('user', content);
		this.inputEl.value = '';
		this.isLoading = true;

		// 显示加载中
		const loadingEl = this.showLoading();

		try {
			let reply: string;
			
			// 如果有 AI 插件，尝试使用
			if (this.hasAI()) {
				reply = await this.getAIReply(content);
			} else {
				// 使用本地预设回复
				await this.delay(500);
				reply = this.generateLocalReply(content);
			}
			
			loadingEl.remove();
			this.addMessage('cat', reply);
		} catch (error) {
			console.error('[PetChat] Error:', error);
			loadingEl.remove();
			this.addMessage('cat', '喵呜... 我好像有点困了，稍后再聊好吗？');
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * 获取 AI 回复
	 */
	private async getAIReply(userContent: string): Promise<string> {
		try {
			// 构建对话历史
			const history: AIHistoryMessage[] = this.messages.map(m => ({
				role: m.role === 'user' ? 'user' : 'assistant',
				content: m.content
			}));
			
			console.log('[PetChat] Sending to AI:', history);
			
			// 调用 AgentWindowInObsidian 的 embeddedChatService.chat
			const response = await this.aiPlugin.embeddedChatService.chat(history);
			
			console.log('[PetChat] AI response:', response);
			
			// 如果返回错误信息，使用本地回复
			if (response && response.startsWith('[')) {
				console.warn('[PetChat] AI returned error, using local reply');
				return this.generateLocalReply(userContent);
			}
			
			return response || this.generateLocalReply(userContent);
		} catch (error) {
			console.error('[PetChat] AI call failed:', error);
			return this.generateLocalReply(userContent);
		}
	}

	/**
	 * 延迟
	 */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * 显示加载中
	 */
	private showLoading(): HTMLElement {
		const loading = this.messagesContainer.createDiv('chat-modal-message pi-chat-message cat loading');
		loading.innerHTML = `
			<div class="chat-modal-avatar pi-chat-avatar">🐱</div>
			<div class="chat-modal-content pi-chat-content">
				<span class="loading-dots">思考中<span>.</span><span>.</span><span>.</span></span>
			</div>
		`;
		this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
		return loading;
	}

	/**
	 * 添加消息到界面
	 */
	private addMessage(role: 'user' | 'cat', content: string): void {
		const message: ChatMessage = {
			role,
			content,
			timestamp: Date.now(),
		};
		this.messages.push(message);

		const msgEl = this.messagesContainer.createDiv(`chat-modal-message pi-chat-message ${role}`);

		// 头像
		const avatar = msgEl.createDiv('chat-modal-avatar pi-chat-avatar');
		avatar.textContent = role === 'user' ? '😊' : '🐱';

		// 内容
		const contentEl = msgEl.createDiv('chat-modal-content pi-chat-content');
		contentEl.textContent = content;

		// 滚动到底部
		this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
	}

	/**
	 * 本地预设回复（作为降级方案）
	 */
	private generateLocalReply(userContent: string): string {
		const lowerContent = userContent.toLowerCase();
		
		if (lowerContent.includes('你好') || lowerContent.includes('嗨')) {
			return '喵~ 你好呀！今天过得怎么样？';
		}
		if (lowerContent.includes('名字')) {
			return `我叫 ${this.pet.name}，很高兴认识你！`;
		}
		if (lowerContent.includes('吃') || lowerContent.includes('饿')) {
			return '我是一只数字猫咪，不需要吃东西~ 但我喜欢吃虚拟的小鱼干！🐟';
		}
		if (lowerContent.includes('睡') || lowerContent.includes('困')) {
			return '猫咪确实很喜欢睡觉，一天要睡16个小时呢！😴';
		}
		if (lowerContent.includes('摸') || lowerContent.includes('乖')) {
			return '喵呜~ 谢谢你夸我！我很乖的~ 💕';
		}
		if (lowerContent.includes('笔记') || lowerContent.includes('写')) {
			return '你在写笔记吗？点击「转卡片」可以保存我们的对话哦！';
		}
		if (lowerContent.includes('拜拜') || lowerContent.includes('再见')) {
			return '再见~ 记得常来找我玩哦！喵~ 👋';
		}

		const defaultReplies = [
			'喵？你在说什么呀？',
			'我是一只小猫咪，不太懂你在说什么呢~',
			'嗯嗯，我在听呢！继续说~',
			'这个问题好难呀，让我想想...',
			'喵呜~ 我们可以聊点别的吗？',
		];
		return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
	}

	/**
	 * 转化为卡片 - 将当前对话保存为 AgentWindowInObsidian 格式的笔记
	 */
	private async convertToCard(): Promise<void> {
		if (this.messages.length <= 1) {
			new Notice('还没有对话内容哦，先聊几句吧！');
			return;
		}

		const activeFile = this.app.workspace.getActiveFile();
		const parentPath = activeFile?.parent?.path || '';
		
		// 生成卡片 ID（AgentWindowInObsidian 格式）
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(2, 9);
		const cardId = `card-${timestamp}-${randomStr}`;
		
		// 文件名（包含时分秒）
		const now = new Date();
		const dateStr = now.toLocaleDateString('zh-CN').replace(/\//g, '-');
		const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '');
		const fileName = `${this.pet.name}的对话卡片-${dateStr}-${timeStr}`;
		const newFilePath = parentPath ? `${parentPath}/${fileName}.md` : `${fileName}.md`;

		// 构建笔记内容（包含 ai-chat 代码块）
		const dateTimeStr = now.toLocaleString('zh-CN', { 
			year: 'numeric', 
			month: '2-digit', 
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
		
		const content = `# 🐱 与 ${this.pet.name} 的对话卡片

> 📅 创建时间：${dateTimeStr}
> ${activeFile ? `> 🔗 来源笔记：[[${activeFile.basename}]]` : ''}
> 🤖 ${this.hasAI() ? 'AI 智能对话' : '本地对话'}

---

> 💬 点击下方的对话卡片可以继续与 ${this.pet.name} 聊天：

\`\`\`ai-chat
${cardId}
\`\`\`

---

*🐾 由 [[猫咪宠物插件]]创建*
`;

		try {
			// 1. 创建笔记文件
			const newFile = await this.app.vault.create(newFilePath, content);
			
			// 2. 保存对话历史到 .ai-chats/ 目录（AgentWindowInObsidian 格式）
			await this.saveChatHistory(cardId, parentPath);
			
			// 3. 打开新文件
			await this.app.workspace.openLinkText(newFile.path, '');
			
			new Notice(`📝 对话卡片已创建：${fileName}`);
			this.close();
		} catch (error) {
			console.error('[PetChat] Failed to create card:', error);
			new Notice('创建卡片失败，请重试');
		}
	}

	/**
	 * 保存对话历史到 .ai-chats/ 目录（AgentWindowInObsidian 格式）
	 */
	private async saveChatHistory(cardId: string, parentPath: string): Promise<void> {
		try {
			// 构建存储路径
			const chatDir = parentPath ? `${parentPath}/.ai-chats` : '.ai-chats';
			const chatFilePath = `${chatDir}/${cardId}.json`;
			
			const now = Date.now();
			
			// 转换消息格式为 AgentWindowInObsidian 格式
			const chatData = {
				cardId: cardId,
				sessionId: `pet-${now}`,
				messages: this.messages.map(m => ({
					role: m.role === 'user' ? 'user' : 'assistant',
					content: m.content,
					timestamp: m.timestamp,
				})),
				isActive: true,
				createdAt: now,
				updatedAt: now,
			};
			
			// 确保目录存在
			const dirExists = await this.app.vault.adapter.exists(chatDir);
			if (!dirExists) {
				await this.app.vault.createFolder(chatDir);
			}
			
			// 保存文件
			await this.app.vault.adapter.write(chatFilePath, JSON.stringify(chatData, null, 2));
			
			console.log('[PetChat] Chat history saved:', chatFilePath);
		} catch (error) {
			console.error('[PetChat] Failed to save chat history:', error);
			// 不阻塞主流程，即使保存失败也继续
		}
	}
}

// 为了兼容旧代码的调用方式
export class ChatBubble {
	private modal: ChatBubbleModal;

	constructor(app: App, pet: Pet) {
		this.modal = new ChatBubbleModal(app, pet);
	}

	open(): void {
		this.modal.open();
	}

	close(): void {
		this.modal.close();
	}
}
