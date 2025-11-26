import { t } from "i18next";

import { TemplateStorageService } from "@services";
import { Integrations } from "@src/enums";
import { TemplateCardWithFiles, TemplateCategory, TemplateMetadataWithCategory } from "@src/interfaces/store";
import { processToursFromTemplates } from "@src/utilities";
import { fetchAndUnpackZip, processReadmeFiles } from "@src/utilities/fetchAndExtractZip.utils";

export const processTemplates = async (
	zipUrl: string,
	storage: TemplateStorageService
): Promise<{
	categories?: TemplateCategory[];
	error?: string;
	templateMap?: Record<string, TemplateMetadataWithCategory>;
}> => {
	const processTemplateCard = async (cardWithFiles: TemplateCardWithFiles, categoryName: string) => {
		await storage.storeTemplateFiles(cardWithFiles.assetDirectory, cardWithFiles.files);

		const integrations: (keyof typeof Integrations)[] = [];
		for (const integration of cardWithFiles?.integrations || []) {
			if (integration in Integrations) {
				integrations.push(integration);
			} else {
				// eslint-disable-next-line no-console
				console.error(
					`Unknown integration "${integration}" found. Expected one of: ${Object.values(Integrations).join(", ")}`
				);
			}
		}

		return {
			assetDirectory: cardWithFiles.assetDirectory,
			title: cardWithFiles.title,
			description: cardWithFiles.description,
			integrations,
			filesIndex: Object.keys(cardWithFiles.files),
			category: categoryName,
		};
	};

	const result = await fetchAndUnpackZip(zipUrl);
	if (!("structure" in result) || result.error) {
		return {
			error: t("templates.failedToFetch", {
				ns: "stores",
			}),
		};
	}

	const processedCategories = processReadmeFiles(result.structure);
	await processToursFromTemplates(result.structure);
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
