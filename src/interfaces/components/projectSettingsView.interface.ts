export interface ProjectSettingsViewProps {
	hasActiveDeployment: boolean;
	onClose: () => void;
	onOperation?: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
}
