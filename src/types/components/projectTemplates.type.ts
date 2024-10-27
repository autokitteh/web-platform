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

type Integration = {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	label: string;
	value: string;
};
