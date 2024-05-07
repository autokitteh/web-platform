import React from "react";
import { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } from "@components/organisms";
import { ProjectTabs } from "@enums/components";

export const tabsProject = [
	{ title: ProjectTabs.codeAndAssets, count: 0, content: () => <AddCodeAssetsTab /> },
	{ title: ProjectTabs.connections, count: 0, content: () => <ConnectionsContent /> },
	{ title: ProjectTabs.triggers, count: 0, content: () => <TriggersContent /> },
	{ title: ProjectTabs.variables, count: 0, content: () => <VariablesContent /> },
];
