import React from "react";

import { TabsContextProps } from "@interfaces/components";

export const TabsContext = React.createContext<TabsContextProps>({
	activeTab: undefined,
	setActiveTab: () => null,
});
