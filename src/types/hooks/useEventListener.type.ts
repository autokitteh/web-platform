import { EventListenerName } from "@src/enums";
import { SetupListenerResult, Tour } from "@src/interfaces/store";

export type EventRegistry = {
	[EventListenerName.configTourPopoverRef]: HTMLElement;
	[EventListenerName.displayRateLimitModal]: {
		limit: string;
		resourceName: string;
		used: string;
	};
	[EventListenerName.hideTourPopover]: void;
	[EventListenerName.navigateToTourUrl]: { url: string };
	[EventListenerName.searchElementByTourStep]: {
		stepId: string;
		tourContinue?: boolean;
		tourData: Tour;
		tourId: string;
	};
	[EventListenerName.sessionLogViewerScrollToTop]: void;
	[EventListenerName.sessionReload]: void;
	[EventListenerName.showToursProgress]: void;
	[EventListenerName.tourElementFound]: SetupListenerResult;
	[EventListenerName.tourPopoverReady]: void;
};

export type EventData<T extends EventListenerName> = T extends keyof EventRegistry ? EventRegistry[T] : void;
