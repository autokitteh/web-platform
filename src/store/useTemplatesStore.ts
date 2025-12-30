import axios, { isAxiosError } from "axios";
import dayjs from "dayjs";
import { t } from "i18next";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
	isCiCd,
	localTemplatesArchiveFallback,
	namespaces,
	remoteTemplatesArchiveURL,
	remoteTemplatesRepositoryURL,
	templateCategoriesOrder,
	templatesUpdateCheckInterval,
} from "@constants";
import { LoggerService, templateStorage } from "@services";
import { StoreName } from "@src/enums";
import { GitHubCommit, TemplateCategory, TemplateState } from "@src/interfaces/store";
import { processTemplates } from "@src/utilities/templateProcess";

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
	cachedCommitDate: undefined,
	lastCheckDate: undefined,
	sortedCategories: undefined,
};

const store = (set: any, get: any): TemplateState => ({
	...defaultState,

	reset: () => {
		set(defaultState);
	},

	fetchTemplates: async (forceFetch = false) => {
		const couldntFetchTemplates = t("templates.failedToFetch", { ns: "stores" });
		const { isLoading, templateMap, cachedCommitDate, lastCheckDate } = get();
		if (isLoading) return;

		if (isCiCd) {
			return;
		}

		set({ isLoading: true, error: null });

		try {
			let shouldFetchTemplates = !Object.keys(templateMap).length;
			let shouldFetchTemplatesFromGithub = false;
			const localLatestCommitDate = cachedCommitDate ? dayjs(cachedCommitDate) : null;
			const currentTime = dayjs();
			const localLatestCheckDate = lastCheckDate ? dayjs(lastCheckDate) : null;
			let remoteCommitDate = dayjs();
			const shouldCheckGitHub =
				!localLatestCheckDate || currentTime.diff(localLatestCheckDate) >= templatesUpdateCheckInterval;

			if (shouldCheckGitHub) {
				try {
					const { data: githubCommitResponse } = await axios.get<GitHubCommit[]>(
						remoteTemplatesRepositoryURL,
						{
							params: { per_page: 1 },
							headers: { Accept: "application/vnd.github.v3+json" },
						}
					);

					if (!githubCommitResponse?.[0]?.commit?.author?.date) {
						shouldFetchTemplates = true;
						return;
					}

					remoteCommitDate = dayjs(githubCommitResponse[0].commit.author.date);
					shouldFetchTemplatesFromGithub =
						!localLatestCommitDate || remoteCommitDate.isAfter(cachedCommitDate);
				} catch (error) {
					LoggerService.error(
						namespaces.stores.templatesStore,
						t("templates.failedFetchingCommitInfo", {
							ns: "stores",
							error: isAxiosError(error)
								? `Status: ${error.response?.status}, Message: ${error.response?.data || error.message}`
								: error?.message,
						})
					);
					shouldFetchTemplates = true;
				}
			}

			if (!shouldFetchTemplates && !shouldFetchTemplatesFromGithub && !forceFetch) {
				return;
			}

			templateStorage.clearAll();

			let templates;
			if (shouldFetchTemplatesFromGithub) {
				templates = await processTemplates(remoteTemplatesArchiveURL, templateStorage);
			}

			if (!templates || templates.error) {
				LoggerService.error(
					namespaces.stores.templatesStore,
					t("templates.usingLocalFallback", {
						ns: "stores",
						url: localTemplatesArchiveFallback,
					})
				);
			}

			const templatesResult =
				!templates || templates.error
					? await processTemplates(localTemplatesArchiveFallback, templateStorage)
					: templates;

			if (templatesResult?.error) {
				LoggerService.error(
					namespaces.stores.templatesStore,
					t("templates.finalProcessingResult", {
						ns: "stores",
						status: "Error",
						categoryCount: templatesResult?.categories?.length || 0,
						templateCount: Object.keys(templatesResult?.templateMap || {}).length,
					})
				);
			}

			const { categories: processedTemplatesMap, error, templateMap: processedTemplateMap } = templatesResult;

			if (error || !processedTemplatesMap || !processedTemplateMap || !Object.keys(processedTemplateMap).length) {
				LoggerService.error(
					namespaces.stores.templatesStore,
					t("templates.failedToLoad", {
						ns: "stores",
						error: error || "Missing categories or templates",
					})
				);
				set({ error: couldntFetchTemplates, isLoading: false });
				return;
			}

			if (processedTemplateMap && Object.keys(processedTemplateMap).length) {
				const sortedCategories = sortCategories(processedTemplatesMap, templateCategoriesOrder);

				set({
					templateMap: processedTemplateMap,
					sortedCategories,
					cachedCommitDate: shouldFetchTemplatesFromGithub
						? remoteCommitDate.toISOString()
						: cachedCommitDate,
					lastCheckDate: shouldCheckGitHub ? currentTime.toISOString() : lastCheckDate,
					isLoading: false,
					error: null,
				});
			}
		} catch (error) {
			const uiErrorMessage = t("templates.failedToFetch", { ns: "stores" });
			const logErrorMessage = t("templates.failedToFetchExtended", {
				ns: "stores",
				error: isAxiosError(error) ? error?.response?.data : error?.response || error?.message,
			});

			LoggerService.error(namespaces.stores.templatesStore, logErrorMessage, true);
			set({ error: uiErrorMessage });

			LoggerService.error(
				namespaces.stores.templatesStore,
				t("templates.unexpectedError", {
					ns: "stores",
					error: error?.stack || error?.message || "Unknown error",
				})
			);
		} finally {
			set({ isLoading: false });
		}
	},

	findTemplateByAssetDirectory: (assetDirectory) => {
		return get().templateMap[assetDirectory];
	},

	getFilesForTemplate: async (assetDirectory) => {
		return await templateStorage.getFiles(assetDirectory);
	},
});

export const useTemplatesStore = create(
	persist(store, {
		name: StoreName.templates,
		partialize: (state) => ({
			templateMap: state.templateMap,
			cachedCommitDate: state.cachedCommitDate,
			lastCheckDate: state.lastCheckDate,
			sortedCategories: state.sortedCategories,
		}),
	})
);
