import React from "react";
import { ITabsContext } from "@interfaces";

export const TabsContext = React.createContext<ITabsContext>({
	activeTab: 0,
	setActiveTab: () => {},
});
