import React from "react";
import { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } from "@components/organisms";
import { ProjectTabs } from "@enums/components";

export const tabsMainFrame = [
	{ title: ProjectTabs.codeAndAssets, count: 2, content: () => <AddCodeAssetsTab /> },
	{ title: ProjectTabs.connections, count: 6, content: () => <ConnectionsContent /> },
	{ title: ProjectTabs.triggers, count: 4, content: () => <TriggersContent /> },
	{ title: ProjectTabs.variables, count: 4, content: () => <VariablesContent /> },
];
