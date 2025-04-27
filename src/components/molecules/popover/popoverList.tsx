import React from "react";

import { PopoverListContext } from "@contexts";
import { PopoverOptions } from "@interfaces/components";

import { usePopoverList } from "@hooks";

export const PopoverListWrapper = ({
	children,
	...restOptions
}: {
	children: React.ReactNode;
} & PopoverOptions) => {
	const popoverList = usePopoverList({ ...restOptions });

	return <PopoverListContext.Provider value={popoverList}>{children}</PopoverListContext.Provider>;
};
