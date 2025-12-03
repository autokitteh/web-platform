import React from "react";

import { SelectOption } from "./select.interface";

export interface SelectGroup {
	label: string;
	options: SelectOption[];
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	iconClassName?: string;
}
