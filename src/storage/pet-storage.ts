import { App, TFile, normalizePath } from 'obsidian';
import { Pet } from '../models/pet';

export class PetStorage {
	private app: App;
	private basePath: string;

	constructor(app: App) {
		this.app = app;
		this.basePath = 'workspace/pets';
	}

	async loadPets(): Promise<Pet[]> {
		try {
			const petsFilePath = normalizePath(`${this.basePath}/pets.json`);
			const petsFile = this.app.vault.getAbstractFileByPath(petsFilePath);
			
			if (petsFile && petsFile instanceof TFile) {
				const content = await this.app.vault.read(petsFile);
				const data = JSON.parse(content);
				return data.pets || [];
			}
			
			return [];
		} catch (error) {
			console.error('Failed to load pets:', error);
			return [];
		}
	}

	async savePets(pets: Pet[]): Promise<void> {
		try {
			// 确保目录存在
			await this.ensureDirectory();
			
			const filePath = normalizePath(`${this.basePath}/pets.json`);
			const data = {
				version: '3.0',
				pets: pets
			};
			const content = JSON.stringify(data, null, 2);
			
			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file && file instanceof TFile) {
				await this.app.vault.modify(file, content);
			} else {
				await this.app.vault.create(filePath, content);
			}
		} catch (error) {
			console.error('Failed to save pets:', error);
			throw error;
		}
	}

	private async ensureDirectory(): Promise<void> {
		const exists = await this.app.vault.adapter.exists(this.basePath);
		if (!exists) {
			await this.app.vault.createFolder(this.basePath);
		}
	}
}
