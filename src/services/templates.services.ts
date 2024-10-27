import { DBSchema, IDBPDatabase, openDB } from "idb";

import { ArchivedFile, ProcessedTemplate } from "@src/interfaces/store/templates.interface";
import { StorableTemplate, createStorableTemplate, rehydrateTemplate } from "@src/store/useTemplatesStore";

interface TemplateDB extends DBSchema {
	templates: {
		key: string;
		value: StorableTemplate;
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

	async saveArchive(key: string, archive: ArchivedFile) {
		const db = await this.db;
		await db.put("archives", archive, key);
	}

	async clearAll() {
		const db = await this.db;
		await db.clear("templates");
		await db.clear("archives");
	}

	async saveTemplate(key: string, template: ProcessedTemplate) {
		const db = await this.db;
		const storableTemplate = createStorableTemplate(template);
		await db.put("templates", storableTemplate, key);
	}

	async getTemplate(key: string): Promise<ProcessedTemplate | null> {
		const db = await this.db;
		const storedTemplate = await db.get("templates", key);

		return storedTemplate ? rehydrateTemplate(storedTemplate as StorableTemplate) : null;
	}

	async getAllTemplates(): Promise<ProcessedTemplate[]> {
		const db = await this.db;
		const storedTemplates = await db.getAll("templates");

		return storedTemplates.map((template) => rehydrateTemplate(template as unknown as StorableTemplate));
	}
}

export const templateDB = new TemplateDatabase();
