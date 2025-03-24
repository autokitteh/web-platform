export const defaultProjectTab = "code";

export const projectTabs = [
	{ id: "codeAndAssetsTab", label: "Code & Assets", value: "code" },
	{ id: "tourProjectConnections", label: "Connections", value: "connections" },
	{ id: "triggersTab", label: "Triggers", value: "triggers" },
	{ id: "variablesTab", label: "Variables", value: "variables" },
] as { id: string; label: string; value: string }[];

export const defaultProjectFile = "program.py";
export const defaultOpenedProjectFile = "README.md";
export const defaultProjectDirectory = "new_project_program";
