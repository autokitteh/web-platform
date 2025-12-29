import { openDB } from "idb";

import { useCacheStore, useTemplatesStore, useTourStore } from "@src/store";

export class IndexedDBService {
	private dbName: string;
	private storeName: string;
	private db: any;

	constructor(dbName: string, storeName: string) {
		this.dbName = dbName;
		this.storeName = storeName;
	}

	async getAllRecords() {
		await this.EnsureDBInitialized();
		return await this.db.getAll(this.storeName);
	}

	async InitDB() {
		const storeName = this.storeName;
		this.db = await openDB(this.dbName, 2, {
			upgrade: async (db) => {
				if (db.objectStoreNames.contains(storeName)) {
					db.deleteObjectStore(storeName);
					if (storeName === "templates") {
						useTemplatesStore.getState().reset();
					}
					if (storeName === "resources") {
						useCacheStore.getState().reset("resources");
					}
					if (storeName === "tours") {
						useTourStore.getState().reset();
					}
				}

				db.createObjectStore(storeName, { keyPath: "projectId" });
			},
		});
	}

	async EnsureDBInitialized() {
		if (!this.db) {
			await this.InitDB();
		}
	}

	async getAll(projectId: string) {
		await this.EnsureDBInitialized();
		if (!projectId) return;

		const items = await this.db.get(this.storeName, projectId);
		if (!items?.files) return;
		const result: Record<string, Uint8Array> = {};
		items.files.forEach((item: any) => {
			result[item.name] = item.content;
		});

		return result;
	}

	async put(projectId: string, files: { content: Uint8Array; name: string }[]) {
		await this.EnsureDBInitialized();
		const existingProject = await this.db.get(this.storeName, projectId);
		if (existingProject) {
			const updatedFiles = existingProject.files
				.filter(
					(existingFile: { content: Uint8Array; name: string }) =>
						!files.some((newFile) => newFile.name === existingFile.name)
				)
				.concat(files);

			await this.db.put(this.storeName, { projectId, files: updatedFiles });

			return;
		}
		await this.db.put(this.storeName, { projectId, files });
	}

	async delete(projectId: string, name: string) {
		await this.EnsureDBInitialized();
		const items = await this.db.get(this.storeName, projectId);
		const updatedFiles = items?.files?.filter((item: { name: string }) => item.name !== name);
		await this.db.put(this.storeName, { projectId, files: updatedFiles });
	}

	async replaceAll(projectId: string, files: { content: Uint8Array; name: string }[]) {
		await this.EnsureDBInitialized();
		await this.db.put(this.storeName, { projectId, files });
	}

	async clearStore() {
		await this.EnsureDBInitialized();
		const tx = this.db.transaction(this.storeName, "readwrite");
		await tx.objectStore(this.storeName).clear();
		await tx.done;
	}

	async getFilesByProjectId(projectId: string): Promise<{ content: Uint8Array; name: string }[]> {
		await this.EnsureDBInitialized();
		const allEntries = await this.db.getAll(this.storeName);
		const projectFiles = allEntries.find((entry: { projectId: string }) => entry.projectId === projectId);

		return projectFiles ? projectFiles.files : [];
	}
}
