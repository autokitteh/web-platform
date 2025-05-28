import { SelectOption } from "@src/interfaces/components";

export interface EventsDrawerContextType {
	isDrawer: boolean;
	sourceId?: string;
	projectId?: string;
	filterType?: string;
}

export interface EventFiltersProps {
	projectOptions: SelectOption[];
	onProjectChange: (projectId: string) => void;
	onSourceNameChange: (projectId: string, sourceId: string, integrationId: string) => void;
	onIntegrationChange: (projectId: string, sourceId: string, integrationId: string) => void;
	onRefresh: (projectId: string, sourceId: string, integrationId: string) => Promise<void>;
	isLoading: boolean;
}
