// src/services/tourIndexedDb.service.ts
import { IndexedDBService } from "./indexedDb.service";

export class TourStorageService {
	private static instance: TourStorageService;

	private _storage?: IndexedDBService;

	private get storage(): IndexedDBService {
		if (!this._storage) {
			this._storage = new IndexedDBService("ToursDB", "tours");
		}
		return this._storage;
	}

	private constructor() {}

	public static getInstance(): TourStorageService {
		if (!TourStorageService.instance) {
			TourStorageService.instance = new TourStorageService();
		}
		return TourStorageService.instance;
	}

	async storeTourFiles(tourId: string, files: Record<string, string>) {
		const entries = Object.entries(files).map(([path, content]) => ({
			name: `${tourId}:${path}`,
			content: this.stringToUint8Array(content),
		}));

		const filesArray = entries.map(({ content, name }) => ({ name, content }));

		await this.storage.put(tourId, filesArray);
	}

	async getFiles(tourId: string): Promise<Record<string, string>> {
		const allFiles = await this.storage.getAll(tourId);
		if (!allFiles) return {};
		const tourFiles = Object.entries(allFiles)
			.filter(([name]) => name.startsWith(`${tourId}:`))
			.reduce((acc: Record<string, string>, [name, content]) => {
				const filename = name.split(":")[1].split("/").pop() || "";
				acc[filename] = this.uint8ArrayToString(content as Uint8Array);
				return acc;
			}, {});

		return tourFiles;
	}

	async getTourFile(tourId: string, filePath: string): Promise<string | null> {
		const allFiles = await this.storage.getAll(tourId);
		if (!allFiles) return null;
		const key = `${tourId}:${filePath}`;
		const content = allFiles[key];

		return content ? this.uint8ArrayToString(content) : null;
	}

	async deleteTourFiles(tourId: string) {
		const allFiles = await this.storage.getAll(tourId);
		if (!allFiles) return;
		const deletePromises = Object.keys(allFiles)
			.filter((name) => name.startsWith(`${tourId}:`))
			.map((name) => this.storage.delete(tourId, name));

		await Promise.all(deletePromises);
	}

	async clearAll() {
		await this.storage.clearStore();
	}

	private stringToUint8Array(str: string): Uint8Array {
		const encoder = new TextEncoder();
		return encoder.encode(str);
	}

	private uint8ArrayToString(array: Uint8Array): string {
		const decoder = new TextDecoder();
		return decoder.decode(array);
	}
}

export const tourStorage = TourStorageService.getInstance();
