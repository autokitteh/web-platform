import { ComponentType, SVGProps } from "react";

export type TemplateCardType = {
	assetDirectory: string;
	description: string;
	files: string[];
	integrations: Integration[];
	title: string;
};

export type DashboardFooterTemplateCardType = {
	assetDirectory: string;
	description: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	title: string;
};

export type TemplateCategory = {
	cards: TemplateCardType[];
	name: string;
};

export type RemoteTemplateCategory = {
	cards: RemoteTemplateMetadata[];
	name: string;
};

type Integration = {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	label: string;
};

export interface TemplateFile {
	id: string;
	templateId: string;
	path: string;
	content: string;
}

export interface RemoteTemplateMetadata {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	filesIndex: string[];
}

export interface RemoteTemplateCardWithFiles {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	files: Record<string, string>;
}

export interface ProcessedRemoteCategory {
	name: string;
	cards: RemoteTemplateCardWithFiles[];
}
