// 宠物容器 - 管理多个宠物的显示和交互

import { App, Menu, Notice } from 'obsidian';
import CatPetPlugin from '../../main';
import { 
	Pet, 
	createPet,
	petThePet, 
	PetState,
	getPetFullDescription,
	getVariantSpritePath,
} from '../models/pet';
import { PetRenderer } from '../renderer/pet-renderer';
import { ChatBubble } from './chat-bubble';

// PetView 包装器，包含宠物数据和渲染器
interface PetView {
	pet: Pet;
	element: HTMLElement;
	renderer: PetRenderer;
	lastUpdateTime: number;
}

export class PetContainer {
	private app: App;
	private plugin: CatPetPlugin;
	private container: HTMLElement;
	private pets: Map<string, PetView> = new Map();
	private visible: boolean = true;
	private animationFrameId: number | null = null;
	private lastActivityTime: number = Date.now();
	private activeChatBubble: ChatBubble | null = null;

	constructor(app: App, plugin: CatPetPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.createContainer();
		this.setupActivityTracking();
		this.startAnimationLoop();
	}

	private createContainer(): void {
		this.container = document.createElement('div');
		this.container.className = 'pet-floating-container';
		document.body.appendChild(this.container);
	}

	private setupActivityTracking(): void {
		document.addEventListener('keydown', () => {
			this.lastActivityTime = Date.now();
		});
		document.addEventListener('click', () => {
			this.lastActivityTime = Date.now();
		});
	}

	private startAnimationLoop(): void {
		const loop = () => {
			this.updatePets();
			this.renderPets();
			this.animationFrameId = requestAnimationFrame(loop);
		};
		this.animationFrameId = requestAnimationFrame(loop);
	}

	private updatePets(): void {
		const now = Date.now();
		const inactiveTime = now - this.lastActivityTime;

		for (const view of this.pets.values()) {
			const pet = view.pet;
			const deltaTime = now - view.lastUpdateTime;
			view.lastUpdateTime = now;

			// 更新行为状态
			this.updatePetBehavior(pet, deltaTime, inactiveTime);
		}
	}

	private updatePetBehavior(pet: Pet, deltaTime: number, inactiveTime: number): void {
		// 状态机逻辑
		switch (pet.state.type) {
			case 'idle':
				this.handleIdleState(pet, inactiveTime);
				break;
			case 'walk':
				this.handleWalkState(pet, deltaTime);
				break;
			case 'sleep':
				this.handleSleepState(pet);
				break;
			case 'petted':
				this.handlePettedState(pet);
				break;
			case 'jump':
				// 跳跃状态由时间自动结束
				break;
		}

		// 用户无操作10分钟后，可能进入睡眠
		if (inactiveTime > 10 * 60 * 1000 && pet.state.type !== 'sleep' && Math.random() < 0.3) {
			pet.state = { type: 'sleep', since: Date.now() };
		}
	}

	private handleIdleState(pet: Pet, inactiveTime: number): void {
		const idleState = pet.state as { type: 'idle'; since: number };
		const elapsed = Date.now() - idleState.since;
		const maxIdleTime = 3000 / pet.personality.activity;

		// 停留时间到，优先开始游走
		if (elapsed > maxIdleTime) {
			// 30%概率跳跃，70%概率游走
			if (Math.random() < 0.3) {
				// 跳跃
				pet.state = { type: 'jump', since: Date.now() };
				setTimeout(() => {
					if (pet.state.type === 'jump') {
						pet.state = { type: 'idle', since: Date.now() };
					}
				}, 300);
			} else {
				// 游走
				const targetX = this.pickRandomTargetX(pet);
				pet.state = { type: 'walk', targetX };
			}
		}
	}

	private handleWalkState(pet: Pet, deltaTime: number): void {
		const walkState = pet.state as { type: 'walk'; targetX: number };
		const dx = walkState.targetX - pet.position.x;
		// 调整移动速度：行走动画6fps，每步约移动6-8px比较协调
		const speed = 45 * (deltaTime / 1000); // 45px/s，与6fps动画协调
		const moveDistance = Math.sign(dx) * Math.min(Math.abs(dx), speed);

		pet.position.x += moveDistance;
		pet.position.direction = dx > 0 ? 'right' : 'left';

		// 到达目标
		if (Math.abs(dx) < 1) {
			pet.state = { type: 'idle', since: Date.now() };
		}
	}

	private handleSleepState(pet: Pet): void {
		// 睡眠状态，等待点击唤醒
	}

	private handlePettedState(pet: Pet): void {
		const pettedState = pet.state as { type: 'petted'; since: number };
		const elapsed = Date.now() - pettedState.since;
		if (elapsed > 2000) { // 2秒后回到 idle
			pet.state = { type: 'idle', since: Date.now() };
		}
	}

	private pickRandomTargetX(pet: Pet): number {
		const margin = 100;
		const minX = margin;
		const maxX = window.innerWidth - 228; // 128(宽度) + 100(margin)
		return Math.floor(Math.random() * (maxX - minX) + minX);
	}

	private renderPets(): void {
		for (const view of this.pets.values()) {
			// 更新位置
			view.element.style.left = `${view.pet.position.x}px`;
			
			// 渲染宠物
			view.renderer.render(view.pet);
		}
	}

	addPet(pet: Pet): void {
		if (this.pets.size >= this.plugin.settings.maxPets) {
			new Notice(`宠物数量已达上限 (${this.plugin.settings.maxPets})`);
			return;
		}

		// 创建宠物容器元素
		const element = document.createElement('div');
		element.className = 'pet-element';
		element.style.position = 'fixed';
		element.style.left = `${pet.position.x}px`;
		element.style.bottom = '10px';
		element.style.width = '64px';
		element.style.height = '96px';  // 增加高度以适应画布
		element.style.zIndex = '1000';
		element.style.cursor = 'pointer';
		element.title = `${pet.name} (${getPetFullDescription(pet)})`;

		// 创建渲染器
		const renderer = new PetRenderer(this.app, element);

		// 绑定事件
		element.addEventListener('click', () => this.onPetClick(pet.id));
		element.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			this.showContextMenu(pet.id, e);
		});
		
		// 长按拖动功能
		this.setupDragFeature(pet.id, element);

		this.container.appendChild(element);

		// 创建视图
		const view: PetView = {
			pet,
			element,
			renderer,
			lastUpdateTime: Date.now(),
		};

		this.pets.set(pet.id, view);
		this.plugin.storage.savePets(this.getPets());
		console.log('Added pet:', pet.name, getPetFullDescription(pet));
	}

	removePet(petId: string): void {
		const view = this.pets.get(petId);
		if (view) {
			view.renderer.destroy();
			view.element.remove();
			this.pets.delete(petId);
		}
		this.plugin.storage.savePets(this.getPets());
	}

	getPets(): Pet[] {
		return Array.from(this.pets.values()).map(v => v.pet);
	}

	createPet(): Pet {
		// 使用默认设置创建宠物
		const pet = createPet(
			undefined, // 随机名字
			this.plugin.settings.defaultPetType,
			this.plugin.settings.defaultPetVariant
		);
		this.addPet(pet);
		new Notice(`🐱 ${pet.name} (${getPetFullDescription(pet)}) 来了！`);
		return pet;
	}

	private onPetClick(petId: string): void {
		const view = this.pets.get(petId);
		if (!view) return;

		// 如果在睡眠，唤醒
		if (view.pet.state.type === 'sleep') {
			view.pet.state = { type: 'idle', since: Date.now() };
			new Notice(`${view.pet.name} 醒了！`);
			this.plugin.storage.savePets(this.getPets());
			return;
		}

		// 先播放跳跃动画
		view.pet.state = { type: 'jump', since: Date.now() };
		view.renderer.playJump();
		
		// 250ms后显示爱心并恢复idle
		setTimeout(() => {
			this.showHeartEffect(view);
			view.pet.state = { type: 'idle', since: Date.now() };
			this.plugin.storage.savePets(this.getPets());
		}, 250);
	}

	private showHeartEffect(view: PetView): void {
		const heart = document.createElement('div');
		heart.className = 'pet-heart-effect';
		heart.textContent = '❤️';
		heart.style.position = 'absolute';
		heart.style.left = '20px';
		heart.style.top = '-10px';
		heart.style.fontSize = '20px';
		heart.style.pointerEvents = 'none';
		heart.style.animation = 'pet-heart-float 1.5s ease-out forwards';
		view.element.appendChild(heart);

		setTimeout(() => heart.remove(), 1500);
	}

	// 设置拖动功能
	private setupDragFeature(petId: string, element: HTMLElement): void {
		let isDragging = false;
		let startX = 0;
		let startY = 0;
		let startLeft = 0;
		let startBottom = 0;
		let dragThreshold = 5; // 超过这个像素视为拖动而非点击

		const onMouseDown = (e: MouseEvent) => {
			// 左键按下
			if (e.button !== 0) return;
			
			isDragging = false;
			startX = e.clientX;
			startY = e.clientY;
			startLeft = parseInt(element.style.left || '0');
			startBottom = parseInt(element.style.bottom || '0');
			
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		};

		const onMouseMove = (e: MouseEvent) => {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			
			// 超过阈值视为拖动
			if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
				isDragging = true;
			}
			
			if (isDragging) {
				e.preventDefault();
				const view = this.pets.get(petId);
				if (view) {
					// 更新位置
					const newLeft = startLeft + dx;
					const newBottom = startBottom - dy; // Y轴向上为正，但css bottom向上为正
					
					// 限制在屏幕范围内
					const maxX = window.innerWidth - 100;
					const minX = 0;
					const maxBottom = window.innerHeight - 100;
					const minBottom = 0;
					
					view.pet.position.x = Math.max(minX, Math.min(maxX, newLeft));
					element.style.left = `${view.pet.position.x}px`;
					element.style.bottom = `${Math.max(minBottom, Math.min(maxBottom, newBottom))}px`;
				}
			}
		};

		const onMouseUp = (e: MouseEvent) => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			
			if (isDragging) {
				// 拖动结束，保存位置
				const view = this.pets.get(petId);
				if (view) {
					view.pet.state = { type: 'idle', since: Date.now() };
					this.plugin.storage.savePets(this.getPets());
				}
			}
		};

		element.addEventListener('mousedown', onMouseDown);
	}

	private showContextMenu(petId: string, event: MouseEvent): void {
		const view = this.pets.get(petId);
		if (!view) return;

		const menu = new Menu();

		menu.addItem(item =>
			item
				.setTitle('💬 开始对话')
				.setIcon('message-circle')
				.onClick(() => this.startChat(view.pet))
		);

		menu.addItem(item =>
			item
				.setTitle('✏️ 改名')
				.setIcon('edit')
				.onClick(() => this.renamePet(petId))
		);

		menu.addSeparator();

		menu.addItem(item =>
			item
				.setTitle('👋 送走这只宠物')
				.setIcon('trash')
				.onClick(() => this.confirmRemovePet(petId))
		);

		menu.showAtPosition({ x: event.clientX, y: event.clientY });
	}

	/**
	 * 开始对话 - 打开聊天气泡
	 */
	private startChat(pet: Pet): void {
		// 关闭之前的气泡
		if (this.activeChatBubble) {
			this.activeChatBubble.close();
		}

		// 创建新的气泡
		this.activeChatBubble = new ChatBubble(this.app, pet);
		this.activeChatBubble.open();
	}

	private renamePet(petId: string): void {
		const view = this.pets.get(petId);
		if (!view) return;

		const newName = prompt(`给 ${view.pet.name} 起个新名字：`, view.pet.name);
		if (newName && newName.trim() && newName.trim() !== view.pet.name) {
			view.pet.name = newName.trim();
			view.element.title = `${view.pet.name} (${getPetFullDescription(view.pet)})`;
			this.plugin.storage.savePets(this.getPets());
			new Notice(`宠物现在叫 ${view.pet.name} 了！`);
		}
	}

	private confirmRemovePet(petId: string): void {
		const view = this.pets.get(petId);
		if (!view) return;

		if (confirm(`确定要送走 ${view.pet.name} 吗？这将删除所有相关数据。`)) {
			this.removePet(petId);
			new Notice(`${view.pet.name} 已经被送走了...`);
		}
	}

	toggleVisibility(): void {
		this.visible = !this.visible;
		this.container.style.display = this.visible ? 'block' : 'none';
	}

	isVisible(): boolean {
		return this.visible;
	}

	destroy(): void {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}
		if (this.activeChatBubble) {
			this.activeChatBubble.close();
		}
		for (const view of this.pets.values()) {
			view.renderer.destroy();
		}
		this.container.remove();
	}
}
