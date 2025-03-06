import i18n from "i18next";

import { TemplateCardWithFiles, TemplateCategory, TemplateMetadataWithCategory } from "@src/interfaces/store";
import { fetchAndUnpackZip, processReadmeFiles } from "@src/utilities/fetchAndExtractZip.utils";

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
		return {
			error: i18n.t("templates.failedToFetch", {
				ns: "stores",
			}),
		};
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
