import { DBSchema, IDBPDatabase, openDB } from "idb";

import { ArchivedFile, ProcessedTemplate } from "@src/interfaces/store/templates.interface";

interface TemplateDB extends DBSchema {
	templates: {
		key: string;
		value: ProcessedTemplate;
	};
	archives: {
		key: string;
		value: ArchivedFile;
	};
}

class TemplateDatabase {
	private db: Promise<IDBPDatabase<TemplateDB>>;

	constructor() {
		this.db = openDB<TemplateDB>("template-store", 1, {
			upgrade(db) {
				db.createObjectStore("templates");
				db.createObjectStore("archives");
			},
		});
	}

	async saveTemplate(key: string, template: ProcessedTemplate) {
		const db = await this.db;
		await db.put("templates", template, key);
	}

	async saveArchive(key: string, archive: ArchivedFile) {
		const db = await this.db;
		await db.put("archives", archive, key);
	}

	async getTemplate(key: string) {
		const db = await this.db;

		return db.get("templates", key);
	}

	async getAllTemplates() {
		const db = await this.db;

		return db.getAll("templates");
	}

	async clearAll() {
		const db = await this.db;
		await db.clear("templates");
		await db.clear("archives");
	}
}

export const templateDB = new TemplateDatabase();
