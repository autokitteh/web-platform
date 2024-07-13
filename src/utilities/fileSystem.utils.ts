import { FileData } from "@interfaces/utilities";

export const readFileAsUint8Array = (file: File): Promise<Uint8Array> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
		reader.onerror = () => reject(reader.error);

		reader.readAsArrayBuffer(file);
	});
};

export const openDatabase = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("ProjectStore", 1);
		request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
			const db = (event.target as IDBOpenDBRequest).result;
			db.createObjectStore("files", { keyPath: "name" });
		};
		request.onsuccess = (event: Event) => resolve((event.target as IDBOpenDBRequest).result);
		request.onerror = (event: Event) => reject((event.target as IDBOpenDBRequest).error);
	});
};

export const saveFile = (db: IDBDatabase, fileName: string, content: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(["files"], "readwrite");
		const store = transaction.objectStore("files");
		const request = store.put({ content, name: fileName } as FileData);
		request.onsuccess = () => resolve();
		request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
	});
};

export const getFile = (db: IDBDatabase, fileName: string): Promise<string | null> => {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(["files"], "readonly");
		const store = transaction.objectStore("files");
		const request = store.get(fileName);
		request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result?.content || null);
		request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
	});
};

export const byteArrayToString = (byteArray: Uint8Array): string => {
	let result = "";
	const chunkSize = 8192;
	for (let i = 0; i < byteArray.length; i += chunkSize) {
		result += String.fromCharCode.apply(null, Array.from(byteArray.slice(i, i + chunkSize)));
	}

	return result;
};
