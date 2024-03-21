export const readFileAsUint8Array = (file: File): Promise<Uint8Array> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
		reader.onerror = () => reject(reader.error);

		reader.readAsArrayBuffer(file);
	});
};
