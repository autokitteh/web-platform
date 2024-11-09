import { createContext, useContext } from "react";

import { PopopverContextType } from "@src/types/components";

export const PopoverContext = createContext<PopopverContextType>(null);

export const usePopoverContext = () => {
	const context = useContext(PopoverContext);

	if (context === null) {
		throw new Error("Popover components must be wrapped in <Popover />");
	}

	return context;
};
