import { IndexedDBService } from "@services";
import { IndexedDBTourType } from "@src/types";
import { stringToUint8Array, uint8ArrayToString } from "@src/utilities";

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

	public async getAllRecords(): Promise<IndexedDBTourType[]> {
		return this.storage.getAllRecords();
	}

	public static getInstance(): TourStorageService {
		if (!TourStorageService.instance) {
			TourStorageService.instance = new TourStorageService();
		}
		return TourStorageService.instance;
	}

	async storeTourFiles(tourId: string, files: Record<string, string>) {
		const entries = Object.entries(files).map(([path, content]) => ({
			name: `${tourId}:${path}`,
			content: stringToUint8Array(content),
		}));

		await this.storage.put(tourId, entries);
	}

	async getFiles(tourId: string): Promise<Record<string, string>> {
		const allFiles = await this.storage.getAll(tourId);
		if (!allFiles) return {};
		const tourFiles = Object.entries(allFiles)
			.filter(([name]) => name.startsWith(`${tourId}:`))
			.reduce((acc: Record<string, string>, [name, content]) => {
				const filename = name.split(":")[1].split("/").pop() || "";
				acc[filename] = uint8ArrayToString(content as Uint8Array);
				return acc;
			}, {});

		return tourFiles;
	}

	async clearAll() {
		await this.storage.clearStore();
	}
}

export const tourStorage = TourStorageService.getInstance();
