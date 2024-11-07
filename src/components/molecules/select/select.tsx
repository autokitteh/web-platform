import React, { forwardRef } from "react";

import ReactSelect from "react-select";

import { SelectProps } from "@interfaces/components";

import { BaseSelect } from "@components/molecules/select";

export const Select = forwardRef<HTMLDivElement, SelectProps>((props, ref) => (
	<BaseSelect {...props} SelectComponent={ReactSelect} ref={ref} />
));

Select.displayName = "Select";
