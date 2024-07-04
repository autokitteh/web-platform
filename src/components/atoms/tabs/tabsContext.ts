import { TabsContextProps } from "@interfaces/components";
import React from "react";

export const TabsContext = React.createContext<TabsContextProps>({
	activeTab: undefined,
	setActiveTab: () => null,
});
