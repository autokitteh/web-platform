import axios, { isAxiosError } from "axios";
import { t } from "i18next";
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
	lastCommitDate: undefined,
	lastCheckDate: undefined,
	sortedCategories: undefined,
};

const store = (set: any, get: any): TemplateState => ({
	...defaultState,

	reset: () => {
		set(defaultState);
	},

	fetchTemplates: async () => {
		const couldntFetchTemplates = t("templates.failedToFetch", {
			ns: "stores",
		});

		set({ isLoading: true, error: null });

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

			if (!shouldFetchTemplates && !shouldFetchTemplatesFromGithub) {
				return;
			}

			let templates;
			if (shouldFetchTemplatesFromGithub) {
				templates = await processTemplates(remoteTemplatesArchiveURL, templateStorage);
			}

			const templatesResult =
				!templates || templates.error
					? await processTemplates(localTemplatesArchiveFallback, templateStorage)
					: templates;

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
			const uiErrorMessage = t("templates.failedToFetch", { ns: "stores" });
			const logErrorMessage = t("templates.failedToFetchExtended", {
				ns: "stores",
				error: isAxiosError(error) ? error?.response?.data : error?.response || error?.message,
			});

			LoggerService.error(namespaces.stores.templatesStore, logErrorMessage, true);
			set({ error: uiErrorMessage });
		} finally {
			set({ isLoading: false });
		}
	},

	findTemplateByAssetDirectory: (assetDirectory) => {
		return get().templateMap[assetDirectory];
	},

	getFilesForTemplate: async (assetDirectory) => {
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
