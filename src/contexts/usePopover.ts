import { createContext, useContext } from "react";

import { PopopverContextType, PopopverListContextType } from "@src/types/components";

export const PopoverContext = createContext<PopopverContextType>(null);
export const PopoverListContext = createContext<PopopverListContextType>(null);

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
		throw new Error("Popover list components must be wrapped in <PopoverList />");
	}

	return context;
};
