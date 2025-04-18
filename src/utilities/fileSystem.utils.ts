export const readFileAsUint8Array = (file: File): Promise<Uint8Array> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
		reader.onerror = () => reject(reader.error);

		reader.readAsArrayBuffer(file);
	});
};

export const stringToUint8Array = (str: string): Uint8Array => {
	const encoder = new TextEncoder();
	return encoder.encode(str);
};

export const uint8ArrayToString = (array: Uint8Array): string => {
	const decoder = new TextDecoder();
	return decoder.decode(array);
};
