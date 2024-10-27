import pako from "pako";

interface FileEntry {
	name: string;
	type: "file";
	content?: string;
	path: string;
	size?: number;
	lastModified?: Date;
}

interface ExtractOptions {
	onProgress?: (progress: number) => void;
	includeContent?: boolean;
}

interface TarHeader {
	fileName: string;
	fileSize: number;
	fileType: string;
	modificationTime: number;
}

function shouldIncludeFile(path: string): boolean {
	const parts = path.split("/");

	// List of excluded patterns and extensions
	const excludedPatterns = [
		"._", // macOS resource forks
		".DS_Store", // macOS system files
		"__MACOSX", // macOS system directory
		"PaxHeader", // PaxHeader entries
	];

	const excludedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".webp", ".svg", ".ico"];

	// Check if any part of the path matches excluded patterns
	if (parts.some((part) => excludedPatterns.some((pattern) => part.includes(pattern)))) {
		return false;
	}

	// Check file extension
	if (excludedExtensions.some((ext) => path.toLowerCase().endsWith(ext))) {
		return false;
	}

	return true;
}

function readTarHeader(buffer: Uint8Array, offset: number): TarHeader | null {
	// Check for end of archive (two consecutive zero blocks)
	if (buffer.slice(offset, offset + 512).every((byte) => byte === 0)) {
		return null;
	}

	const nameBuffer = buffer.slice(offset, offset + 100);
	const sizeBuffer = buffer.slice(offset + 124, offset + 136);
	const typeBuffer = buffer.slice(offset + 156, offset + 157);
	const timeBuffer = buffer.slice(offset + 136, offset + 148);

	// Get filename (null-terminated string)
	let fileName = "";
	for (let i = 0; i < 100 && nameBuffer[i] !== 0; i++) {
		fileName += String.fromCharCode(nameBuffer[i]);
	}

	// Get file size (octal string)
	let sizeStr = "";
	for (let i = 0; i < 12 && sizeBuffer[i] !== 0; i++) {
		sizeStr += String.fromCharCode(sizeBuffer[i]);
	}
	const fileSize = parseInt(sizeStr.trim(), 8);

	// Get file type
	const fileType = String.fromCharCode(typeBuffer[0]);

	// Get modification time (octal string)
	let timeStr = "";
	for (let i = 0; i < 12 && timeBuffer[i] !== 0; i++) {
		timeStr += String.fromCharCode(timeBuffer[i]);
	}
	const modificationTime = parseInt(timeStr.trim(), 8);

	return {
		fileName,
		fileSize,
		fileType,
		modificationTime,
	};
}

async function extractTar(buffer: Uint8Array): Promise<FileEntry[]> {
	const files: FileEntry[] = [];
	let offset = 0;

	while (offset < buffer.length) {
		const header = readTarHeader(buffer, offset);
		if (!header) break;

		const path = header.fileName;

		// Skip files we don't want to include
		if (shouldIncludeFile(path)) {
			const isDirectory = header.fileType === "5" || header.fileName.endsWith("/");

			// Only process files, not directories
			if (!isDirectory) {
				const name = path.split("/").pop() || path;
				const content = new TextDecoder().decode(buffer.slice(offset + 512, offset + 512 + header.fileSize));

				files.push({
					name,
					type: "file",
					content,
					path,
					size: header.fileSize,
					lastModified: new Date(header.modificationTime * 1000),
				});
			}
		}

		// Move to next header (512-byte aligned)
		offset += 512 + Math.ceil(header.fileSize / 512) * 512;
	}

	return files;
}

export async function fetchAndUnpackTarGz(url: string, options: ExtractOptions = {}): Promise<FileEntry[]> {
	const { includeContent = true, onProgress } = options;

	try {
		// Fetch the tar.gz file
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Get the compressed data
		const compressedData = await response.arrayBuffer();

		// Decompress using pako
		const inflated = pako.inflate(new Uint8Array(compressedData));

		// Extract the tar content
		const files = await extractTar(inflated);

		// Sort files by path
		const sortedFiles = files.sort((a, b) => {
			// Sort by path depth (shorter paths first)
			const aDepth = a.path.split("/").length;
			const bDepth = b.path.split("/").length;
			if (aDepth !== bDepth) return aDepth - bDepth;

			// Alpha sort for same depth
			return a.path.localeCompare(b.path);
		});

		// Log the sorted files
		console.log("Sorted files:", sortedFiles);

		return sortedFiles;
	} catch (error) {
		console.error("Error extracting templates:", error);
		throw error;
	}
}
