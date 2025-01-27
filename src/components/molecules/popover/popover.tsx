import React from "react";

import { PopoverContext } from "@contexts";
import { usePopover } from "@src/hooks";
import { PopoverOptions } from "@src/interfaces/components";

export const PopoverWrapper = ({
	children,
	...restOptions
}: {
	children: React.ReactNode;
} & PopoverOptions) => {
	const popover = usePopover({ ...restOptions });

	return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
};
