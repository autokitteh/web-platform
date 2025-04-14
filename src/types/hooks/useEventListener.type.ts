import { EventListenerName } from "@src/enums";

export type EventRegistry = {
	[EventListenerName.hideTourPopover]: void;
	[EventListenerName.sessionLogViewerScrollToTop]: void;
	[EventListenerName.sessionReload]: void;
	[EventListenerName.showToursProgress]: void;
	[EventListenerName.tourPopoverReady]: void;
	[EventListenerName.configTourPopoverRef]: HTMLElement;
};

export type EventData<T extends EventListenerName> = T extends keyof EventRegistry ? EventRegistry[T] : void;
