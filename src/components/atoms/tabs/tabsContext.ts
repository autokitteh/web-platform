import React from "react";

interface ITabsContext {
	activeTab: string | number;
	setActiveTab: (value: string | number) => void;
}

export const TabsContext = React.createContext<ITabsContext>({
	activeTab: 0,
	setActiveTab: () => {},
});
