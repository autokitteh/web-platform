import { useEffect, useState } from "react";

import axios from "axios";
import yaml from "js-yaml";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { StoreName } from "@src/enums";
import { useFileOperations } from "@src/hooks";
import { TemplateCardType, TemplateCategory } from "@src/types/components";

import { useProjectStore, useToastStore } from "@store";

import { fetchAndUnpackZip, processReadmeFiles } from "@components/organisms/dashboard/templates/tabs/extractZip";

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

interface TemplateState {
	categories: TemplateCategory[];
	isLoading: boolean;
	error: string | null;
	templateMap: Record<string, TemplateCardType>;
	lastCommitDate?: string;
	fetchTemplates: () => Promise<void>;
	findTemplateByAssetDirectory: (assetDirectory: string) => TemplateCardType | undefined;
}

const store = (set: any, get: any): TemplateState => ({
	categories: [],
	isLoading: false,
	error: null,
	templateMap: {},
	lastCommitDate: undefined,

	fetchTemplates: async () => {
		set({ isLoading: true, error: null });

		try {
			// Check for new commits first
			const response = await axios.get<GitHubCommit[]>(
				`https://api.github.com/repos/autokitteh/kittehub/commits`,
				{
					params: {
						per_page: 1,
					},
					headers: {
						Accept: "application/vnd.github.v3+json",
					},
				}
			);

			if (response.data.length) {
				const latestCommit = response.data[0];
				const newCommitDate = latestCommit.commit.author.date;
				const currentCommitDate = get().lastCommitDate;

				// Only fetch new data if there's no cached data or there's a new commit
				if (!currentCommitDate || new Date(newCommitDate) > new Date(currentCommitDate)) {
					const result = await fetchAndUnpackZip();

					if ("structure" in result) {
						const processedCategories = processReadmeFiles(result.structure);
						const templateMap: Record<string, TemplateCardType> = {};

						// Convert categories to templateMap
						processedCategories.forEach((category) => {
							category.cards.forEach((card) => {
								templateMap[card.assetDirectory] = card;
							});
						});

						set({
							categories: processedCategories,
							templateMap,
							lastCommitDate: newCommitDate,
							isLoading: false,
							error: null,
						});
					} else {
						throw new Error(result.error);
					}
				} else {
					// No new commits, use cached data
					// eslint-disable-next-line no-console
					console.log("Using cached template data, no new commits found");
					set({ isLoading: false });
				}
			} else {
				throw new Error("No commits found");
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to fetch templates";
			console.error("Error fetching templates:", errorMessage);

			set({
				error: errorMessage,
				isLoading: false,
			});
		}
	},

	findTemplateByAssetDirectory: (assetDirectory: string) => {
		return get().templateMap[assetDirectory];
	},
});

export const useTemplateStore = create(
	persist(store, {
		name: StoreName.templates,
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
	}, [projectId]);

	const createProjectFromTemplate = async (template: TemplateCardType, projectName?: string) => {
		try {
			const manifestData = template.files["autokitteh.yaml"];

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
				t("projectCreatedSuccessfullyExtended", { templateName: template.title, projectId: newProjectId })
			);

			setProjectId(newProjectId);
			setTemplateFiles(template.files);
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
