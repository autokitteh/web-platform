import i18n from "i18next";
import { create } from "zustand";

import { LoggerService } from "@services";
import { templateDB } from "@services/templates.services";
import { namespaces, templateProjectsCategories } from "@src/constants";
import { HiddenIntegrationsForTemplates, IntegrationsMap } from "@src/enums/components/connection.enum";
import { ProcessedTemplate, TemplateState } from "@src/interfaces/store/templates.interface";
import { fetchAndUnpackTarGz } from "@src/utilities";

import { useToastStore } from "@store";

export const useTemplateStore = create<TemplateState>((set) => ({
	processedTemplates: {},
	isLoading: false,

	fetchAndProcessArchive: async (url: string) => {
		set({ isLoading: true });

		try {
			const extractedFiles = await fetchAndUnpackTarGz(url);

			const processedFiles = extractedFiles
				.filter((file) => !file.filename.includes("/._") && !file.filename.endsWith("/") && file.size > 0)
				.map((file) => {
					const cleanPath = file.filename.replace(/^templates\//, "");

					let content: string;
					try {
						content = new TextDecoder().decode(file.content);
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
					} catch (error) {
						content = Buffer.from(file.content).toString("utf8");
					}

					return {
						path: cleanPath,
						content,
					};
				});

			await Promise.all(processedFiles.map((file) => templateDB.saveArchive(file.path, file)));

			const processed: { [key: string]: ProcessedTemplate } = {};

			for (const category of templateProjectsCategories) {
				for (const card of category.cards) {
					const cardFiles: { [key: string]: string } = {};

					for (const fileName of card.files) {
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

					const mappedIntegrations = card.integrations.map((integration) => {
						const integrationKey = integration as unknown as
							| keyof typeof IntegrationsMap
							| keyof typeof HiddenIntegrationsForTemplates;

						return (
							IntegrationsMap[integrationKey as keyof typeof IntegrationsMap] ||
							HiddenIntegrationsForTemplates[
								integrationKey as keyof typeof HiddenIntegrationsForTemplates
							]
						);
					});

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
			useToastStore.getState().addToast({
				message: i18n.t("templatesProcessError", { ns: "errors" }),
				type: "error",
			});
			LoggerService.error(
				namespaces.stores.outputStore,
				i18n.t("templatesProcessErrorExtended", { ns: "errors", error: (error as Error).message })
			);

			set({
				isLoading: false,
			});
		}
	},
}));
