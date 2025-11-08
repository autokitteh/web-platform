import { useCacheStore, useEventsDrawerStore, useProjectStore } from "@src/store";

export const useEventsDrawer = () => {
	const { connectionId, projectId, triggerId, section, selectedEventId } = useEventsDrawerStore();
	const { connections, triggers } = useCacheStore();
	const { projectsList } = useProjectStore();
	const connection = connections?.find((c) => c.connectionId === connectionId);
	const trigger = triggers?.find((t) => t.triggerId === triggerId);
	const project = projectsList.find((p) => p.id === projectId);

	const isDrawer = !!(connectionId || triggerId || projectId);

	const displayedEntity = connection ? "connection" : trigger ? "trigger" : "project";
	const displayedEntityName = connection ? connection.name : trigger ? trigger.name : project?.name;

	return {
		isDrawer,
		projectId,
		section,
		triggerId,
		connectionId,
		displayedEntity,
		displayedEntityName,
		connection,
		selectedEventId,
		trigger,
	};
};
