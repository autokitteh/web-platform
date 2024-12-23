import axios from "axios";
import i18n from "i18next";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
	localTemplatesArchiveFallback,
	namespaces,
	remoteTemplatesArchiveURL,
	remoteTemplatesRepositoryURL,
	templateCategoriesOrder,
	templatesUpdateCheckInterval,
} from "@constants";
import { LoggerService, TemplateStorageService } from "@services";
import { StoreName } from "@src/enums";
import {
	GitHubCommit,
	TemplateCardWithFiles,
	TemplateCategory,
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

const defaultState = {
	templateMap: {},
	isLoading: false,
	error: null,
	lastCommitDate: undefined,
	lastCheckDate: undefined,
	sortedCategories: undefined,
	templateStorage: undefined,
};

const store = (set: any, get: any): TemplateState => ({
	...defaultState,

	reset: () => {
		set(defaultState);
	},

	getTemplateStorage: () => {
		const { templateStorage } = get();
		if (!templateStorage) {
			const storage = new TemplateStorageService();
			set({ templateStorage: storage });
		}

		return templateStorage;
	},

	fetchTemplates: async () => {
		const couldntFetchTemplates = i18n.t("templates.failedToFetch", {
			ns: "stores",
		});

		set({ isLoading: true, error: null });

		const processTemplates = async (
			zipUrl: string
		): Promise<{
			categories?: TemplateCategory[];
			error?: string;
			templateMap?: Record<string, TemplateMetadataWithCategory>;
		}> => {
			const processTemplateCard = async (cardWithFiles: TemplateCardWithFiles, categoryName: string) => {
				const { getTemplateStorage } = get();
				const tmpStorage = getTemplateStorage();
				await tmpStorage.storeTemplateFiles(cardWithFiles.assetDirectory, cardWithFiles.files);

				return {
					assetDirectory: cardWithFiles.assetDirectory,
					title: cardWithFiles.title,
					description: cardWithFiles.description,
					integrations: cardWithFiles.integrations,
					filesIndex: Object.keys(cardWithFiles.files),
					category: categoryName,
				};
			};

			const result = await fetchAndUnpackZip(zipUrl);
			if (!("structure" in result) || result.error) {
				return { error: couldntFetchTemplates };
			}

			const processedCategories = processReadmeFiles(result.structure);
			const templateMap: Record<string, TemplateMetadataWithCategory> = {};

			await Promise.all(
				processedCategories.map(async ({ cards, name }) => {
					const processedCards = await Promise.all(cards.map((card) => processTemplateCard(card, name)));
					processedCards.forEach((cardData) => {
						templateMap[cardData.assetDirectory] = cardData;
					});
				})
			);

			const categories = Object.values(templateMap).reduce((acc, template) => {
				const category = acc.find((c) => c.name === template.category);
				if (category) {
					category.templates.push(template);
				} else {
					acc.push({ name: template.category, templates: [template] });
				}

				return acc;
			}, [] as TemplateCategory[]);

			return { templateMap, categories };
		};

		try {
			let shouldFetchTemplates = !Object.keys(get().templateMap).length;
			let shouldFetchTemplatesFromGithub = false;
			let lastCommitDate = get().lastCommitDate;
			const currentTime = new Date();
			const lastCheckDate = get().lastCheckDate;

			const shouldCheckGitHub =
				!lastCheckDate ||
				currentTime.getTime() - new Date(lastCheckDate).getTime() >= templatesUpdateCheckInterval;

			if (shouldCheckGitHub) {
				try {
					const { data } = await axios.get<GitHubCommit[]>(remoteTemplatesRepositoryURL, {
						params: { per_page: 1 },
						headers: { Accept: "application/vnd.github.v3+json" },
					});

					const latestCommit = data?.[0];
					const latestCommitDate = latestCommit?.commit.author.date;

					shouldFetchTemplatesFromGithub =
						latestCommit && (!lastCommitDate || new Date(latestCommitDate) > new Date(lastCommitDate));
					lastCommitDate = latestCommitDate;
					set({ lastCheckDate: currentTime });
				} catch {
					shouldFetchTemplates = true;
				}
			}

			if (!shouldFetchTemplates) {
				return;
			}

			let templates;
			if (shouldFetchTemplatesFromGithub) {
				templates = await processTemplates(remoteTemplatesArchiveURL);
			}

			const templatesResult =
				!templates || templates.error ? await processTemplates(localTemplatesArchiveFallback) : templates;

			const { categories, error, templateMap } = templatesResult;

			if (error || !categories || !templateMap || !Object.keys(templateMap).length) {
				set({ error: couldntFetchTemplates, isLoading: false });

				return;
			}

			const sortedCategories = sortCategories(categories, templateCategoriesOrder);

			set({
				templateMap,
				sortedCategories,
				lastCommitDate,
				isLoading: false,
				error: null,
			});
		} catch (error) {
			const uiErrorMessage = i18n.t("templates.failedToFetch", { ns: "stores" });
			const logErrorMessage = i18n.t("templates.failedToFetchExtended", {
				ns: "stores",
				error: axios.isAxiosError(error) ? error?.response?.data : error?.response || error?.message,
			});

			LoggerService.error(namespaces.stores.templatesStore, logErrorMessage, true);
			set({ error: uiErrorMessage });
		} finally {
			set({ isLoading: false });
		}
	},

	findTemplateByAssetDirectory: (assetDirectory: string) => {
		return get().templateMap[assetDirectory];
	},

	getFilesForTemplate: async (assetDirectory: string) => {
		const { getTemplateStorage } = get();
		const templateStorage = getTemplateStorage();

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
