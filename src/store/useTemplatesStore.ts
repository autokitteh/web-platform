import { create } from "zustand";

import { templateDB } from "@services/templates.services";
import { templateProjectsCategories } from "@src/constants";
import { HiddenIntegrationsForTemplates, IntegrationsMap } from "@src/enums/components/connection.enum";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";
import { ProcessedTemplate } from "@src/interfaces/store/templates.interface";
import { TemplateCategory } from "@src/types/components";
import { fetchAndUnpackTarGz } from "@src/utilities";

interface TemplateState {
	categories: TemplateCategory[];
	processedTemplates: { [key: string]: ProcessedTemplate };
	isLoading: boolean;
	error: string | null;
	fetchAndProcessArchive: (url: string) => Promise<void>;
	getTemplateContent: (assetDirectory: string, fileName: string) => Promise<string | null>;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
	categories: templateProjectsCategories,
	processedTemplates: {},
	isLoading: false,
	error: null,

	fetchAndProcessArchive: async (url: string) => {
		set({ isLoading: true, error: null });

		try {
			// Fetch and unpack the archive
			const extractedFiles = await fetchAndUnpackTarGz(url);

			// Filter out macOS metadata files and process content
			const processedFiles = extractedFiles
				.filter(
					(file) =>
						// Filter out macOS metadata and empty directories
						!file.filename.includes("/._") && !file.filename.endsWith("/") && file.size > 0
				)
				.map((file) => {
					// Remove the 'templates/' prefix if it exists
					const cleanPath = file.filename.replace(/^templates\//, "");

					// Convert content to string, handling potential encoding issues
					let content: string;
					try {
						content = new TextDecoder().decode(file.content);
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
					} catch (error) {
						console.warn(`Failed to decode file ${cleanPath}, using fallback method`);
						content = Buffer.from(file.content).toString("utf8");
					}

					return {
						path: cleanPath,
						content,
					};
				});

			// Save cleaned files to IndexedDB
			await Promise.all(processedFiles.map((file) => templateDB.saveArchive(file.path, file)));

			// Merge with template categories
			const processed: { [key: string]: ProcessedTemplate } = {};

			for (const category of templateProjectsCategories) {
				for (const card of category.cards) {
					const cardFiles: { [key: string]: string } = {};

					for (const fileName of card.files) {
						// Try to find the file with or without the templates/ prefix
						const filePath = card.assetDirectory + "/" + fileName;
						const archiveFile = processedFiles.find(
							(f) => f.path === filePath || f.path === `templates/${filePath}`
						);

						if (archiveFile) {
							cardFiles[fileName] = archiveFile.content;
						} else {
							console.warn(`File not found: ${filePath}`);
						}
					}

					// Transform integrations
					const mappedIntegrations = card.integrations
						.map((integration) => {
							const integrationKey = integration as unknown as
								| keyof typeof IntegrationsMap
								| keyof typeof HiddenIntegrationsForTemplates;

							return (
								IntegrationsMap[integrationKey as keyof typeof IntegrationsMap] ||
								HiddenIntegrationsForTemplates[
									integrationKey as keyof typeof HiddenIntegrationsForTemplates
								]
							);
						})
						.filter((integration): integration is IntegrationSelectOption => integration !== undefined);

					const processedTemplate: ProcessedTemplate = {
						title: card.title,
						description: card.description,
						integrations: mappedIntegrations,
						assetDirectory: card.assetDirectory,
						files: card.files,
						fileContents: cardFiles,
					};

					processed[card.assetDirectory] = processedTemplate;
					await templateDB.saveTemplate(card.assetDirectory, processedTemplate);
				}
			}

			set({ processedTemplates: processed, isLoading: false });
		} catch (error) {
			console.error("Error processing archive:", error);
			set({
				error: error instanceof Error ? error.message : "Failed to process archive",
				isLoading: false,
			});
		}
	},

	getTemplateContent: async (assetDirectory: string, fileName: string) => {
		const { processedTemplates } = get();

		if (processedTemplates[assetDirectory]?.fileContents[fileName]) {
			return processedTemplates[assetDirectory].fileContents[fileName];
		}

		const template = await templateDB.getTemplate(assetDirectory);
		if (template?.fileContents[fileName]) {
			return template.fileContents[fileName];
		}

		return null;
	},
}));
