import { FunctionComponent, SVGProps } from "react";

export type CommunityProjectCard = {
	akCounter: number;
	description: string;
	integrations: FunctionComponent<SVGProps<SVGSVGElement>>[];
};

export type CommunityProjectCategory = {
	cards: CommunityProjectCard[];
	category: string;
};
