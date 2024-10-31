import axios from "axios";
import frontMatter from "front-matter";
import i18n from "i18next";
import JSZip from "jszip";

import {
	DirectoryNode,
	FileNode,
	FileStructure,
	FileWithContent,
	MarkdownAttributes,
	ProcessedZipOutput,
} from "@interfaces/utilities";
import { remoteTemplatesRepositoryURL } from "@src/constants";
import { RemoteTemplateCardType, RemoteTemplateCategory } from "@src/types/components";

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

	await Promise.all(promises);

	return fileStructure;
};

export async function fetchAndUnpackZip(): Promise<ProcessedZipOutput> {
	try {
		const downloadUrl = remoteTemplatesRepositoryURL;
		const { data: zipballResponse } = await axios.get(downloadUrl, { responseType: "arraybuffer" });

		const zipData = await zipballResponse;
		const zip = new JSZip();
		const content = await zip.loadAsync(zipData);
		const structure = await processZipContent(content);

		return { structure };
	} catch (error) {
		console.error(
			i18n.t("fetchAndExtract.fetchAndExtractError", {
				namespace: "utilities",
				name: error instanceof Error ? error.name : "Unknown",
				message: error instanceof Error ? error.message : "Unknown error occurred",
				stack: error instanceof Error ? error.stack : undefined,
			})
		);

		return {
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

function isFileNode(node: FileNode | DirectoryNode): node is FileNode {
	return node?.type === "file";
}

function isDirectoryNode(node: FileNode | DirectoryNode): node is DirectoryNode {
	return node?.type === "directory";
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

const getFileName = (path: string): string => path.split("/").pop() || path;

export function processReadmeFiles(fileStructure: FileStructure | null | undefined): RemoteTemplateCategory[] {
	if (!fileStructure) {
		console.warn(
			i18n.t("fetchAndExtract.noFileStructure", {
				ns: "utilities",
			})
		);

		return [];
	}

	const categoriesMap = new Map<string, RemoteTemplateCardType[]>();

	function processDirectory(structure: FileStructure, currentPath: string = ""): void {
		if (!structure || typeof structure !== "object") {
			console.warn(
				i18n.t("fetchAndExtract.invalidStructurePath", {
					ns: "utilities",
					path: currentPath,
				})
			);

			return;
		}

		Object.entries(structure).forEach(([name, node]) => {
			if (!node) {
				console.warn(
					i18n.t("fetchAndExtract.nullOrUndefinedFound", {
						ns: "utilities",
						currentPath,
						name,
					})
				);

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
						console.warn(
							i18n.t("fetchAndExtract.couldNotFindDirectory", {
								ns: "utilities",
								path: directoryPath,
							})
						);

						return;
					}

					const filesWithContent = getAllFilesInDirectory(directoryStructure);
					const filesRecord: Record<string, string> = {};
					filesWithContent.forEach((file) => {
						const fileName = getFileName(file.path);
						filesRecord[fileName] = file.content;
					});

					const { attributes } = frontMatter<MarkdownAttributes>(node.content);

					if (!attributes.title || !attributes.description || !attributes.categories) {
						console.warn(
							i18n.t("fetchAndExtract.skippingPathMissingMetadata", {
								ns: "utilities",
								path: `${currentPath}/${name}`,
							}),
							attributes
						);

						return;
					}

					const templateCard: RemoteTemplateCardType = {
						assetDirectory: currentPath,
						description: Array.isArray(attributes.description)
							? attributes.description.join(", ")
							: attributes.description,
						files: filesRecord,
						integrations: (Array.isArray(attributes.integrations) ? attributes.integrations : []).filter(
							Boolean
						),
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
					console.error(
						i18n.t("fetchAndExtract.errorProcessingFile", {
							ns: "utilities",
							path: `${currentPath}/${name}`,
							error,
						})
					);
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
		console.error(
			i18n.t("fetchAndExtract.errorProcessingFileStructure", {
				ns: "utilities",
				error,
			})
		);

		return [];
	}
}
