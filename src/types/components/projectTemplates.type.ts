import { ComponentType, SVGProps } from "react";

export interface TemplateFile {
	id: string;
	templateId: string;
	path: string;
	content: string;
}

export interface TemplateMetadata {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	filesIndex: string[]; // List of file paths
}

export interface TemplateCategory {
	name: string;
	templates: TemplateMetadata[];
}

export interface TemplateCardWithFiles {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	files: Record<string, string>;
}

// This is the type we use in the UI after processing
export interface TemplateCardType {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	filesIndex: string[];
	category: string;
}

export interface ProcessedCategory {
	name: string;
	cards: TemplateCardWithFiles[]; // Change this to use TemplateCardWithFiles
}

export interface ProcessedCategory {
	name: string;
	cards: TemplateCardWithFiles[];
}

export type Integration = {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	label: string;
	value: string;
};
