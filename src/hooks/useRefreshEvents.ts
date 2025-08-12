import { useEventListener } from "./useEventListener";
import { refreshDeploymentsAndManualRun } from "@services";
import { EventListenerName } from "@src/enums";

export const useRefreshEvents = (): void => {
	useEventListener(EventListenerName.refreshDeployments, refreshDeploymentsAndManualRun);
};
