import axios from "axios";
import pako from "pako";

import { ExtractedFile } from "@src/interfaces/store";
import { TarHeader } from "@src/interfaces/utilitites";

class TarReader {
	private buffer: Uint8Array;
	private position: number;

	constructor(arrayBuffer: ArrayBuffer) {
		this.buffer = new Uint8Array(arrayBuffer);
		this.position = 0;
	}

	private readBytes(length: number): Uint8Array {
		const bytes = this.buffer.slice(this.position, this.position + length);
		this.position += length;

		return bytes;
	}

	private readString(length: number): string {
		const bytes = this.readBytes(length);
		const nullIndex = bytes.indexOf(0);
		const endIndex = nullIndex === -1 ? length : nullIndex;

		return new TextDecoder().decode(bytes.slice(0, endIndex));
	}

	private parseOctal(bytes: Uint8Array): number {
		return parseInt(new TextDecoder().decode(bytes).trim(), 8);
	}

	private readHeader(): TarHeader | null {
		const filename = this.readString(100);
		if (!filename) return null;

		const fileSize = this.parseOctal(this.readBytes(12));
		this.position += 376; // Skip remaining header bytes

		return { filename, fileSize };
	}

	public extract(): ExtractedFile[] {
		const files: ExtractedFile[] = [];

		while (this.position < this.buffer.length) {
			const header = this.readHeader();
			if (!header) break;

			const { fileSize, filename } = header;

			if (fileSize > 0) {
				const content = this.readBytes(fileSize);
				files.push({ filename, content, size: fileSize });

				const padding = 512 - (fileSize % 512);
				if (padding < 512) this.position += padding;
			}
		}

		return files;
	}
}

export const fetchAndUnpackTarGz = async (url: string): Promise<ExtractedFile[]> => {
	try {
		const response = await axios.get(url, {
			responseType: "arraybuffer",
			headers: {
				Accept: "application/gzip",
			},
		});

		const decompressed = pako.inflate(new Uint8Array(response.data));
		const tar = new TarReader(decompressed.buffer);

		return tar.extract();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error fetching or unpacking tar.gz: ${error.message}`);
		}
		throw new Error("Unknown error occurred while fetching or unpacking tar.gz");
	}
};
