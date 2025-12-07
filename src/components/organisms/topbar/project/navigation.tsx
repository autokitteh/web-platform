import { useLocation, useParams } from "react-router-dom";

import { featureFlags, tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useHasActiveDeployments, useSharedBetweenProjectsStore } from "@src/store";
import { useNavigateWithSettings } from "@src/utilities/navigation";

import { NavigationButton } from "@components/molecules";

import { AssetsIcon, DeploymentsIcon, EventsFlag, SessionsIcon, SettingsIcon } from "@assets/image/icons";
import MagicAiIcon from "@assets/image/icons/ai";

const isPageSelected = (pathname: string, page: string): boolean => pathname.includes(`/${page}`);

const hideAllDrawers = () => {
	triggerEvent(EventListenerName.hideProjectManualRunSettings);
	triggerEvent(EventListenerName.hideProjectEventsSidebar);
	triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
	triggerEvent(EventListenerName.hideProjectConfigSidebar);
};

export const ProjectTopbarNavigation = () => {
	const { projectId } = useParams();
	const { deployments } = useCacheStore();
	const location = useLocation();
	const pathname = location.pathname ?? "";
	const { setIsProjectFilesVisible, isDrawerOpen } = useSharedBetweenProjectsStore();
	const navigateWithSettings = useNavigateWithSettings();
	const hasActiveDeployment = useHasActiveDeployments();

	if (!projectId) {
		return null;
	}

	const isExplorerSelected = isPageSelected(pathname, "explorer");
	const isSessionsSelected = isPageSelected(pathname, "sessions");
	const isDeploymentsSelected = isPageSelected(pathname, "deployments");

	const isConfigDrawerOpen = !!isDrawerOpen(projectId, DrawerName.settings);
	const isAiDrawerOpen = !!isDrawerOpen(projectId, DrawerName.chatbot);
	const isEventsDrawerOpen = !!isDrawerOpen(projectId, DrawerName.events);

	const handleToggleAiAssistant = () => {
		hideAllDrawers();

		if (!isAiDrawerOpen) {
			triggerEvent(EventListenerName.displayProjectAiAssistantSidebar);
		}
	};

	const handleToggleConfigSidebar = () => {
		hideAllDrawers();

		if (!isConfigDrawerOpen) {
			triggerEvent(EventListenerName.displayProjectConfigSidebar);
		}
	};

	const handleToggleEventsSidebar = () => {
		hideAllDrawers();

		if (!isEventsDrawerOpen) {
			triggerEvent(EventListenerName.displayProjectEventsSidebar, { projectId });
		}
	};

	const handleExplorerClick = () => {
		setIsProjectFilesVisible(projectId, true);
		hideAllDrawers();
		navigateWithSettings("explorer");
	};

	const handleDeploymentsClick = () => {
		hideAllDrawers();
		navigateWithSettings("deployments");
	};

	const handleSessionsClick = () => {
		hideAllDrawers();
		navigateWithSettings("sessions");
	};

	return (
		<div className="ml-50 mr-auto flex items-stretch divide-x divide-gray-750 border-x border-gray-750">
			<NavigationButton
				ariaLabel="Explorer"
				icon={AssetsIcon}
				isSelected={isExplorerSelected}
				keyName="explorer"
				label="Explorer"
				onClick={handleExplorerClick}
			/>

			<NavigationButton
				ariaLabel="Deployments"
				hasActiveIndicator={hasActiveDeployment}
				icon={DeploymentsIcon}
				isSelected={isDeploymentsSelected}
				keyName="deployments"
				label="Deployments"
				onClick={handleDeploymentsClick}
			/>

			<NavigationButton
				ariaLabel="Sessions"
				disabled={!deployments?.length}
				icon={SessionsIcon}
				id={tourStepsHTMLIds.sessionsTopNav}
				isSelected={isSessionsSelected}
				keyName="sessions"
				label="Sessions"
				onClick={handleSessionsClick}
			/>

			<NavigationButton
				ariaLabel="Config"
				customIconClassName="size-5 fill-green-200 text-green-200 transition group-hover:text-green-200 group-active:text-green-800"
				icon={SettingsIcon}
				id={tourStepsHTMLIds.projectConfig}
				isSelected={isConfigDrawerOpen}
				keyName="settings"
				label="Config"
				onClick={handleToggleConfigSidebar}
				showUnderline={false}
			/>

			<NavigationButton
				ariaLabel="Events"
				icon={EventsFlag}
				isEventsButton={true}
				isSelected={isEventsDrawerOpen}
				keyName="events"
				label="Events"
				onClick={handleToggleEventsSidebar}
				showUnderline={false}
			/>

			{featureFlags.displayChatbot ? (
				<NavigationButton
					ariaLabel="AI"
					customIconClassName="size-5 fill-green-200 text-green-200 transition group-hover:text-green-200 group-active:text-green-800"
					icon={MagicAiIcon}
					isSelected={isAiDrawerOpen}
					keyName="chatbot"
					label="AI"
					onClick={handleToggleAiAssistant}
					showUnderline={false}
				/>
			) : null}
		</div>
	);
};
