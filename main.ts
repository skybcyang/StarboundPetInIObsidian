import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { CatPetSettings, DEFAULT_SETTINGS } from './settings';
import { PetStorage } from './src/storage/pet-storage';
import { PetContainer } from './src/ui/pet-container';
import { 
	createPet, 
	PET_TYPES, 
	getPetTypeConfig, 
	getPetVariantConfig,
	getPetTypeOptions,
	getPetVariantOptions,
	getPetFullDescription,
} from './src/models/pet';

export default class CatPetPlugin extends Plugin {
	settings: CatPetSettings;
	storage: PetStorage;
	container: PetContainer;

	async onload() {
		console.log('Loading Obsidian Pet Plugin');

		// 加载设置
		await this.loadSettings();

		// 初始化存储
		this.storage = new PetStorage(this.app);

		// 初始化浮动容器
		if (this.settings.enabled) {
			this.container = new PetContainer(this.app, this);
			await this.loadPets();
		}

		// 注册设置面板
		this.addSettingTab(new CatPetSettingTab(this.app, this));

		// 注册新建宠物命令
		this.addCommand({
			id: 'create-pet',
			name: '新建宠物',
			callback: () => {
				this.createPet();
			}
		});

		// 注册显示/隐藏命令
		this.addCommand({
			id: 'toggle-visibility',
			name: '显示/隐藏宠物',
			callback: () => {
				this.toggleVisibility();
			}
		});
	}

	onunload() {
		console.log('Unloading Obsidian Pet Plugin');
		if (this.container) {
			this.container.destroy();
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadPets() {
		const pets = await this.storage.loadPets();
		if (pets.length === 0) {
			console.log('No pets found. Use "新建宠物" command to create one.');
		} else {
			for (const pet of pets) {
				this.container.addPet(pet);
			}
		}
	}

	toggleVisibility() {
		if (this.container) {
			this.container.toggleVisibility();
			this.settings.enabled = this.container.isVisible();
			this.saveSettings();
		}
	}

	// 供外部调用的方法
	getPets() {
		return this.container?.getPets() || [];
	}

	createPet() {
		return this.container?.createPet();
	}
}

class CatPetSettingTab extends PluginSettingTab {
	plugin: CatPetPlugin;

	constructor(app: App, plugin: CatPetPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: '🐱 宠物设置' });

		// 启用/禁用
		new Setting(containerEl)
			.setName('启用宠物')
			.setDesc('显示/隐藏所有宠物')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enabled)
				.onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
					if (value && !this.plugin.container) {
						this.plugin.container = new PetContainer(this.app, this.plugin);
						await this.plugin.loadPets();
					} else if (!value && this.plugin.container) {
						this.plugin.container.destroy();
						this.plugin.container = null as any;
					}
				}));

		// 最大宠物数量
		new Setting(containerEl)
			.setName('最大宠物数量')
			.setDesc('限制同时显示的宠物数量')
			.addSlider(slider => slider
				.setLimits(1, 10, 1)
				.setValue(this.plugin.settings.maxPets)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxPets = value;
					await this.plugin.saveSettings();
				}));

		// 默认宠物类型
		new Setting(containerEl)
			.setName('默认宠物类型')
			.setDesc('新建宠物时默认使用的类型')
			.addDropdown(dropdown => {
				const options = getPetTypeOptions();
				options.forEach(opt => dropdown.addOption(opt.value, opt.label));
				return dropdown
					.setValue(this.plugin.settings.defaultPetType)
					.onChange(async (value) => {
						this.plugin.settings.defaultPetType = value;
						// 更新默认变体为该类型的第一个变体
						const typeConfig = getPetTypeConfig(value);
						if (typeConfig && typeConfig.variants.length > 0) {
							this.plugin.settings.defaultPetVariant = typeConfig.variants[0].id;
						}
						await this.plugin.saveSettings();
						this.display(); // 刷新显示以更新变体选项
					});
			});

		// 默认宠物变体
		new Setting(containerEl)
			.setName('默认宠物外观')
			.setDesc('新建宠物时默认使用的外观')
			.addDropdown(dropdown => {
				const options = getPetVariantOptions(this.plugin.settings.defaultPetType);
				options.forEach(opt => dropdown.addOption(opt.value, opt.label));
				return dropdown
					.setValue(this.plugin.settings.defaultPetVariant)
					.onChange(async (value) => {
						this.plugin.settings.defaultPetVariant = value;
						await this.plugin.saveSettings();
					});
			});

		// 显示统计信息
		new Setting(containerEl)
			.setName('显示统计信息')
			.setDesc('在设置面板显示当前宠物列表')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showStats)
				.onChange(async (value) => {
					this.plugin.settings.showStats = value;
					await this.plugin.saveSettings();
					this.display(); // 刷新显示
				}));

		// 使用说明
		containerEl.createEl('h3', { text: '使用说明' });
		const infoEl = containerEl.createEl('div', { cls: 'setting-item-description' });
		infoEl.innerHTML = `
			<p>右键点击宠物可以：</p>
			<ul>
				<li>💬 <strong>开始对话</strong> - 打开聊天气泡与宠物互动</li>
				<li>📝 <strong>转化为卡片</strong> - 将对话保存为笔记</li>
				<li>✏️ <strong>改名</strong> - 给宠物起新名字</li>
			</ul>
			<p>左键点击宠物可以抚摸它 ❤️</p>
		`;

		// 可用宠物类型
		containerEl.createEl('h3', { text: '可用宠物类型' });
		const typeList = containerEl.createEl('ul');
		PET_TYPES.forEach(type => {
			const li = typeList.createEl('li');
			li.setText(`${type.name}: ${type.variants.length} 种外观`);
		});

		// 统计信息
		if (this.plugin.settings.showStats) {
			containerEl.createEl('h3', { text: '当前宠物' });
			
			const pets = this.plugin.getPets();
			if (pets.length === 0) {
				containerEl.createEl('p', { text: '还没有宠物，使用命令「新建宠物」来创建。' });
			} else {
				const list = containerEl.createEl('ul');
				for (const pet of pets) {
					const item = list.createEl('li');
					item.setText(`${pet.name} (${getPetFullDescription(pet)}) - ${this.getStateText(pet.state.type)}`);
				}
			}
		}
	}

	private getStateText(state: string): string {
		const stateMap: Record<string, string> = {
			idle: '发呆中',
			walk: '散步中',
			sleep: '睡觉中',
			petted: '被抚摸中',
		};
		return stateMap[state] || '未知状态';
	}
}
