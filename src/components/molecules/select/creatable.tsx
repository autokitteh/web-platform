import React, { forwardRef } from "react";

import CreatableSelect from "react-select/creatable";

import { SelectProps } from "@interfaces/components";

import { BaseSelect } from "@components/molecules/select";

export const SelectCreatable = forwardRef<HTMLDivElement, SelectProps>((props, ref) => (
	<BaseSelect {...props} SelectComponent={CreatableSelect} ref={ref} />
));

SelectCreatable.displayName = "SelectCreatable";
