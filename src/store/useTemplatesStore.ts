import axios from "axios";
import i18n from "i18next";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
	localTemplatesArchiveFallback,
	remoteTemplatesArchiveURL,
	remoteTemplatesRepositoryURL,
	templateCategoriesOrder,
	templatesUpdateCheckInterval,
} from "@constants";
import { TemplateStorageService } from "@services";
import { StoreName } from "@src/enums";
import {
	GitHubCommit,
	ProcessedCategory,
	TemplateCardWithFiles,
	TemplateCategory,
	TemplateMetadata,
	TemplateMetadataWithCategory,
	TemplateState,
} from "@src/interfaces/store";
import { fetchAndUnpackZip, processReadmeFiles } from "@utilities";

const sortCategories = (categories: TemplateCategory[], order: string[]) => {
	return categories.sort((a, b) => {
		const indexA = order.indexOf(a.name);
		const indexB = order.indexOf(b.name);

		if (indexA === -1) return 1;
		if (indexB === -1) return -1;

		return indexA - indexB;
	});
};

const store = (set: any, get: any): TemplateState => ({
	templateMap: {},
	isLoading: false,
	error: null,
	lastCommitDate: undefined,
	lastCheckDate: undefined,
	sortedCategories: undefined,
	templateStorage: new TemplateStorageService(),

	fetchTemplates: async () => {
		set({ isLoading: true, error: null });

		const processTemplates = async (zipUrl: string) => {
			const result = await fetchAndUnpackZip(zipUrl);
			if (!("structure" in result)) {
				throw new Error(result.error);
			}

			const processedCategories: ProcessedCategory[] = processReadmeFiles(result.structure);
			const templateMap: Record<string, TemplateMetadataWithCategory> = {};
			const { templateStorage } = get();

			await Promise.all(
				processedCategories.map(async (category) => {
					await Promise.all(
						category.cards.map(async (cardWithFiles: TemplateCardWithFiles) => {
							await templateStorage.storeTemplateFiles(cardWithFiles.assetDirectory, cardWithFiles.files);

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

			const categoriesMap = new Map<string, TemplateMetadata[]>();
			Object.values(templateMap).forEach((template) => {
				const category = template.category;
				if (!categoriesMap.has(category)) {
					categoriesMap.set(category, []);
				}
				categoriesMap.get(category)!.push(template);
			});

			const categories = Array.from(categoriesMap.entries()).map(([name, templates]) => ({
				name,
				templates,
			}));

			return { templateMap, categories };
		};

		try {
			let shouldFetchTemplates = false;
			let shouldFetchTemplatesFromGithub = false;
			let lastCommitDate = get().lastCommitDate;
			const currentTime = new Date();
			const lastCheckDate = get().lastCheckDate;

			const shouldCheckGitHub =
				!lastCheckDate ||
				currentTime.getTime() - new Date(lastCheckDate).getTime() >= templatesUpdateCheckInterval;

			if (shouldCheckGitHub) {
				try {
					const response = await axios.get<GitHubCommit[]>(remoteTemplatesRepositoryURL, {
						params: { per_page: 1 },
						headers: { Accept: "application/vnd.github.v3+json" },
					});

					if (response.data.length) {
						const latestCommit = response.data[0];
						const latestCommitDate = latestCommit.commit.author.date;
						const currentCommitDate = get().lastCommitDate;

						if (!currentCommitDate || new Date(latestCommitDate) > new Date(currentCommitDate)) {
							shouldFetchTemplates = true;
							shouldFetchTemplatesFromGithub = true;
							lastCommitDate = latestCommitDate;
						}
					} else {
						shouldFetchTemplates = true;
					}
					set({ lastCheckDate: currentTime });
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				} catch (error) {
					shouldFetchTemplates = true;
				}
			}

			if (!shouldFetchTemplates) {
				set({ isLoading: false });

				return;
			}

			if (shouldFetchTemplatesFromGithub) {
				const { categories, templateMap } = await processTemplates(remoteTemplatesArchiveURL);
				const sortedCategories = sortCategories(categories, templateCategoriesOrder);
				set({
					templateMap,
					sortedCategories,
					lastCommitDate,
					isLoading: false,
					error: null,
				});

				return;
			}

			const { categories, templateMap } = await processTemplates(localTemplatesArchiveFallback);
			const sortedCategories = sortCategories(categories, templateCategoriesOrder);
			set({
				templateMap,
				sortedCategories,
				lastCommitDate,
				isLoading: false,
				error: null,
			});

			return;
		} catch (error) {
			const uiErrorMessage = i18n.t("templates.failedToFetch", { ns: "stores" });
			let logErrorMessage = uiErrorMessage;
			if (axios.isAxiosError(error)) {
				logErrorMessage = i18n.t("templates.failedToFetchExtended", {
					ns: "stores",
					error: error?.response?.data,
				});
			} else {
				logErrorMessage = i18n.t("templates.failedToFetchExtended", {
					ns: "stores",
					error: error?.message,
				});
			}
			console.error(logErrorMessage);
			set({ error: uiErrorMessage, isLoading: false });
		}
	},

	findTemplateByAssetDirectory: (assetDirectory: string) => {
		return get().templateMap[assetDirectory];
	},

	getTemplateFiles: async (assetDirectory: string) => {
		const { templateStorage } = get();

		return await templateStorage.getTemplateFiles(assetDirectory);
	},
});

export const useTemplatesStore = create(
	persist(store, {
		name: StoreName.templates,
		partialize: (state) => ({
			templateMap: state.templateMap,
			lastCommitDate: state.lastCommitDate,
			lastCheckDate: state.lastCheckDate,
			sortedCategories: state.sortedCategories,
		}),
	})
);
