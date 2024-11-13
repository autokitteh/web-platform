import { ComponentType, SVGProps } from "react";

export type Integration = {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	label: string;
	value: string;
};
