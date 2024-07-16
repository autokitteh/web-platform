import { FunctionComponent, SVGProps } from "react";

type Integration = {
	icon: FunctionComponent<SVGProps<SVGSVGElement>>;
	title: string;
};

export type CommunityProjectCardType = {
	counter: number;
	description: string;
	integrations: Integration[];
};

export type CommunityProjectCategory = {
	cards: CommunityProjectCardType[];
	name: string;
};
