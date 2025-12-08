import React from "react";

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

export const ProjectTopbarNavigation = () => {
	const { projectId } = useParams();
	const { deployments } = useCacheStore();
	const location = useLocation();
	const pathname = location?.pathname;
	const { setIsProjectFilesVisible } = useSharedBetweenProjectsStore();
	const navigateWithSettings = useNavigateWithSettings();
	const hasActiveDeployment = useHasActiveDeployments();

	const isExplorerSelected = pathname.indexOf("explorer") > -1;
	const isSessionsSelected = pathname.indexOf("sessions") > -1;
	const isDeploymentsSelected = pathname.indexOf("deployments") > -1 && !isSessionsSelected;

	const isDrawerOpen = useSharedBetweenProjectsStore((state) => state.isDrawerOpen);

	const isConfigDrawerOnTop = pathname.includes("/settings");

	const isAiDrawerOnTop = projectId && isDrawerOpen(projectId, DrawerName.chatbot);

	const isEventsDrawerOnTop = projectId && isDrawerOpen(projectId, DrawerName.events);

	const handleOpenAiAssistant = () => {
		if (isAiDrawerOnTop) {
			triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
		} else {
			triggerEvent(EventListenerName.hideProjectManualRunSettings);
			triggerEvent(EventListenerName.hideProjectEventsSidebar);
			triggerEvent(EventListenerName.hideProjectConfigSidebar);
			triggerEvent(EventListenerName.displayProjectAiAssistantSidebar);
		}
	};

	const handleOpenConfigSidebar = () => {
		if (isConfigDrawerOnTop) {
			triggerEvent(EventListenerName.hideProjectConfigSidebar);
		} else {
			triggerEvent(EventListenerName.hideProjectManualRunSettings);
			triggerEvent(EventListenerName.hideProjectEventsSidebar);
			triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
			triggerEvent(EventListenerName.displayProjectConfigSidebar);
		}
	};

	const handleOpenEventsSidebar = () => {
		if (isEventsDrawerOnTop) {
			triggerEvent(EventListenerName.hideProjectEventsSidebar);
		} else {
			triggerEvent(EventListenerName.hideProjectManualRunSettings);
			triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
			triggerEvent(EventListenerName.hideProjectConfigSidebar);
			triggerEvent(EventListenerName.displayProjectEventsSidebar, { projectId });
		}
	};

	const handleExplorerClick = () => {
		setIsProjectFilesVisible(projectId!, true);

		navigateWithSettings(`/projects/${projectId!}/explorer`);
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
				onClick={() => navigateWithSettings(`/projects/${projectId!}/deployments`)}
			/>

			<NavigationButton
				ariaLabel="Sessions"
				disabled={!deployments?.length}
				icon={SessionsIcon}
				id={tourStepsHTMLIds.sessionsTopNav}
				isSelected={isSessionsSelected}
				keyName="sessions"
				label="Sessions"
				onClick={() => navigateWithSettings(`/projects/${projectId!}/sessions`)}
			/>

			<NavigationButton
				ariaLabel="Config"
				customIconClassName="size-5 fill-green-200 text-green-200 transition group-hover:text-green-200 group-active:text-green-800"
				icon={SettingsIcon}
				id={tourStepsHTMLIds.projectConfig}
				isSelected={!!isConfigDrawerOnTop}
				keyName="settings"
				label="Config"
				onClick={handleOpenConfigSidebar}
				showUnderline={false}
			/>

			<NavigationButton
				ariaLabel="Events"
				icon={EventsFlag}
				isEventsButton={true}
				isSelected={!!isEventsDrawerOnTop}
				keyName="events"
				label="Events"
				onClick={handleOpenEventsSidebar}
				showUnderline={false}
			/>

			{featureFlags.displayChatbot ? (
				<NavigationButton
					ariaLabel="AI"
					customIconClassName="size-5 fill-green-200 text-green-200 transition group-hover:text-green-200 group-active:text-green-800"
					icon={MagicAiIcon}
					isSelected={!!isAiDrawerOnTop}
					keyName="chatbot"
					label="AI"
					onClick={handleOpenAiAssistant}
					showUnderline={false}
				/>
			) : null}
		</div>
	);
};
