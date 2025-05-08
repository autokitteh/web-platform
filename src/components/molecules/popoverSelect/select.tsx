import React from "react";

import { PopoverSelectProps } from "@src/interfaces/components";

import { BasePopoverSelect } from "@components/molecules/popoverSelect/base";

export const PopoverSelect = ({ defaultSelectedItem, onItemSelected, ...props }: PopoverSelectProps) => {
	return (
		<BasePopoverSelect
			{...props}
			defaultSelectedItems={defaultSelectedItem ? [defaultSelectedItem] : []}
			multiple={false}
			onItemSelected={onItemSelected}
		/>
	);
};
