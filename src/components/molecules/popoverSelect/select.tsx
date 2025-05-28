import React, { forwardRef } from "react";

import { BasePopoverSelectRef, PopoverSelectProps } from "@src/interfaces/components";

import { BasePopoverSelect } from "@components/molecules/popoverSelect/base";

export const PopoverSelect = forwardRef<BasePopoverSelectRef, PopoverSelectProps>(
	({ defaultSelectedItem, onItemSelected, ...props }, ref) => {
		return (
			<BasePopoverSelect
				{...props}
				defaultSelectedItems={defaultSelectedItem ? [defaultSelectedItem] : []}
				multiple={false}
				onItemSelected={onItemSelected}
				ref={ref}
			/>
		);
	}
);

PopoverSelect.displayName = "PopoverSelect";
