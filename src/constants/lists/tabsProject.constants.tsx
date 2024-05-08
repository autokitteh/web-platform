import React from "react";
import { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } from "@components/organisms";
import { ProjectTabs } from "@enums/components";

export const initialProjectTabs = [
	{ title: ProjectTabs.codeAndAssets, count: undefined, content: () => <AddCodeAssetsTab /> },
	{ title: ProjectTabs.connections, count: undefined, content: () => <ConnectionsContent /> },
	{ title: ProjectTabs.triggers, count: undefined, content: () => <TriggersContent /> },
	{ title: ProjectTabs.variables, count: undefined, content: () => <VariablesContent /> },
];
