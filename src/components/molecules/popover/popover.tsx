import React from "react";

import { PopoverContext } from "@contexts";
import { PopoverOptions } from "@interfaces/components";

import { usePopover } from "@hooks";

export const PopoverWrapper = ({
	children,
	...restOptions
}: {
	children: React.ReactNode;
} & PopoverOptions) => {
	const popover = usePopover({ ...restOptions });

	return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
};
