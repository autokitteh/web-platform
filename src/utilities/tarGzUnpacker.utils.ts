import axios from "axios";
import pako from "pako";

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
		const str = new TextDecoder().decode(bytes).trim();

		return str ? parseInt(str, 8) : 0;
	}

	private readHeader(): TarHeader | null {
		// Check if we've reached the end of the archive (two consecutive zero blocks)
		if (this.position + 512 > this.buffer.length) {
			return null;
		}

		// Check if we've reached a zero block
		const block = this.buffer.slice(this.position, this.position + 512);
		if (block.every((b) => b === 0)) {
			this.position += 512;

			return null;
		}

		const filename = this.readString(100);
		const size = this.parseOctal(this.readBytes(12));
		const type = this.readBytes(1)[0];

		// Skip remaining header bytes
		this.position += 255;

		return {
			filename,
			fileSize: size,
			type: type || 0,
		};
	}

	public extract(): ExtractedFile[] {
		const files: ExtractedFile[] = [];

		while (this.position < this.buffer.length - 512) {
			// Leave room for header
			const header = this.readHeader();
			if (!header) {
				// Skip empty block
				continue;
			}

			const { fileSize, filename, type } = header;

			// Skip directories (type '5') and special files
			if (fileSize > 0 && type !== 53) {
				// 53 is ASCII for '5'
				const content = this.readBytes(fileSize);
				files.push({
					filename,
					content,
					size: fileSize,
				});

				// Handle padding
				const padding = 512 - (fileSize % 512);
				if (padding < 512) {
					this.position += padding;
				}
			} else {
				// For directories and empty files, still handle padding
				const padding = 512 - (fileSize % 512);
				if (padding < 512) {
					this.position += padding;
				}
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
		const files = tar.extract();

		return files;
	} catch (error) {
		console.error("Error details:", error);
		if (error instanceof Error) {
			throw new Error(`Error fetching or unpacking tar.gz: ${error.message}`);
		}
		throw new Error("Unknown error occurred while fetching or unpacking tar.gz");
	}
};

// Updated interfaces
interface TarHeader {
	filename: string;
	fileSize: number;
	type: number;
}

interface ExtractedFile {
	filename: string;
	content: Uint8Array;
	size: number;
}
