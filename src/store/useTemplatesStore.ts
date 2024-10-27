import i18n from "i18next";
import { create } from "zustand";

import { LoggerService } from "@services";
import { templateDB } from "@services/templates.services";
import { namespaces, templateProjectsCategories } from "@src/constants";
import {
	HiddenIntegrationsForTemplates,
	IntegrationForTemplates,
	Integrations,
	IntegrationsMap,
} from "@src/enums/components/connection.enum";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";
import { ProcessedTemplate, TemplateState } from "@src/interfaces/store/templates.interface";
import { fetchAndUnpackTarGz } from "@src/utilities";

import { useToastStore } from "@store";

interface ExtendedTemplateState extends TemplateState {
	categories: typeof templateProjectsCategories;
}

const getIntegration = (integration: unknown): IntegrationSelectOption | null => {
	// If it's already an IntegrationSelectOption, return it
	if (typeof integration === "object" && integration !== null && "value" in integration) {
		return integration as IntegrationSelectOption;
	}

	// Check if it's an enum value
	if (typeof integration === "string") {
		// Check regular integrations
		if (integration in IntegrationsMap) {
			return IntegrationsMap[integration as Integrations];
		}

		// Check hidden integrations
		if (integration in HiddenIntegrationsForTemplates) {
			return HiddenIntegrationsForTemplates[integration as IntegrationForTemplates];
		}
	}

	console.warn("Invalid integration:", integration);

	return null;
};

// Interface for storage-safe version of ProcessedTemplate
export interface StorableTemplate extends Omit<ProcessedTemplate, "integrations"> {
	integrationValues: Array<{
		icon: string;
		label: string;
		value: string;
	}>;
}

// Helper functions for storage transformation
export const createStorableTemplate = (template: ProcessedTemplate): StorableTemplate => {
	const { integrations, ...rest } = template;

	return {
		...rest,
		integrationValues: integrations
			? integrations.map(({ icon, label, value }) => ({
					label,
					icon: icon.toString(),
					value,
				}))
			: [],
	};
};

export const rehydrateTemplate = (template: StorableTemplate): ProcessedTemplate => {
	const { integrationValues, ...rest } = template;

	return {
		...rest,
		integrations: integrationValues
			.map(({ value }) => {
				// Try regular integrations first
				if (value in IntegrationsMap) {
					return IntegrationsMap[value as Integrations];
				}
				// Then try hidden integrations
				if (value in HiddenIntegrationsForTemplates) {
					return HiddenIntegrationsForTemplates[value as IntegrationForTemplates];
				}
				// Fallback
				console.warn(`Could not rehydrate integration: ${value}`);

				return null;
			})
			.filter((int): int is IntegrationSelectOption => int !== null),
	};
};

export const useTemplateStore = create<ExtendedTemplateState>((set) => ({
	processedTemplates: {},
	categories: templateProjectsCategories,
	isLoading: false,

	fetchAndProcessArchive: async (url: string) => {
		set({ isLoading: true });

		try {
			const extractedFiles = await fetchAndUnpackTarGz(url, {
				includeContent: true,
				onProgress: (progress) => {
					console.log(`Extraction progress: ${progress}%`);
				},
			});

			const processedFiles = extractedFiles.map((file) => ({
				path: file.path.replace(/^templates\//, ""),
				content: file.content || "",
			}));

			await Promise.all(processedFiles.map((file) => templateDB.saveArchive(file.path, file)));

			const processed: { [key: string]: ProcessedTemplate } = {};
			const processedCategories = templateProjectsCategories.map((category) => ({
				...category,
				cards: category.cards.map((card) => {
					const cardFiles: { [key: string]: string } = {};

					for (const fileName of card.files) {
						const filePath = card.assetDirectory + "/" + fileName;
						const archiveFile = processedFiles.find(
							(f) => f.path === filePath || f.path === `./${filePath}`
						);

						if (archiveFile) {
							cardFiles[fileName] = archiveFile.content;
						} else {
							console.warn(`File not found: ${filePath}`);
						}
					}

					const mappedIntegrations = card.integrations
						.map((integration) => getIntegration(integration))
						.filter((int): int is IntegrationSelectOption => int !== null);

					const processedTemplate: ProcessedTemplate = {
						title: card.title,
						description: card.description,
						integrations: mappedIntegrations,
						assetDirectory: card.assetDirectory,
						files: card.files,
						fileContents: cardFiles,
					};

					processed[card.assetDirectory] = processedTemplate;

					// Store a serializable version
					try {
						const storableTemplate = createStorableTemplate(processedTemplate);
						templateDB.saveTemplate(card.assetDirectory, storableTemplate);
					} catch (error) {
						console.error("Failed to save template:", error);
					}

					return processedTemplate;
				}),
			}));

			set({
				processedTemplates: processed,
				categories: processedCategories,
				isLoading: false,
			});
		} catch (error) {
			useToastStore.getState().addToast({
				message: i18n.t("templatesProcessError", { ns: "errors" }),
				type: "error",
			});
			LoggerService.error(
				namespaces.stores.outputStore,
				i18n.t("templatesProcessErrorExtended", { ns: "errors", error: (error as Error).message })
			);

			set({ isLoading: false });
		}
	},
}));
