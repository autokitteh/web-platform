import React from "react";
import { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } from "@components/organisms";

export const tabsMainFrame = [
	{ id: 1, title: "Code & Assets", count: 2, content: () => <AddCodeAssetsTab /> },
	{ id: 2, title: "Connections", count: 6, content: () => <ConnectionsContent /> },
	{ id: 3, title: "Triggers", count: 4, content: () => <TriggersContent /> },
	{ id: 4, title: "Variables", count: 4, content: () => <VariablesContent /> },
];
