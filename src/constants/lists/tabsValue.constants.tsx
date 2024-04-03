import React from "react";
import { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } from "@components/organisms";
import { EProjectTabs } from "@enums/components";

export const tabsMainFrame = [
	{ id: EProjectTabs.codeAndAssets, title: "Code & Assets", count: 2, content: () => <AddCodeAssetsTab /> },
	{ id: EProjectTabs.connections, title: "Connections", count: 6, content: () => <ConnectionsContent /> },
	{ id: EProjectTabs.triggers, title: "Triggers", count: 4, content: () => <TriggersContent /> },
	{ id: EProjectTabs.variables, title: "Variables", count: 4, content: () => <VariablesContent /> },
];
