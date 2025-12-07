import { SelectOption } from "./select.interface";
import { SvgIconType } from "@src/interfaces/components/icon.interface";

export interface SelectGroup {
	label: string;
	options: SelectOption[];
	icon?: SvgIconType;
	iconClassName?: string;
	hideHeader?: boolean;
}
