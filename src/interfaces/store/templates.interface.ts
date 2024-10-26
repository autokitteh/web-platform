import { IntegrationSelectOption } from "../components/forms";

export interface ArchivedFile {
	path: string;
	content: string;
}

export interface TemplateCategory {
	name: string;
	cards: TemplateCard[];
}

export interface TemplateCard {
	title: string;
	description: string;
	integrations: IntegrationSelectOption[];
	assetDirectory: string;
	files: string[];
}

export interface ProcessedTemplate extends TemplateCard {
	fileContents: { [key: string]: string };
}
