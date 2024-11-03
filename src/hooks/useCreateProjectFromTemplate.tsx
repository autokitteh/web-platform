import { useEffect, useState } from "react";

import axios from "axios";
import { openDB } from "idb";
import yaml from "js-yaml";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { StoreName } from "@src/enums";
import { useFileOperations } from "@src/hooks";
import {
	ProcessedCategory,
	TemplateCardType,
	TemplateCardWithFiles,
	TemplateFile,
} from "@src/types/components/projectTemplates.type";

import { useProjectStore, useToastStore } from "@store";

import { fetchAndUnpackZip, processReadmeFiles } from "@components/organisms/dashboard/templates/tabs/extractZip";

class TemplateStorageService {
	private readonly DB_NAME = "TemplatesDB";
	private readonly STORE_NAME = "templates-files";
	private db: any;

	async initDb() {
		this.db = await openDB(this.DB_NAME, 1, {
			upgrade(db) {
				if (db.objectStoreNames.contains("templates-files")) {
					db.deleteObjectStore("templates-files");
				}
				const store = db.createObjectStore("templates-files", { keyPath: "id" });
				// Create an index for templateId
				store.createIndex("templateId", "templateId", { unique: false });
			},
		});
	}

	async ensureDbInitialized() {
		if (!this.db) {
			await this.initDb();
		}
	}

	async storeTemplateFiles(templateId: string, files: Record<string, string>) {
		await this.ensureDbInitialized();

		const filesArray = Object.entries(files).map(([path, content]) => ({
			id: `${templateId}:${path}`,
			templateId,
			path,
			content,
		}));

		const tx = this.db.transaction(this.STORE_NAME, "readwrite");
		await Promise.all(filesArray.map((file) => tx.store.put(file)));
		await tx.done;
	}

	// Get all files for a template
	async getTemplateFiles(templateId: string): Promise<Record<string, string>> {
		await this.ensureDbInitialized();

		try {
			const tx = this.db.transaction(this.STORE_NAME, "readonly");
			const store = tx.objectStore(this.STORE_NAME);
			const index = store.index("templateId");

			// Get all records with matching templateId
			const files = await index.getAll(templateId);

			return files.reduce((acc: Record<string, string>, file: TemplateFile) => {
				// Extract the filename from the composite path
				const filename = file.path.split("/").pop() || file.path;
				acc[filename] = file.content;

				return acc;
			}, {});
		} catch (error) {
			console.error("Error fetching template files:", error);
			throw error;
		}
	}

	// Get a single file
	async getTemplateFile(templateId: string, filePath: string): Promise<string | null> {
		await this.ensureDbInitialized();

		const id = `${templateId}:${filePath}`;
		const file = await this.db.get(this.STORE_NAME, id);

		return file?.content ?? null;
	}

	// Delete all files for a template
	async deleteTemplateFiles(templateId: string) {
		await this.ensureDbInitialized();

		const tx = this.db.transaction(this.STORE_NAME, "readwrite");
		const store = tx.objectStore(this.STORE_NAME);
		const index = store.index("templateId");
		const keys = await index.getAllKeys(templateId);
		await Promise.all(keys.map((id: string) => store.delete(id)));
		await tx.done;
	}

	// Clear all templates
	async clearAll() {
		await this.ensureDbInitialized();
		const tx = this.db.transaction(this.STORE_NAME, "readwrite");
		await tx.store.clear();
		await tx.done;
	}
}

export const templateStorage = new TemplateStorageService();
interface GitHubCommit {
	sha: string;
	commit: {
		author: {
			date: string;
			name: string;
		};
		message: string;
	};
}

export interface TemplateCategory {
	name: string;
	templates: TemplateCardType[];
}

// templateStore.ts
interface TemplateState {
	templateMap: Record<string, TemplateCardType>;
	isLoading: boolean;
	error: string | null;
	lastCommitDate?: string;

	// Actions
	fetchTemplates: () => Promise<void>;
	findTemplateByAssetDirectory: (assetDirectory: string) => TemplateCardType | undefined;
	getTemplateFiles: (assetDirectory: string) => Promise<Record<string, string>>;

	// Computed
	getCategories: () => TemplateCategory[];
}

const store = (set: any, get: any): TemplateState => ({
	templateMap: {},
	isLoading: false,
	error: null,
	lastCommitDate: undefined,

	fetchTemplates: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axios.get<GitHubCommit[]>(
				`https://api.github.com/repos/autokitteh/kittehub/commits`,
				{
					params: { per_page: 1 },
					headers: { Accept: "application/vnd.github.v3+json" },
				}
			);

			if (response.data.length) {
				const latestCommit = response.data[0];
				const newCommitDate = latestCommit.commit.author.date;
				const currentCommitDate = get().lastCommitDate;

				if (!currentCommitDate || new Date(newCommitDate) > new Date(currentCommitDate)) {
					const result = await fetchAndUnpackZip();

					if ("structure" in result) {
						const processedCategories: ProcessedCategory[] = processReadmeFiles(result.structure);
						const templateMap: Record<string, TemplateCardType> = {};

						await Promise.all(
							processedCategories.map(async (category) => {
								await Promise.all(
									category.cards.map(async (cardWithFiles: TemplateCardWithFiles) => {
										// Store files in IndexedDB
										await templateStorage.storeTemplateFiles(
											cardWithFiles.assetDirectory,
											cardWithFiles.files
										);

										// Store metadata in state
										templateMap[cardWithFiles.assetDirectory] = {
											assetDirectory: cardWithFiles.assetDirectory,
											title: cardWithFiles.title,
											description: cardWithFiles.description,
											integrations: cardWithFiles.integrations,
											filesIndex: Object.keys(cardWithFiles.files),
											category: category.name,
										};
									})
								);
							})
						);

						set({
							templateMap,
							lastCommitDate: newCommitDate,
							isLoading: false,
							error: null,
						});
					} else {
						throw new Error(result.error);
					}
				} else {
					// eslint-disable-next-line no-console
					console.log("Using cached template data, no new commits found");
					set({ isLoading: false });
				}
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to fetch templates";
			console.error("Error fetching templates:", errorMessage);
			set({ error: errorMessage, isLoading: false });
		}
	},

	findTemplateByAssetDirectory: (assetDirectory: string) => {
		return get().templateMap[assetDirectory];
	},

	getTemplateFiles: async (assetDirectory: string) => {
		return await templateStorage.getTemplateFiles(assetDirectory);
	},

	getCategories: () => {
		const templateMap = get().templateMap as Record<string, TemplateCardType>;
		const categoriesMap = new Map<string, TemplateCardType[]>();

		// Group templates by category
		Object.values(templateMap).forEach((template) => {
			const category = template.category;
			if (!categoriesMap.has(category)) {
				categoriesMap.set(category, []);
			}
			categoriesMap.get(category)!.push(template);
		});

		// Convert map to array of categories
		return Array.from(categoriesMap.entries()).map(([name, templates]) => ({
			name,
			templates,
		}));
	},
});

export const useTemplateStore = create(
	persist(store, {
		name: StoreName.templates,
		partialize: (state) => ({
			templateMap: state.templateMap,
			lastCommitDate: state.lastCommitDate,
		}),
	})
);

export const useCreateProjectFromTemplate = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const addToast = useToastStore((state) => state.addToast);
	const { createProjectFromManifest, getProjectsList } = useProjectStore();
	const navigate = useNavigate();
	const { findTemplateByAssetDirectory } = useTemplateStore();
	const [isCreating, setIsCreating] = useState(false);

	const [projectId, setProjectId] = useState<string | null>(null);
	const [templateFiles, setTemplateFiles] = useState<Record<string, string>>();

	const { saveAllFiles } = useFileOperations(projectId || "");

	useEffect(() => {
		const getAndSaveFiles = async () => {
			if (!projectId || !templateFiles) return;

			await saveAllFiles(
				Object.fromEntries(
					Object.entries(templateFiles).map(([path, content]) => [
						path,
						new Uint8Array(new TextEncoder().encode(content)),
					])
				)
			);

			addToast({
				message: t("projectCreatedSuccessfully"),
				type: "success",
			});

			getProjectsList();
			navigate(`/projects/${projectId}`);
		};

		getAndSaveFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, templateFiles]);

	const createProjectFromTemplate = async (template: TemplateCardType, projectName?: string) => {
		try {
			// Fetch files from IndexedDB
			const files = await templateStorage.getTemplateFiles(template.assetDirectory);
			const manifestData = files["autokitteh.yaml"];

			if (!manifestData) {
				addToast({
					message: t("projectCreationFailed"),
					type: "error",
				});

				LoggerService.error(
					namespaces.manifestService,
					`${t("projectCreationFailedExtended", { error: t("projectTemplateManifestNotFound") })}`
				);

				return;
			}

			const manifestObject = yaml.load(manifestData) as {
				project?: { name: string };
			};

			if (manifestObject && manifestObject.project && projectName) {
				manifestObject.project.name = projectName;
			}

			const updatedManifestData = yaml.dump(manifestObject);

			const { data: newProjectId, error } = await createProjectFromManifest(updatedManifestData);

			if (error || !newProjectId) {
				addToast({
					message: t("projectCreationFailed"),
					type: "error",
				});
				LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);

				return;
			}

			LoggerService.info(
				namespaces.hooks.createProjectFromTemplate,
				t("projectCreatedSuccessfullyExtended", {
					templateName: template.title,
					projectId: newProjectId,
				})
			);

			setProjectId(newProjectId);
			setTemplateFiles(files); // Use the files fetched from IndexedDB
		} catch (error) {
			addToast({
				message: t("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);
		}
	};

	const createProjectFromAsset = async (templateAssetDirectory: string, projectName?: string) => {
		setIsCreating(true);
		try {
			const template = findTemplateByAssetDirectory(templateAssetDirectory);
			if (!template) {
				throw new Error(`Template not found for asset directory: ${templateAssetDirectory}`);
			}
			await createProjectFromTemplate(template, projectName);
		} catch (error) {
			addToast({
				message: t("projectCreationFailed"),
				type: "error",
			});
			console.error("Error creating project from template:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return { createProjectFromAsset, isCreating };
};
