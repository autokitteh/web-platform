export const defaultProjectTab = "code";

export const projectTabs = [
	{ label: "Code & Assets", value: "code" },
	{ label: "Connections", value: "connections", id: "tourProjectConnections" },
	{ label: "Triggers", value: "triggers" },
	{ label: "Variables", value: "variables" },
] as { id?: string; label: string; value: string }[];

export const defaultProjectFile = "program.py";
export const defaultOpenedProjectFile = "README.md";
export const defaultProjectDirectory = "new_project_program";
