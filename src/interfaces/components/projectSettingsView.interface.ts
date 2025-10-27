export interface ProjectSettingsViewProps {
	hasActiveDeployment: boolean;
	onClose: () => void;
	onEditConnection?: (connectionId: string) => void;
}
