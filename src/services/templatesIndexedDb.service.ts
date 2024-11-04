import { IndexedDBService } from "@services";

class TemplateStorageService {
	private storage: IndexedDBService;

	constructor() {
		this.storage = new IndexedDBService("TemplatesDB", "templates");
	}

	async storeTemplateFiles(templateId: string, files: Record<string, string>) {
		const entries = Object.entries(files).map(([path, content]) => ({
			name: `${templateId}:${path}`,
			content: this.stringToUint8Array(content),
		}));

		await Promise.all(entries.map(({ content, name }) => this.storage.put(name, content)));
	}

	async getTemplateFiles(templateId: string): Promise<Record<string, string>> {
		const allFiles = await this.storage.getAll();
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
		const allFiles = await this.storage.getAll();
		const key = `${templateId}:${filePath}`;
		const content = allFiles[key];

		return content ? this.uint8ArrayToString(content) : null;
	}

	async deleteTemplateFiles(templateId: string) {
		const allFiles = await this.storage.getAll();
		const deletePromises = Object.keys(allFiles)
			.filter((name) => name.startsWith(`${templateId}:`))
			.map((name) => this.storage.delete(name));

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

export default TemplateStorageService;
