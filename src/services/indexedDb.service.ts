import { openDB } from "idb";

import { ProjectsService } from "./projects.service";

class IndexedDBService {
	private dbName: string;
	private storeName: string;
	private db: any;

	constructor(dbName: string, storeName: string) {
		this.dbName = dbName;
		this.storeName = storeName;
	}

	async InitDB() {
		const storeName = this.storeName; // Capture storeName in a closure
		this.db = await openDB(this.dbName, 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(storeName)) {
					db.createObjectStore(storeName, { keyPath: "name" });
				}
			},
		});
	}

	async EnsureDBInitialized() {
		if (!this.db) {
			await this.InitDB();
		}
	}

	async getAll() {
		await this.EnsureDBInitialized();
		const items = await this.db.getAll(this.storeName);
		const result: Record<string, Uint8Array> = {};
		items.forEach((item: any) => {
			result[item.name] = item.content;
		});

		return result;
	}

	async put(name: string, content: Uint8Array, projectId: string) {
		await this.EnsureDBInitialized();
		await this.db.put(this.storeName, { name, content });

		const resources = await this.getAll();

		await ProjectsService.setResources(projectId, resources);
	}

	async delete(name: string) {
		await this.EnsureDBInitialized();
		await this.db.delete(this.storeName, name);
	}

	async clearStore() {
		await this.EnsureDBInitialized();
		const tx = this.db.transaction(this.storeName, "readwrite");
		await tx.objectStore(this.storeName).clear();
		await tx.done;
	}

	async fetchResources(projectId: string) {
		await this.EnsureDBInitialized();
		const { data: resourcesFromService, error } = await ProjectsService.getResources(projectId);
		if (error) {
			throw error;
		}

		for (const [name, content] of Object.entries(resourcesFromService || {})) {
			await this.put(name, new Uint8Array(content), projectId);
		}
		const loadedResources = await this.getAll();

		return loadedResources;
	}

	async addFile(name: string, projectId: string) {
		const resources = await this.getAll();
		const { error } = await ProjectsService.setResources(projectId, {
			...resources,
			[name]: new Uint8Array(),
		});

		if (error) {
			throw error;
		}
	}
}

export default IndexedDBService;
