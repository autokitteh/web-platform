import axios from "axios";
import frontMatter from "front-matter";
import { t } from "i18next";
import JSZip from "jszip";
import { memoize } from "lodash";

import {
	DirectoryNode,
	FileNode,
	FileStructure,
	FileWithContent,
	MarkdownAttributes,
	ProcessedZipResult,
} from "@interfaces/utilities";
import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { ProcessedRemoteCategory, RemoteTemplateCardWithFiles } from "@src/interfaces/store";

const isFileNode = memoize((node: FileNode | DirectoryNode): node is FileNode => node?.type === "file");

const isDirectoryNode = memoize((node: FileNode | DirectoryNode): node is DirectoryNode => node?.type === "directory");

const directoryCache = new Map<string, FileStructure>();

const processZipContent = async (zip: JSZip): Promise<FileStructure> => {
	const fileStructure: FileStructure = {};

	const batchSize = 50;
	const entries = Object.entries(zip.files);
	const batches = Math.ceil(entries.length / batchSize);

	for (let i = 0; i < batches; i++) {
		const batchEntries = entries.slice(i * batchSize, (i + 1) * batchSize);
		await Promise.all(
			batchEntries.map(async ([relativePath, file]: [string, JSZip.JSZipObject]) => {
				if (file.dir) return;

				const pathParts = relativePath.split("/");
				let currentLevel = fileStructure;

				for (let j = 0; j < pathParts.length - 1; j++) {
					const part = pathParts[j];
					if (!currentLevel[part] || isFileNode(currentLevel[part])) {
						currentLevel[part] = {
							type: "directory",
							children: {},
						};
					}
					currentLevel = (currentLevel[part] as DirectoryNode).children;
				}

				const fileName = pathParts[pathParts.length - 1];
				const content = await file.async("string");
				currentLevel[fileName] = {
					type: "file",
					content,
					path: relativePath,
				};
			})
		);
	}

	return fileStructure;
};

const fetchZipFromUrl = async (url: string): Promise<ArrayBuffer> => {
	const { data: zipData } = await axios.get(url, {
		responseType: "arraybuffer",
		timeout: 30000,
		validateStatus: (status) => status === 200,
	});

	return zipData;
};

export const unpackFileZip = async (file: File | ArrayBuffer): Promise<ProcessedZipResult> => {
	try {
		const zip = new JSZip();
		const content = await zip.loadAsync(file);
		const structure = await processZipContent(content);

		return { structure };
	} catch (error) {
		const fileName = file instanceof File ? file.name : "ArrayBuffer";
		const errorMessage =
			error instanceof Error
				? error.message
				: t("fetchAndExtract.uknownErrorUnpackingZip", {
						ns: "utilities",
						zipName: fileName,
					});
		LoggerService.error(
			namespaces.utilities.fetchAndExtract,
			t("fetchAndExtract.fetchAndExtractError", {
				ns: "utilities",
				error: errorMessage,
				name: fileName,
			}),
			true
		);

		return { error: errorMessage, structure: undefined };
	}
};

export const fetchAndUnpackZip = async (remoteTemplatesArchiveUrl: string): Promise<ProcessedZipResult> => {
	try {
		let zipData: ArrayBuffer = new ArrayBuffer(0);

		try {
			zipData = await fetchZipFromUrl(remoteTemplatesArchiveUrl);
		} catch (fetchError) {
			const errorMessage = t("fetchAndExtract.templatesArchiveFetchFailedExtended", {
				ns: "utilities",
				error: fetchError instanceof Error ? fetchError.message : "Unknown error",
			});

			LoggerService.warn(namespaces.utilities.fetchAndExtract, errorMessage, true);

			return { error: errorMessage, structure: undefined };
		}

		const { structure } = await unpackFileZip(zipData);

		return { structure };
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? `${error.name}: ${error.message}`
				: t("fetchAndExtract.uknownErrorUnpackingZip", {
						ns: "utilities",
						zipName: remoteTemplatesArchiveUrl,
					});
		LoggerService.error(
			namespaces.utilities.fetchAndExtract,
			t("fetchAndExtract.fetchAndExtractError", {
				ns: "utilities",
				error: errorMessage,
				name: remoteTemplatesArchiveUrl,
			}),
			true
		);

		return { error: errorMessage, structure: undefined };
	}
};

const getFileName = memoize((path: string): string => path.split("/").pop() || path);

const getDirectoryStructure = (fileStructure: FileStructure, targetPath: string): FileStructure | null => {
	if (!targetPath) return fileStructure;

	const cacheKey = targetPath;
	if (directoryCache.has(cacheKey)) {
		return directoryCache.get(cacheKey)!;
	}

	const pathParts = targetPath.split("/").filter(Boolean);
	let currentLevel = fileStructure;

	for (const part of pathParts) {
		const node = currentLevel[part];
		if (!node || !isDirectoryNode(node)) {
			return null;
		}
		currentLevel = node.children;
	}

	directoryCache.set(cacheKey, currentLevel);

	return currentLevel;
};

const getAllFilesInDirectory = (structure: FileStructure, currentPath: string = ""): FileWithContent[] => {
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
			files.push(...getAllFilesInDirectory(node.children, fullPath));
		}
	});

	return files;
};

export const processReadmeFiles = (fileStructure?: FileStructure): ProcessedRemoteCategory[] => {
	if (!fileStructure) {
		LoggerService.warn(
			namespaces.utilities.fetchAndExtract,
			t("fetchAndExtract.noFileStructure", { ns: "utilities" }),
			true
		);

		return [];
	}

	const categoriesMap = new Map<string, Set<RemoteTemplateCardWithFiles>>();

	const processDirectory = (structure: FileStructure, currentPath: string = ""): void => {
		if (!structure || typeof structure !== "object") {
			LoggerService.warn(
				namespaces.utilities.fetchAndExtract,
				t("fetchAndExtract.invalidStructure", { path: currentPath, ns: "utilities" }),
				true
			);

			return;
		}

		for (const [name, node] of Object.entries(structure)) {
			if (!node) continue;

			if (isDirectoryNode(node)) {
				processDirectory(node.children, `${currentPath}/${name}`.replace(/^\//, ""));

				continue;
			}
			if (isFileNode(node) && name.toLowerCase() === "readme.md") {
				try {
					const directoryStructure = getDirectoryStructure(fileStructure, currentPath);
					if (!directoryStructure) continue;

					const filesWithContent = getAllFilesInDirectory(directoryStructure);
					const filesRecord = Object.fromEntries(
						filesWithContent.map((file) => [getFileName(file.path), file.content])
					);

					const { attributes } = frontMatter<MarkdownAttributes>(node.content);

					if (!attributes.title || !attributes.description || !attributes.categories) {
						continue;
					}

					const templateCard: RemoteTemplateCardWithFiles = {
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
						if (!categoriesMap.has(category)) {
							categoriesMap.set(category, new Set());
						}
						categoriesMap.get(category)!.add(templateCard);
					});
				} catch (error) {
					LoggerService.error(
						namespaces.utilities.fetchAndExtract,
						t("fetchAndExtract.errorProcessingFile", {
							ns: "utilities",
							path: `${currentPath}/${name}`,
							error,
						}),
						true
					);
				}
			}
		}
	};

	try {
		processDirectory(fileStructure);

		return Array.from(categoriesMap.entries())
			.map(([name, cardsSet]) => ({
				name,
				cards: Array.from(cardsSet),
			}))
			.filter((category) => !!category.cards.length);
	} catch (error) {
		LoggerService.error(
			namespaces.utilities.fetchAndExtract,
			t("fetchAndExtract.errorProcessingFileStructure", {
				ns: "utilities",
				error,
			}),
			true
		);

		return [];
	}
};
