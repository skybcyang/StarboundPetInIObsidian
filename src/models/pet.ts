// 宠物数据模型 - 支持多种宠物类型和精灵图动画

import { generateUUID, randomFloat } from '../utils/random';

// 宠物数据模型
export interface Pet {
	id: string;
	name: string;
	// 宠物类型和变体（新增）
	type: string;        // 宠物类型：cat, bunny, snugget 等
	variant: string;     // 变体：tabby1, brown, green 等
	// 向后兼容：保留颜色字段（用于 Canvas 绘制的备用）
	color: string;
	personality: Personality;
	state: PetState;
	position: Position;
	createdAt: string;
}

export interface Personality {
	activity: number;        // 活跃度 0.0-1.0，影响游走频率
	sociability: number;     // 社交性 0.0-1.0
}

export type PetState =
	| { type: 'idle'; since: number }           // 停留状态
	| { type: 'walk'; targetX: number }         // 游走状态
	| { type: 'sleep'; since: number }          // 睡眠状态
	| { type: 'petted'; since: number }         // 被摸状态
	| { type: 'jump'; since: number };          // 跳跃状态

export interface Position {
	x: number;               // 相对于视口的 X 坐标
	direction: 'left' | 'right';
}

// 宠物类型配置
export interface PetTypeConfig {
	id: string;
	name: string;
	variants: PetVariantConfig[];
}

export interface PetVariantConfig {
	id: string;
	name: string;
	// 精灵图路径（相对于 assets/pets/）
	spritePath: string;
	// 备用颜色（当使用 Canvas 绘制时）
	fallbackColor: string;
}

// 支持的宠物类型
export const PET_TYPES: PetTypeConfig[] = [
	{
		id: 'cat',
		name: '猫咪',
		variants: [
			{ id: 'tabby1', name: '虎斑1', spritePath: 'cat/tabby1.png', fallbackColor: '#FFA05C' },
			{ id: 'tabby2', name: '虎斑2', spritePath: 'cat/tabby2.png', fallbackColor: '#D4A574' },
			{ id: 'black', name: '黑色', spritePath: 'cat/black.png', fallbackColor: '#303030' },
			{ id: 'white', name: '白色', spritePath: 'cat/white.png', fallbackColor: '#F5F5F5' },
			{ id: 'calico', name: '三色', spritePath: 'cat/calico.png', fallbackColor: '#E8C547' },
			{ id: 'cream', name: '奶油色', spritePath: 'cat/cream.png', fallbackColor: '#FFF8DC' },
			{ id: 'creamtabby', name: '奶油虎斑', spritePath: 'cat/creamtabby.png', fallbackColor: '#F5DEB3' },
			{ id: 'grey1', name: '灰色1', spritePath: 'cat/grey1.png', fallbackColor: '#A0A0A0' },
			{ id: 'grey2', name: '灰色2', spritePath: 'cat/grey2.png', fallbackColor: '#808080' },
			{ id: 'grey3', name: '灰色3', spritePath: 'cat/grey3.png', fallbackColor: '#696969' },
		],
	},
];

// 获取宠物类型配置
export function getPetTypeConfig(typeId: string): PetTypeConfig | undefined {
	return PET_TYPES.find(t => t.id === typeId);
}

// 获取变体配置
export function getPetVariantConfig(typeId: string, variantId: string): PetVariantConfig | undefined {
	const type = getPetTypeConfig(typeId);
	return type?.variants.find(v => v.id === variantId);
}

// 获取变体显示名称
export function getVariantDisplayName(typeId: string, variantId: string): string {
	const variant = getPetVariantConfig(typeId, variantId);
	return variant?.name || variantId;
}

// 获取变体精灵图路径
export function getVariantSpritePath(typeId: string, variantId: string): string | undefined {
	const variant = getPetVariantConfig(typeId, variantId);
	return variant?.spritePath;
}

// 获取所有宠物类型选项（用于下拉菜单）
export function getPetTypeOptions(): { value: string; label: string }[] {
	return PET_TYPES.map(type => ({
		value: type.id,
		label: type.name,
	}));
}

// 获取指定类型的变体选项
export function getPetVariantOptions(typeId: string): { value: string; label: string }[] {
	const type = getPetTypeConfig(typeId);
	if (!type) return [];
	
	return type.variants.map(variant => ({
		value: variant.id,
		label: variant.name,
	}));
}

// 向后兼容：旧版猫咪颜色配置
export const LEGACY_CAT_COLORS = [
	{ name: '橘猫', color: '#FFA05C', variant: 'tabby1' },
	{ name: '灰猫', color: '#A0A0A0', variant: 'grey1' },
	{ name: '黑猫', color: '#303030', variant: 'black' },
	{ name: '白猫', color: '#F5F5F5', variant: 'white' },
	{ name: '棕猫', color: '#8B4513', variant: 'tabby2' },
	{ name: '蓝猫', color: '#7B9DB6', variant: 'grey2' },
];

// 猫咪名字前缀
const NAME_PREFIXES = ['小', '大', '胖', '萌', '呆呆', '调皮', '懒懒', '乖乖', '咪咪', '花花'];
const NAME_SUFFIXES = ['猫', '喵', '咪', '球', '团子', '豆豆', '球球', '毛毛'];

// 生成随机性格
export function generateRandomPersonality(): Personality {
	return {
		activity: randomFloat(0.3, 0.9),
		sociability: randomFloat(0.3, 0.9),
	};
}

// 生成猫咪名字
export function generatePetName(): string {
	const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
	const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
	return prefix + suffix;
}

// 创建宠物
export function createPet(
	name?: string,
	type?: string,
	variant?: string,
	color?: string
): Pet {
	// 如果没有指定类型，默认为 cat
	const petType = type || 'cat';
	
	// 如果没有指定变体，随机选择一个
	const typeConfig = getPetTypeConfig(petType);
	const petVariant = variant || typeConfig?.variants[Math.floor(Math.random() * (typeConfig?.variants.length || 1))]?.id || 'tabby1';
	
	// 获取变体配置以获取备用颜色
	const variantConfig = getPetVariantConfig(petType, petVariant);
	const fallbackColor = color || variantConfig?.fallbackColor || '#FFA05C';
	
	return {
		id: generateUUID(),
		name: name || generatePetName(),
		type: petType,
		variant: petVariant,
		color: fallbackColor,
		personality: generateRandomPersonality(),
		state: { type: 'idle', since: Date.now() },
		position: { 
			x: Math.floor(randomFloat(100, window?.innerWidth ? window.innerWidth - 228 : 500)), 
			direction: Math.random() > 0.5 ? 'right' : 'left' 
		},
		createdAt: new Date().toISOString(),
	};
}

// 创建随机宠物
export function createRandomPet(): Pet {
	return createPet();
}

// 向后兼容：从旧数据迁移
export function migrateLegacyPet(legacyPet: Partial<Pet>): Pet {
	// 如果已经有 type 字段，说明是新格式
	if (legacyPet.type) {
		return legacyPet as Pet;
	}

	// 尝试根据颜色匹配变体
	const legacyColor = legacyPet.color || '#FFA05C';
	const matchedLegacy = LEGACY_CAT_COLORS.find(l => l.color === legacyColor);
	
	return {
		id: legacyPet.id || generateUUID(),
		name: legacyPet.name || generatePetName(),
		type: 'cat',
		variant: matchedLegacy?.variant || 'tabby1',
		color: legacyColor,
		personality: legacyPet.personality || generateRandomPersonality(),
		state: legacyPet.state || { type: 'idle', since: Date.now() },
		position: legacyPet.position || { 
			x: Math.floor(randomFloat(100, window?.innerWidth ? window.innerWidth - 228 : 500)), 
			direction: Math.random() > 0.5 ? 'right' : 'left' 
		},
		createdAt: legacyPet.createdAt || new Date().toISOString(),
	};
}

// 更新宠物状态
export function updatePetState(pet: Pet, newState: PetState): Pet {
	return {
		...pet,
		state: newState,
	};
}

// 更新宠物位置
export function updatePetPosition(pet: Pet, x: number, direction?: 'left' | 'right'): Pet {
	return {
		...pet,
		position: {
			...pet.position,
			x,
			...(direction && { direction }),
		},
	};
}

// 更新宠物类型和变体
export function updatePetTypeAndVariant(pet: Pet, type: string, variant: string): Pet {
	const variantConfig = getPetVariantConfig(type, variant);
	return {
		...pet,
		type,
		variant,
		color: variantConfig?.fallbackColor || pet.color,
	};
}

// 抚摸宠物
export function petThePet(pet: Pet): Pet {
	return {
		...pet,
		state: { type: 'petted', since: Date.now() },
	};
}

// 重命名宠物
export function renamePet(pet: Pet, newName: string): Pet {
	return {
		...pet,
		name: newName,
	};
}

// 计算宠物年龄（天数）
export function getPetAgeInDays(pet: Pet): number {
	const created = new Date(pet.createdAt);
	const now = new Date();
	const diffTime = now.getTime() - created.getTime();
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 获取宠物状态描述
export function getPetStateDescription(pet: Pet): string {
	const stateDescriptions: Record<string, string> = {
		idle: '发呆中',
		walk: '散步中',
		sleep: '睡觉中',
		petted: '被抚摸中',
	};
	return stateDescriptions[pet.state.type] || '未知状态';
}

// 获取宠物完整描述
export function getPetFullDescription(pet: Pet): string {
	const typeName = getPetTypeConfig(pet.type)?.name || pet.type;
	const variantName = getVariantDisplayName(pet.type, pet.variant);
	return `${typeName} · ${variantName}`;
}

// 序列化宠物（用于存储）
export function serializePet(pet: Pet): string {
	return JSON.stringify(pet);
}

// 反序列化宠物（从存储加载）
export function deserializePet(json: string): Pet {
	const data = JSON.parse(json);
	// 迁移旧数据
	return migrateLegacyPet(data);
}
