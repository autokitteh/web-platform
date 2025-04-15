import { EventListenerName } from "@src/enums";
import { Tour, TourProgress, TourStep } from "@src/interfaces/store";

export type EventRegistry = {
	[EventListenerName.configTourPopoverRef]: HTMLElement;
	[EventListenerName.hideTourPopover]: void;
	[EventListenerName.sessionLogViewerScrollToTop]: void;
	[EventListenerName.sessionReload]: void;
	[EventListenerName.setupTourStepListener]: { step: TourStep; tour: TourProgress; tourData: Tour };
	[EventListenerName.showToursProgress]: void;
	[EventListenerName.tourPopoverReady]: void;
};

export type EventData<T extends EventListenerName> = T extends keyof EventRegistry ? EventRegistry[T] : void;
