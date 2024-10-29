import { ComponentType, SVGProps } from "react";

import axios from "axios";
import JSZip from "jszip";

interface FileNode {
	type: "file";
	content: string;
	path: string;
}

interface DirectoryNode {
	type: "directory";
	children: FileStructure;
}

type FrontmatterValue = string | string[];
type FrontmatterData = Record<string, FrontmatterValue>;

const processZipContent = async (zip: JSZip): Promise<FileStructure> => {
	const fileStructure: FileStructure = {};
	const promises: Promise<void>[] = [];

	zip.forEach((relativePath: string, file: JSZip.JSZipObject) => {
		const pathParts = relativePath.split("/");
		let currentLevel = fileStructure;

		const processFile = async () => {
			for (let i = 0; i < pathParts.length; i++) {
				const part = pathParts[i];

				if (i === pathParts.length - 1) {
					if (!file.dir) {
						// Get file content as text
						const content = await file.async("string");
						currentLevel[part] = {
							type: "file",
							content,
							path: relativePath,
						};
					}
				} else {
					if (!currentLevel[part] || isFileNode(currentLevel[part])) {
						currentLevel[part] = {
							type: "directory",
							children: {},
						};
					}
					currentLevel = (currentLevel[part] as DirectoryNode).children;
				}
			}
		};

		promises.push(processFile());
	});

	// Wait for all file contents to be processed
	await Promise.all(promises);

	return fileStructure;
};

interface ProcessedZipResult {
	structure: FileStructure;
	error?: never;
}

interface ProcessedZipError {
	structure?: never;
	error: string;
}

type ProcessedZipOutput = ProcessedZipResult | ProcessedZipError;

export async function fetchAndUnpackZip(): Promise<ProcessedZipOutput> {
	try {
		// // First fetch to get the latest release info
		// const response = await fetch("https://api.github.com/repos/autokitteh/kittehub/releases/latest");

		// if (!response.ok) {
		// 	throw new Error(`Failed to fetch release info: ${response.statusText}`);
		// }

		// const releaseData = await response.json();

		// Fetch the zipball using the URL from the release data
		const downloadUrl = "assets/templates/kittehub.zip"; // releaseData.zipball_url;
		// eslint-disable-next-line no-console
		console.log("Fetching zipball from:", downloadUrl);

		const zipballResponse = await fetch(downloadUrl, {
			mode: "no-cors",
		});

		// eslint-disable-next-line no-console
		console.log("zipballResponse", zipballResponse);
		// eslint-disable-next-line no-console
		console.log("Zipball downloaded, processing...");
		const zipData = await zipballResponse.arrayBuffer();
		// eslint-disable-next-line no-console
		console.log("Creating JSZip instance...");
		const zip = new JSZip();
		// eslint-disable-next-line no-console
		console.log("Loading zip data...");
		const content = await zip.loadAsync(zipData);
		// eslint-disable-next-line no-console
		console.log("Processing zip content...");
		const structure = await processZipContent(content);

		return { structure };
	} catch (error) {
		// Enhanced error logging
		console.error("Detailed error in fetchAndUnpackZip:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : "Unknown error occurred",
			stack: error instanceof Error ? error.stack : undefined,
		});

		return {
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

// Types
export type TemplateCardType = {
	assetDirectory: string;
	description: string;
	files: Record<string, string>; // Changed from string[] to Record<string, string>
	integrations: Integration[];
	title: string;
};

export type TemplateCategory = {
	cards: TemplateCardType[];
	name: string;
};

type Integration = {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	label: string;
	value: string;
};

interface FileNode {
	type: "file";
	content: string;
	path: string;
}

interface DirectoryNode {
	type: "directory";
	children: FileStructure;
}

interface FileStructure {
	[key: string]: FileNode | DirectoryNode;
}

function isFileNode(node: FileNode | DirectoryNode): node is FileNode {
	return node?.type === "file";
}

function isDirectoryNode(node: FileNode | DirectoryNode): node is DirectoryNode {
	return node?.type === "directory";
}

interface FileWithContent {
	path: string;
	content: string;
}

function getAllFilesInDirectory(structure: FileStructure, currentPath: string = ""): FileWithContent[] {
	const files: FileWithContent[] = [];

	Object.entries(structure).forEach(([name, node]) => {
		if (!node) return;

		const fullPath = currentPath ? `${currentPath}/${name}` : name;

		if (isFileNode(node)) {
			files.push({
				path: fullPath,
				content: node.content,
			});
		} else if (isDirectoryNode(node)) {
			// Recursively get files from subdirectories
			const subFiles = getAllFilesInDirectory(node.children, fullPath);
			files.push(...subFiles);
		}
	});

	return files;
}

function getDirectoryStructure(fileStructure: FileStructure, targetPath: string): FileStructure | null {
	if (!targetPath) return fileStructure;

	const pathParts = targetPath.split("/").filter(Boolean);
	let currentLevel = fileStructure;

	for (const part of pathParts) {
		const node = currentLevel[part];
		if (!node || !isDirectoryNode(node)) {
			return null;
		}
		currentLevel = node.children;
	}

	return currentLevel;
}

function parseFrontmatter(content: string): { content: string; data: FrontmatterData } {
	if (!content) {
		return { data: {}, content: "" };
	}

	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { data: {}, content };
	}

	const [, frontmatter, markdownContent] = match;
	const data: FrontmatterData = {};

	frontmatter.split("\n").forEach((line) => {
		const [key, ...valueParts] = line.split(":");
		if (key && valueParts.length) {
			let value: FrontmatterValue = valueParts.join(":").trim();

			if (value.startsWith("[") && value.endsWith("]")) {
				value = value
					.slice(1, -1)
					.split(",")
					.map((v) => v.trim().replace(/^["']|["']$/g, ""));
			}

			data[key.trim()] = value;
		}
	});

	return {
		data,
		content: markdownContent?.trim() ?? "",
	};
}

function getFileName(path: string): string {
	return path.split("/").pop() || path;
}

export function processReadmeFiles(
	fileStructure: FileStructure | null | undefined,
	integrationsMap: Record<string, Integration>
): TemplateCategory[] {
	if (!fileStructure) {
		console.warn("No file structure provided to processReadmeFiles");

		return [];
	}

	const categoriesMap = new Map<string, TemplateCardType[]>();

	function processDirectory(structure: FileStructure, currentPath: string = ""): void {
		if (!structure || typeof structure !== "object") {
			console.warn(`Invalid structure at path: ${currentPath}`);

			return;
		}

		Object.entries(structure).forEach(([name, node]) => {
			if (!node) {
				console.warn(`Null or undefined node found for ${name} at ${currentPath}`);

				return;
			}

			if (isDirectoryNode(node)) {
				processDirectory(node.children, `${currentPath}/${name}`.replace(/^\//, ""));
			} else if (isFileNode(node) && name.toLowerCase() === "readme.md") {
				try {
					const directoryPath = currentPath;
					const directoryStructure = fileStructure
						? getDirectoryStructure(fileStructure, directoryPath)
						: null;

					if (!directoryStructure) {
						console.warn(`Could not find directory structure for ${directoryPath}`);

						return;
					}

					// Get all files with their contents
					const filesWithContent = getAllFilesInDirectory(directoryStructure);

					// Convert to Record<string, string> using only filenames as keys
					const filesRecord: Record<string, string> = {};
					filesWithContent.forEach((file) => {
						const fileName = getFileName(file.path);
						filesRecord[fileName] = file.content;
					});

					// Parse the markdown frontmatter
					const { data } = parseFrontmatter(node.content);

					if (!data.title || !data.description || !data.categories) {
						console.warn(`Skipping ${currentPath}/${name}: Missing required metadata`, data);

						return;
					}

					const templateCard: TemplateCardType = {
						assetDirectory: currentPath,
						description: Array.isArray(data.description) ? data.description.join(", ") : data.description,
						files: filesRecord,
						integrations: (Array.isArray(data.integrations) ? data.integrations : [])
							.map((int) => integrationsMap[int])
							.filter(Boolean),
						title: Array.isArray(data.title) ? data.title.join(", ") : data.title,
					};

					const categories = Array.isArray(data.categories) ? data.categories : [data.categories];

					categories.forEach((category) => {
						const existingCards = categoriesMap.get(category) || [];
						categoriesMap.set(category, [...existingCards, templateCard]);
					});
				} catch (error) {
					console.error(`Error processing ${currentPath}/${name}:`, error);
				}
			}
		});
	}

	try {
		processDirectory(fileStructure);

		return Array.from(categoriesMap.entries())
			.map(([name, cards]) => ({
				name,
				cards: cards.filter(Boolean),
			}))
			.filter((category) => !!category.cards.length);
	} catch (error) {
		console.error("Error processing file structure:", error);

		return [];
	}
}
