import React, { forwardRef } from "react";

import ReactSelect, { SingleValue } from "react-select";

import { SelectGroup, SelectOption } from "@interfaces/components";
import { ColorSchemes } from "@type";

import { BaseSelect } from "@components/molecules/select";

export interface GroupedSelectProps {
	dataTestid?: string;
	hint?: string;
	isError?: boolean;
	isRequired?: boolean;
	noOptionsLabel?: string;
	label?: string;
	onBlur?: () => void;
	onChange?: (value: SingleValue<SelectOption>) => void;
	groups: SelectGroup[];
	placeholder?: string;
	value?: SelectOption | null;
	defaultValue?: SelectOption | null;
	variant?: ColorSchemes;
	disabled?: boolean;
	"aria-label"?: string;
}

export const GroupedSelect = forwardRef<HTMLDivElement, GroupedSelectProps>((props, ref) => (
	<BaseSelect {...props} SelectComponent={ReactSelect} ref={ref} />
));

GroupedSelect.displayName = "GroupedSelect";
