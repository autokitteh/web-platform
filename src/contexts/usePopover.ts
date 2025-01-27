import { createContext, useContext } from "react";

import { PopoverContextType, PopoverListContextType } from "@src/types/components";

export const PopoverContext = createContext<PopoverContextType>(null);
export const PopoverListContext = createContext<PopoverListContextType>(null);

export const usePopoverContext = () => {
	const context = useContext(PopoverContext);

	if (context === null) {
		throw new Error("Popover components must be wrapped in <Popover />");
	}

	return context;
};

export const usePopoverListContext = () => {
	const context = useContext(PopoverListContext);

	if (context === null) {
		throw new Error("Popover list components must be wrapped in <PopoverListWrapper />");
	}

	return context;
};
