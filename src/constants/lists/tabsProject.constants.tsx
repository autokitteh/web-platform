import React from "react";
import { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } from "@components/organisms";
import { ProjectTabs } from "@enums/components";

export const initialProjectTabs = [
	{ title: ProjectTabs.codeAndAssets, content: () => <AddCodeAssetsTab /> },
	{ title: ProjectTabs.connections, content: () => <ConnectionsContent /> },
	{ title: ProjectTabs.triggers, content: () => <TriggersContent /> },
	{ title: ProjectTabs.variables, content: () => <VariablesContent /> },
];
