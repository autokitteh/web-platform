import { ComponentType, SVGProps } from "react";

import { RemoteTemplateMetadata } from "@src/interfaces/store";

export interface TemplateMetadata {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	filesIndex: string[];
}

export interface TemplateMetadataWithCategory {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	filesIndex: string[];
	category: string;
}

export interface TemplateCategory {
	name: string;
	templates: TemplateMetadata[];
}

export type RemoteTemplateCategory = {
	cards: RemoteTemplateMetadata[];
	name: string;
};

export interface TemplateCardWithFiles {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	files: Record<string, string>;
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
