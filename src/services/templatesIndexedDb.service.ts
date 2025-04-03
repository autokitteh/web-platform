import { IndexedDBService } from "@services";

export class TemplateStorageService {
	private static instance: TemplateStorageService;

	private storage: IndexedDBService;

	constructor() {
		this.storage = new IndexedDBService("TemplatesDB", "templates");
	}

	public static getInstance(): TemplateStorageService {
		if (!TemplateStorageService.instance) {
			TemplateStorageService.instance = new TemplateStorageService();
		}
		return TemplateStorageService.instance;
	}

	async storeTemplateFiles(templateId: string, files: Record<string, string>) {
		const entries = Object.entries(files).map(([path, content]) => ({
			name: `${templateId}:${path}`,
			content: this.stringToUint8Array(content),
		}));

		const filesArray = entries.map(({ content, name }) => ({ name, content }));

		await this.storage.put(templateId, filesArray);
	}

	async getFiles(templateId: string): Promise<Record<string, string>> {
		const allFiles = await this.storage.getAll(templateId);
		if (!allFiles) return {};
		const templateFiles = Object.entries(allFiles)
			.filter(([name]) => name.startsWith(`${templateId}:`))
			.reduce((acc: Record<string, string>, [name, content]) => {
				const filename = name.split(":")[1].split("/").pop() || "";
				acc[filename] = this.uint8ArrayToString(content as Uint8Array);

				return acc;
			}, {});

		return templateFiles;
	}

	async getTemplateFile(templateId: string, filePath: string): Promise<string | null> {
		const allFiles = await this.storage.getAll(templateId);
		if (!allFiles) return null;
		const key = `${templateId}:${filePath}`;
		const content = allFiles[key];

		return content ? this.uint8ArrayToString(content) : null;
	}

	async deleteTemplateFiles(templateId: string) {
		const allFiles = await this.storage.getAll(templateId);
		if (!allFiles) return;
		const deletePromises = Object.keys(allFiles)
			.filter((name) => name.startsWith(`${templateId}:`))
			.map((name) => this.storage.delete(templateId, name));

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

export const templateStorage = TemplateStorageService.getInstance();
