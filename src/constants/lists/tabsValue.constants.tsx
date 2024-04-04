import React from "react";
import { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } from "@components/organisms";
import { EProjectTabs } from "@enums/components";

export const tabsMainFrame = [
	{ title: EProjectTabs.codeAndAssets, count: 2, content: () => <AddCodeAssetsTab /> },
	{ title: EProjectTabs.connections, count: 6, content: () => <ConnectionsContent /> },
	{ title: EProjectTabs.triggers, count: 4, content: () => <TriggersContent /> },
	{ title: EProjectTabs.variables, count: 4, content: () => <VariablesContent /> },
];
