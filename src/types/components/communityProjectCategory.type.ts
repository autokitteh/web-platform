import { FunctionComponent, SVGProps } from "react";

type Integration = {
	icon: FunctionComponent<SVGProps<SVGSVGElement>>;
	title: string;
};

export type CommunityProjectCardType = {
	counter: number;
	description: string;
	integrations: Integration[];
	title: string;
};

export type TemplateCardType = {
	asset: string;
	description: string;
	integrations: Integration[];
	title: string;
};

export type CommunityProjectCategory = {
	cards: CommunityProjectCardType[];
	name: string;
};

export type TemplateCategory = {
	cards: TemplateCardType[];
	name: string;
};
