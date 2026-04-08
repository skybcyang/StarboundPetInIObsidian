export interface CatPetSettings {
	enabled: boolean;
	maxPets: number;
	showStats: boolean;
	// 新增：默认宠物类型和变体
	defaultPetType: string;
	defaultPetVariant: string;
}

export const DEFAULT_SETTINGS: CatPetSettings = {
	enabled: true,
	maxPets: 5,
	showStats: false,
	defaultPetType: 'cat',
	defaultPetVariant: 'tabby1',
};
