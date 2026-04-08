// 随机工具函数

/**
 * 生成指定范围内的随机整数
 */
export function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定范围内的随机浮点数
 */
export function randomFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

/**
 * 从数组中随机选择一个元素
 */
export function randomPick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 从数组中随机选择多个不重复的元素
 */
export function randomPickMany<T>(arr: T[], count: number): T[] {
	if (count >= arr.length) return [...arr];
	const shuffled = [...arr].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

/**
 * 随机打乱数组（返回新数组）
 */
export function shuffle<T>(arr: T[]): T[] {
	return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * 生成 UUID v4
 */
export function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

/**
 * 生成指定长度的随机字符串
 */
export function randomString(length: number): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * 生成随机颜色（HEX格式）
 */
export function randomColor(): string {
	return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * 以指定概率返回 true
 */
export function randomChance(probability: number): boolean {
	return Math.random() < probability;
}

/**
 * 生成符合正态分布的随机数（Box-Muller变换）
 */
export function randomGaussian(mean: number = 0, stdDev: number = 1): number {
	let u = 0, v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	return z * stdDev + mean;
}

/**
 * 生成随机日期（在过去指定天数内）
 */
export function randomRecentDate(daysAgo: number = 30): Date {
	const now = new Date();
	const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
	return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

/**
 * 从加权选项中随机选择
 */
export function randomWeighted<T>(items: { item: T; weight: number }[]): T {
	const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
	let random = Math.random() * totalWeight;
	
	for (const item of items) {
		random -= item.weight;
		if (random <= 0) return item.item;
	}
	
	return items[items.length - 1].item;
}

/**
 * 生成随机ID（短格式）
 */
export function generateShortId(): string {
	return Math.random().toString(36).substring(2, 10);
}
