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

const store = (set: any, get: any): TemplateState => ({
	templateMap: {},
	isLoading: false,
	error: null,
	lastCommitDate: undefined,
	lastCheckDate: undefined,
	sortedCategories: undefined,
	templateStorage: new TemplateStorageService(),

	fetchTemplates: async () => {
		const couldntFetchGithubTemplates = i18n.t("templates.couldntFetchGithubTemplates", {
			ns: "stores",
		});
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
			const processTemplateCard = async (
				cardWithFiles: TemplateCardWithFiles,
				categoryName: string,
				templateStorage: TemplateStorageService
			) => {
				await templateStorage.storeTemplateFiles(cardWithFiles.assetDirectory, cardWithFiles.files);

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
				if (zipUrl === localTemplatesArchiveFallback) {
					return { error: couldntFetchTemplates };
				}

				return { error: couldntFetchGithubTemplates };
			}

			const { templateStorage } = get();
			const processedCategories = processReadmeFiles(result.structure);
			const templateMap: Record<string, TemplateMetadataWithCategory> = {};

			await Promise.all(
				processedCategories.map(async ({ cards, name }) => {
					const processedCards = await Promise.all(
						cards.map((card) => processTemplateCard(card, name, templateStorage))
					);
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
					const { data } = await axios.get<GitHubCommit[]>(remoteTemplatesRepositoryURL, {
						params: { per_page: 1 },
						headers: { Accept: "application/vnd.github.v3+json" },
					});

					const latestCommit = data?.[0];

					if (latestCommit) {
						const latestCommitDate = latestCommit.commit.author.date;
						const currentCommitDate = get().lastCommitDate;

						if (currentCommitDate && new Date(latestCommitDate) <= new Date(currentCommitDate)) {
							return;
						}
						shouldFetchTemplatesFromGithub = true;
						shouldFetchTemplates = true;
						lastCommitDate = latestCommitDate;
					}
					set({ lastCheckDate: currentTime });
				} catch {
					shouldFetchTemplates = true;
				}
			}

			if (!shouldFetchTemplates) {
				return;
			}

			const zipUrl = shouldFetchTemplatesFromGithub ? remoteTemplatesArchiveURL : localTemplatesArchiveFallback;

			let categories;
			let error;
			let templateMap;
			const templatesFromGithub = await processTemplates(zipUrl);
			categories = templatesFromGithub.categories;
			error = templatesFromGithub.error;
			templateMap = templatesFromGithub.templateMap;
			if (error && error === couldntFetchGithubTemplates) {
				const templatesFromFallback = await processTemplates(localTemplatesArchiveFallback);
				categories = templatesFromFallback.categories;
				error = templatesFromFallback.error;
				templateMap = templatesFromFallback.templateMap;
			}

			if (error) {
				set({ error });

				return;
			}
			if (!categories || !templateMap || !Object.keys(templateMap).length) {
				set({ error: couldntFetchTemplates });

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

			LoggerService.error(namespaces.stores.templatesStore, logErrorMessage, true);
			set({ error: uiErrorMessage });
		} finally {
			set({ isLoading: false });
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
