import React from "react";
import { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } from "@components/organisms";
import { EProjectTabs } from "@enums/components";

export const tabsProject = [
	{ title: EProjectTabs.codeAndAssets, count: 0, content: () => <AddCodeAssetsTab /> },
	{ title: EProjectTabs.connections, count: 0, content: () => <ConnectionsContent /> },
	{ title: EProjectTabs.triggers, count: 0, content: () => <TriggersContent /> },
	{ title: EProjectTabs.variables, count: 0, content: () => <VariablesContent /> },
];
