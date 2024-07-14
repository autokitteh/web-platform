class IndexedDBService {
	private dbName: string;
	private storeName: string;
	private db: IDBDatabase | null = null;

	constructor(dbName: string, storeName: string) {
		this.dbName = dbName;
		this.storeName = storeName;
	}

	async initDB() {
		return new Promise<void>((resolve, reject) => {
			const request = indexedDB.open(this.dbName, 1);
			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				db.createObjectStore(this.storeName, { keyPath: "name" });
			};
			request.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				resolve();
			};
			request.onerror = (event) => {
				reject((event.target as IDBOpenDBRequest).error);
			};
		});
	}

	async ensureDBInitialized() {
		if (!this.db) {
			await this.initDB();
		}
	}

	async getAll() {
		await this.ensureDBInitialized();

		return new Promise<Record<string, Uint8Array>>((resolve, reject) => {
			const transaction = this.db!.transaction(this.storeName, "readonly");
			const store = transaction.objectStore(this.storeName);
			const request = store.getAll();
			request.onsuccess = () => {
				const result: Record<string, Uint8Array> = {};
				// eslint-disable-next-line no-return-assign
				request.result.forEach((item) => (result[item.name] = item.content));
				resolve(result);
			};
			request.onerror = () => reject(request.error);
		});
	}

	async put(name: string, content: Uint8Array) {
		await this.ensureDBInitialized();

		return new Promise<void>((resolve, reject) => {
			const transaction = this.db!.transaction(this.storeName, "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.put({ name, content });
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async delete(name: string) {
		await this.ensureDBInitialized();

		return new Promise<void>((resolve, reject) => {
			const transaction = this.db!.transaction(this.storeName, "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.delete(name);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
}

export default IndexedDBService;
