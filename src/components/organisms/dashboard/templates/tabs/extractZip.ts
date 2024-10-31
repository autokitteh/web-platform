import { ComponentType, SVGProps } from "react";

import axios from "axios";
import frontMatter from "front-matter";
import JSZip from "jszip";

import { Integrations, IntegrationsMap } from "@src/enums/components/connection.enum";

interface FileNode {
	type: "file";
	content: string;
	path: string;
}

interface DirectoryNode {
	type: "directory";
	children: FileStructure;
}

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
		const downloadUrl = "https://raw.githubusercontent.com/autokitteh/kittehub/refs/heads/release/dist.zip"; // releaseData.zipball_url;
		// eslint-disable-next-line no-console
		console.log("Fetching zipball from:", downloadUrl);

		const { data: zipballResponse } = await axios.get(downloadUrl, { responseType: "arraybuffer" });

		// eslint-disable-next-line no-console
		console.log("zipballResponse", zipballResponse);
		// eslint-disable-next-line no-console
		console.log("Zipball downloaded, processing...");
		const zipData = await zipballResponse;
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
// Update the interfaces to match front-matter's types
interface MarkdownAttributes {
	[key: string]: unknown;
	title?: string;
	description?: string;
	categories?: string | string[];
	integrations?: string[];
}

// Your existing types remain the same
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

function getFileName(path: string): string {
	return path.split("/").pop() || path;
}

export function processReadmeFiles(fileStructure: FileStructure | null | undefined): TemplateCategory[] {
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
					const filesRecord: Record<string, string> = {};
					filesWithContent.forEach((file) => {
						const fileName = getFileName(file.path);
						filesRecord[fileName] = file.content;
					});

					// Parse using front-matter instead of gray-matter
					const { attributes } = frontMatter<MarkdownAttributes>(node.content);

					if (!attributes.title || !attributes.description || !attributes.categories) {
						console.warn(`Skipping ${currentPath}/${name}: Missing required metadata`, attributes);

						return;
					}

					const templateCard: TemplateCardType = {
						assetDirectory: currentPath,
						description: Array.isArray(attributes.description)
							? attributes.description.join(", ")
							: attributes.description,
						files: filesRecord,
						integrations: (Array.isArray(attributes.integrations) ? attributes.integrations : [])
							.map((int) => IntegrationsMap[int as keyof typeof Integrations])
							.filter(Boolean),
						title: Array.isArray(attributes.title) ? attributes.title.join(", ") : attributes.title,
					};

					const categories = Array.isArray(attributes.categories)
						? attributes.categories
						: [attributes.categories];

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
