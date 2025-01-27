import React from "react";

import { PopoverListContext } from "@contexts";
import { usePopoverList } from "@src/hooks";
import { PopoverOptions } from "@src/interfaces/components";

export const PopoverListWrapper = ({
	children,
	...restOptions
}: {
	children: React.ReactNode;
} & PopoverOptions) => {
	const popoverList = usePopoverList({ ...restOptions });

	return <PopoverListContext.Provider value={popoverList}>{children}</PopoverListContext.Provider>;
};
