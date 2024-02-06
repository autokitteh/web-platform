import React from "react";
import { ITabsContext } from "@interfaces/components";

export const TabsContext = React.createContext<ITabsContext>({
	activeTab: 0,
	setActiveTab: () => null,
});
