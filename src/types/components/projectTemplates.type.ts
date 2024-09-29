import { FunctionComponent, SVGProps } from "react";

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
	icon: FunctionComponent<SVGProps<SVGSVGElement>>;
	title: string;
};

export type TemplateCategory = {
	cards: TemplateCardType[];
	name: string;
};

type Integration = {
	icon: FunctionComponent<SVGProps<SVGSVGElement>>;
	label: string;
};
