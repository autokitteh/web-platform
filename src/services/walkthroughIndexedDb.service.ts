import { IndexedDBService } from "@services";

export class WalkthroughStorageService {
	private static instance: WalkthroughStorageService;
	private storage: IndexedDBService;

	constructor() {
		this.storage = new IndexedDBService("WalkthroughsDB", "walkthroughs");
	}

	public static getInstance(): WalkthroughStorageService {
		if (!WalkthroughStorageService.instance) {
			WalkthroughStorageService.instance = new WalkthroughStorageService();
		}
		return WalkthroughStorageService.instance;
	}

	async storeWalkthroughFiles(walkthroughId: string, files: Record<string, string>) {
		const entries = Object.entries(files).map(([path, content]) => ({
			name: `${walkthroughId}:${path}`,
			content: this.stringToUint8Array(content),
		}));

		const filesArray = entries.map(({ content, name }) => ({ name, content }));

		await this.storage.put(walkthroughId, filesArray);
	}

	async getWalkthroughFiles(walkthroughId: string): Promise<Record<string, string>> {
		const allFiles = await this.storage.getAll(walkthroughId);
		if (!allFiles) return {};
		const walkthroughFiles = Object.entries(allFiles)
			.filter(([name]) => name.startsWith(`${walkthroughId}:`))
			.reduce((acc: Record<string, string>, [name, content]) => {
				const filename = name.split(":")[1].split("/").pop() || "";
				acc[filename] = this.uint8ArrayToString(content as Uint8Array);
				return acc;
			}, {});

		return walkthroughFiles;
	}

	async getWalkthroughFile(walkthroughId: string, filePath: string): Promise<string | null> {
		const allFiles = await this.storage.getAll(walkthroughId);
		if (!allFiles) return null;
		const key = `${walkthroughId}:${filePath}`;
		const content = allFiles[key];

		return content ? this.uint8ArrayToString(content) : null;
	}

	async deleteWalkthroughFiles(walkthroughId: string) {
		const allFiles = await this.storage.getAll(walkthroughId);
		if (!allFiles) return;
		const deletePromises = Object.keys(allFiles)
			.filter((name) => name.startsWith(`${walkthroughId}:`))
			.map((name) => this.storage.delete(walkthroughId, name));

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

export const walkthroughStorage = WalkthroughStorageService.getInstance();
