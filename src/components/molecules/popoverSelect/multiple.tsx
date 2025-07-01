import React from "react";

import { MultiplePopoverSelectProps } from "@src/interfaces/components";

import { BasePopoverSelect } from "@components/molecules/popoverSelect/base";

export const MultiplePopoverSelect = ({ ...props }: MultiplePopoverSelectProps) => {
	return <BasePopoverSelect {...props} multiple />;
};
