export type EventsDrawerSection = "connections" | "triggers" | "project";

export type EventsDrawerState = {
	connectionId?: string;
	projectId?: string;
	section?: EventsDrawerSection;
	selectedEventId?: string;
	triggerId?: string;
};

export interface EventsDrawerStore extends EventsDrawerState {
	setState: (newState: Partial<EventsDrawerState>) => void;
	resetState: () => void;
	setSelectedEventId: (selectedEventId?: string) => void;
}
