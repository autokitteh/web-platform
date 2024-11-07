import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { templateCategoriesOrder } from "@constants";
import { TemplateStorageService } from "@services";
import { StoreName } from "@src/enums";
import { GitHubCommit, TemplateState } from "@src/interfaces/store";
import {
	ProcessedCategory,
	TemplateCardWithFiles,
	TemplateCategory,
	TemplateMetadata,
	TemplateMetadataWithCategory,
} from "@src/types/components/projectTemplates.type";
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
	sortedCategories: undefined,
	templateStorage: new TemplateStorageService(),

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
						const templateMap: Record<string, TemplateMetadataWithCategory> = {};
						const { templateStorage } = get();
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

						const sortedCategories = sortCategories(categories, templateCategoriesOrder);

						set({
							templateMap,
							sortedCategories,
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
			sortedCategories: state.sortedCategories,
		}),
	})
);
