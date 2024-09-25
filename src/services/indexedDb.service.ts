import { openDB } from "idb";

class IndexedDBService {
	private dbName: string;
	private storeName: string;
	private db: any;

	constructor(dbName: string, storeName: string) {
		this.dbName = dbName;
		this.storeName = storeName;
	}

	async InitDB() {
		const storeName = this.storeName;
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

	async put(name: string, content: Uint8Array) {
		await this.EnsureDBInitialized();
		await this.db.put(this.storeName, { name, content });
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
}

export default IndexedDBService;
