import { EventListenerName } from "@src/enums";
import { IframeError } from "@src/interfaces/hooks";
import { SessionActivity } from "@src/interfaces/models";
import { SetupListenerResult, Tour } from "@src/interfaces/store";
import { OperationType } from "@type/global";

export type EventRegistry = {
	[EventListenerName.codeFixSuggestion]: {
		changeType?: OperationType;
		fileName?: string;
		newCode: string;
	};
	[EventListenerName.codeFixSuggestionAdd]: {
		changeType: "add";
		fileName: string;
		newCode: string;
	};
	[EventListenerName.codeFixSuggestionAll]: {
		suggestions: Array<{
			changeType: OperationType;
			fileName: string;
			newCode: string;
		}>;
	};
	[EventListenerName.codeFixSuggestionRemove]: {
		changeType: "remove";
		fileName: string;
	};
	[EventListenerName.configTourPopoverRef]: HTMLElement;
	[EventListenerName.displayProjectAiAssistantSidebar]: void;
	[EventListenerName.displayProjectStatusSidebar]: void;
	[EventListenerName.displayQuotaLimitModal]: {
		limit: string;
		resourceName: string;
		used: string;
	};
	[EventListenerName.displayRateLimitModal]: void;
	[EventListenerName.hideProjectAiAssistantOrStatusSidebar]: void;
	[EventListenerName.hideTourPopover]: void;
	[EventListenerName.iframeError]: IframeError;
	[EventListenerName.navigateToTourUrl]: { url: string };
	[EventListenerName.searchElementByTourStep]: {
		stepId: string;
		tourContinue?: boolean;
		tourData: Tour;
		tourId: string;
	};
	[EventListenerName.selectSessionActivity]: { activity?: SessionActivity };
	[EventListenerName.sessionLogViewerScrollToTop]: void;
	[EventListenerName.sessionReload]: void;
	[EventListenerName.showToursProgress]: void;
	[EventListenerName.tourElementFound]: SetupListenerResult;
	[EventListenerName.tourPopoverReady]: void;
};

export type EventData<T extends EventListenerName> = T extends keyof EventRegistry ? EventRegistry[T] : void;
