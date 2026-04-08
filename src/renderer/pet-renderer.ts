// 宠物渲染器 - 支持精灵图动画

import { App } from 'obsidian';
import { Pet, getVariantSpritePath } from '../models/pet';
import { SpriteAnimation } from './sprite-animation';

export class PetRenderer {
	private app: App;
	private container: HTMLElement;
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private sprite: SpriteAnimation | null = null;
	private currentPetType: string = '';
	private currentPetVariant: string = '';
	private scale: number = 2;
	private basePath: string;

	constructor(app: App, container: HTMLElement, basePath: string = '.obsidian/plugins/obsidian-cat-pet') {
		this.app = app;
		this.container = container;
		this.basePath = basePath;
		
		this.canvas = document.createElement('canvas');
		// 画布大小：64x96 (32x32 * 2 缩放，高度增加确保腿显示完整)
		this.canvas.width = 64;
		this.canvas.height = 96;  // 增加高度确保腿显示完整
		this.canvas.className = 'pet-canvas';
		this.container.appendChild(this.canvas);
		
		const ctx = this.canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Failed to get canvas context');
		}
		this.ctx = ctx;
		this.ctx.imageSmoothingEnabled = false;
	}

	async setPetSprite(pet: Pet): Promise<void> {
		if (this.currentPetType === pet.type && this.currentPetVariant === pet.variant && this.sprite) {
			return;
		}

		this.currentPetType = pet.type || 'cat';
		this.currentPetVariant = pet.variant || 'tabby1';

		const spritePath = getVariantSpritePath(pet.type, pet.variant);
		if (!spritePath) {
			console.warn(`[PetRenderer] 未找到精灵图路径: ${pet.type}/${pet.variant}`);
			this.sprite = null;
			return;
		}

		const fullPath = this.getAssetUrl(spritePath);
		this.sprite = new SpriteAnimation(fullPath);
		
		return new Promise((resolve) => {
			this.sprite?.onLoad(() => {
				resolve();
			});
			setTimeout(() => resolve(), 3000);
		});
	}

	private getAssetUrl(path: string): string {
		const pluginPath = `${this.basePath}/assets/pets/${path}`;
		try {
			const resourcePath = this.app.vault.adapter.getResourcePath(pluginPath);
			return resourcePath;
		} catch (e) {
			return pluginPath;
		}
	}

	render(pet: Pet): void {
		if (!this.sprite || this.currentPetType !== pet.type || this.currentPetVariant !== pet.variant) {
			this.setPetSprite(pet);
		}

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (!this.sprite || !this.sprite.isLoaded()) {
			this.drawLoadingPlaceholder(pet);
			return;
		}

		this.updateAnimationState(pet);
		this.sprite.update();

		this.ctx.save();

		if (pet.position.direction === 'left') {
			this.ctx.translate(this.canvas.width, 0);
			this.ctx.scale(-1, 1);
		}

		// 渲染位置
		const centerX = this.canvas.width / 2;
		let centerY = this.canvas.height - 32; // 基础位置
		
		// 跳跃时的上下位移效果
		if (pet.state.type === 'jump') {
			const elapsed = Date.now() - (pet.state as { since: number }).since;
			const jumpDuration = 250;
			const progress = Math.min(elapsed / jumpDuration, 1);
			const jumpHeight = 20;
			const offset = Math.sin(progress * Math.PI) * jumpHeight;
			centerY -= offset;
		}
		
		this.sprite.render(this.ctx, centerX, centerY, this.scale);

		this.ctx.restore();
	}

	private updateAnimationState(pet: Pet): void {
		if (!this.sprite) return;

		const actionMap: Record<string, string> = {
			idle: 'idle',
			walk: 'walk',
			sleep: 'sleep',
			petted: 'blink',
			jump: 'jump',
		};

		const targetAction = actionMap[pet.state.type] || 'idle';
		this.sprite.setAction(targetAction);
	}

	// 播放跳跃动画
	playJump(): void {
		if (!this.sprite) return;
		this.sprite.setAction('jump');
	}

	private drawLoadingPlaceholder(pet: Pet): void {
		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;

		this.ctx.save();
		this.ctx.fillStyle = pet.color || '#FFA05C';
		this.ctx.beginPath();
		this.ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
		this.ctx.fill();
		this.ctx.fillStyle = '#fff';
		this.ctx.font = '10px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.fillText('...', centerX, centerY + 4);
		this.ctx.restore();
	}

	getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}

	destroy(): void {
		this.canvas.remove();
	}
}
