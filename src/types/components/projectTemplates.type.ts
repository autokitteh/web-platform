import { FunctionComponent, SVGProps } from "react";

export type TemplateCardType = {
	asset_directory: string;
	description: string;
	integrations: Integration[];
	title: string;
};

export type TemplateCategory = {
	cards: TemplateCardType[];
	name: string;
};

type Integration = {
	icon: FunctionComponent<SVGProps<SVGSVGElement>>;
	title: string;
};
