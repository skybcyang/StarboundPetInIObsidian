// 精灵图动画管理器 - 支持 Starbound 格式的宠物精灵图

// 基于实际像素分析修正后的配置
// 关键发现：标签位置和我之前假设的不同！
export const ANIMATION_CONFIG: Record<string, { row: number; startCol: number; frames: number; skipCol?: number[] }> = {
	// 第0行 (sy=0): 
	// 列0: Idle标签, 列1: Idle帧1, 列2: Stand标签(!), 列3: Idle帧2, 列4: ?, 列5-8: Stand帧
	idle:    { row: 0, startCol: 1, frames: 2 },  // 帧在列1和列3（跳过列2的Stand标签！）
	stand:   { row: 0, startCol: 5, frames: 4 },  // 列5,6,7,8
	
	// 第1行 (sy=32): Blink(列1-2) + Jump(列3-4)
	// 列0=Blink标签, 列1-2=Blink帧, 列3-4=Jump帧, 列5可能是另一个标签
	blink:   { row: 1, startCol: 1, frames: 2 },
	jump:    { row: 1, startCol: 3, frames: 2 },
	
	// 第2行 (sy=64): Walk + Run
	walk:    { row: 2, startCol: 1, frames: 3 },
	run:     { row: 2, startCol: 6, frames: 2 },
	
	// 第3行 (sy=96): Eat + Inspect
	eat:     { row: 3, startCol: 1, frames: 3 },
	inspect: { row: 3, startCol: 5, frames: 4 },
	
	// 第4行 (sy=128): Swim
	swim:    { row: 4, startCol: 1, frames: 5 },
	
	// 第5行 (sy=160): Sound(列1-3) + Sleep(列6，只有1帧！)
	// 列5是Sleep标签(黑)，列6是Sleep帧，列7-8是黑的
	sound:   { row: 5, startCol: 1, frames: 3 },
	sleep:   { row: 5, startCol: 6, frames: 1 },
	
	fall:    { row: 1, startCol: 5, frames: 2 },
};

// 动作设置 - 正常帧率，与移动速度协调
export const ACTION_SETTINGS: Record<string, { fps: number; loop: boolean }> = {
	idle: { fps: 2, loop: true },      // 发呆：缓慢呼吸
	stand: { fps: 2, loop: true },     // 站立：缓慢
	blink: { fps: 8, loop: false },    // 眨眼：快速
	jump: { fps: 8, loop: false },     // 跳跃：快速
	walk: { fps: 6, loop: true },      // 行走：与移动速度协调 (~6fps = 每帧移动10px)
	run: { fps: 10, loop: true },      // 奔跑：更快
	eat: { fps: 4, loop: true },       // 进食
	inspect: { fps: 4, loop: true },   // 观察
	swim: { fps: 6, loop: true },      // 游泳
	sound: { fps: 6, loop: false },    // 发声
	sleep: { fps: 1, loop: true },     // 睡觉：非常缓慢
	fall: { fps: 8, loop: false },     // 下落
};

export interface AnimationState {
	action: string;
	frame: number;
	lastFrameTime: number;
}

export class SpriteAnimation {
	private image: HTMLImageElement;
	private loaded: boolean = false;
	private onLoadCallback?: () => void;
	private currentState: AnimationState;
	private frameWidth: number = 32;
	private frameHeight: number = 32;

	constructor(imageSrc: string) {
		this.image = new Image();
		this.image.onload = () => {
			this.loaded = true;
			this.onLoadCallback?.();
		};
		this.image.onerror = (err) => {
			console.error('[SpriteAnimation] 图片加载失败:', imageSrc, err);
		};
		this.image.src = imageSrc;
		
		this.currentState = {
			action: 'idle',
			frame: 0,
			lastFrameTime: Date.now(),
		};
	}

	onLoad(callback: () => void): void {
		if (this.loaded) {
			callback();
		} else {
			this.onLoadCallback = callback;
		}
	}

	isLoaded(): boolean {
		return this.loaded;
	}

	getCurrentAction(): string {
		return this.currentState.action;
	}

	setAction(action: string): void {
		if (this.currentState.action === action) return;
		
		const cfg = ANIMATION_CONFIG[action];
		if (!cfg) {
			console.warn(`[SpriteAnimation] 动作 "${action}" 不存在`);
			return;
		}

		this.currentState = {
			action,
			frame: 0,
			lastFrameTime: Date.now(),
		};
	}

	update(): void {
		if (!this.loaded) return;

		const settings = ACTION_SETTINGS[this.currentState.action];
		if (!settings) return;

		const now = Date.now();
		const frameInterval = 1000 / settings.fps;

		if (now - this.currentState.lastFrameTime >= frameInterval) {
			const cfg = ANIMATION_CONFIG[this.currentState.action];
			if (!cfg) return;
			
			const maxFrames = cfg.frames;
			
			if (maxFrames <= 1) {
				this.currentState.frame = 0;
			} else if (settings.loop) {
				this.currentState.frame = (this.currentState.frame + 1) % maxFrames;
			} else {
				this.currentState.frame = Math.min(this.currentState.frame + 1, maxFrames - 1);
			}
			
			this.currentState.lastFrameTime = now;
		}
	}

	render(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1): void {
		if (!this.loaded) return;

		const { sx, sy } = this.getFramePosition();
		const action = this.currentState.action;
		const frame = this.currentState.frame;

		// 安全检查：如果位置是已知的标签位置，阻断
		// 第0行: 列0=Idle标签, 列2=Stand标签
		// 安全检查：不渲染标签区域
		if (sy === 0 && (sx === 0 || sx === 64 || sx === 128)) {
			return;
		}

		ctx.drawImage(
			this.image,
			sx, sy, this.frameWidth, this.frameHeight,
			x - (this.frameWidth * scale) / 2, y - (this.frameHeight * scale) / 2,
			this.frameWidth * scale, this.frameHeight * scale
		);
	}

	private getFramePosition(): { sx: number; sy: number } {
		const action = this.currentState.action;
		const frame = this.currentState.frame;
		
		const cfg = ANIMATION_CONFIG[action];
		if (!cfg) {
			return { sx: 32, sy: 0 };
		}
		
		const safeFrame = Math.max(0, Math.min(frame, cfg.frames - 1));
		
		// 特殊处理：Idle的帧在列1和列3（跳过列2的Stand标签）
		let col: number;
		if (action === 'idle') {
			// Idle: 帧0->列1, 帧1->列3
			col = safeFrame === 0 ? 1 : 3;
		} else {
			col = cfg.startCol + safeFrame;
		}
		
		const sx = col * this.frameWidth;
		const sy = cfg.row * this.frameHeight;
		
		return { sx, sy };
	}
}
