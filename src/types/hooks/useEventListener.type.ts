import { EventListenerName } from "@src/enums";
import { Tour } from "@src/interfaces/store";

export type EventRegistry = {
	[EventListenerName.configTourPopoverRef]: HTMLElement;
	[EventListenerName.hideTourPopover]: void;
	[EventListenerName.sessionLogViewerScrollToTop]: void;
	[EventListenerName.sessionReload]: void;
	[EventListenerName.setupTourStepListener]: {
		stepId: string;
		tourContinue?: boolean;
		tourData: Tour;
		tourId: string;
	};
	[EventListenerName.showToursProgress]: void;
	[EventListenerName.tourPopoverReady]: void;
};

export type EventData<T extends EventListenerName> = T extends keyof EventRegistry ? EventRegistry[T] : void;
