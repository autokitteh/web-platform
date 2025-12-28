import { EventListenerName } from "@src/enums";
import { IframeError } from "@src/interfaces/hooks";
import { SessionActivity } from "@src/interfaces/models";
import { SetupListenerResult, Tour } from "@src/interfaces/store";
import { OperationType } from "@type/global";

export type EventRegistry = {
	[EventListenerName.activitiesNewItemsAvailable]: { count: number; sessionId: string };
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
	[EventListenerName.displayProjectConfigSidebar]: void;
	[EventListenerName.displayProjectEventsSidebar]: { connectionId?: string; projectId?: string; triggerId?: string };
	[EventListenerName.displayQuotaLimitModal]: {
		limit: string;
		resourceName: string;
		used: string;
	};
	[EventListenerName.displayRateLimitModal]: void;
	[EventListenerName.hideProjectAiAssistantSidebar]: void;
	[EventListenerName.hideProjectConfigSidebar]: void;
	[EventListenerName.hideTourPopover]: void;
	[EventListenerName.iframeError]: IframeError;
	[EventListenerName.logsNewItemsAvailable]: { count: number; sessionId: string };
	[EventListenerName.logsScrollToBottom]: { sessionId: string };
	[EventListenerName.navigateToTourUrl]: { url: string };
	[EventListenerName.revealFileInTree]: { fileName: string };
	[EventListenerName.searchElementByTourStep]: {
		stepId: string;
		tourContinue?: boolean;
		tourData: Tour;
		tourId: string;
	};
	[EventListenerName.selectSessionActivity]: { activity?: SessionActivity };
	[EventListenerName.sessionLogViewerScrollToTop]: void;
	[EventListenerName.sessionReload]: void;
	[EventListenerName.sessionsAutoRefreshTick]: { countdownMs: number; isRefreshing: boolean };
	[EventListenerName.sessionsNewItemsAvailable]: { count: number };
	[EventListenerName.sessionsScrollToTop]: void;
	[EventListenerName.showToursProgress]: void;
	[EventListenerName.tourElementFound]: SetupListenerResult;
	[EventListenerName.tourPopoverReady]: void;
};

export type EventData<T extends EventListenerName> = T extends keyof EventRegistry ? EventRegistry[T] : void;
