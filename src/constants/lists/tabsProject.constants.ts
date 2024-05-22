import { ProjectTabs } from "@enums/components";
import { lazily } from "react-lazily";
const { AddCodeAssetsTab, ConnectionsContent, TriggersContent, VariablesContent } = lazily(
	() => import("@components/organisms")
);

export const initialProjectTabs = [
	{ title: ProjectTabs.codeAndAssets, component: AddCodeAssetsTab },
	{ title: ProjectTabs.connections, component: ConnectionsContent },
	{ title: ProjectTabs.triggers, component: TriggersContent },
	{ title: ProjectTabs.variables, component: VariablesContent },
];
