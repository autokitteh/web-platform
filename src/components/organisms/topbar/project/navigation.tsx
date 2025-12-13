import React, { useCallback, useMemo } from "react";

import { useLocation, useParams } from "react-router-dom";

import { featureFlags, projectRouteSegments, tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useHasActiveDeployments, useSharedBetweenProjectsStore } from "@src/store";
import { useNavigateWithSettings } from "@src/utilities/navigation";

import { NavigationButton } from "@components/molecules";

import {
	AssetsIcon,
	DeploymentsIcon,
	EventsFlag,
	SessionsIcon,
	SettingsIcon,
	ArrowZigzagIcon,
} from "@assets/image/icons";
import MagicAiIcon from "@assets/image/icons/ai";

export const ProjectTopbarNavigation = () => {
	const { projectId } = useParams();
	const { pathname } = useLocation();
	const { setIsProjectFilesVisible, isDrawerOpen } = useSharedBetweenProjectsStore();
	const navigateWithSettings = useNavigateWithSettings();
	const hasActiveDeployment = useHasActiveDeployments();
	const hasDeployments = useCacheStore((state) => (state.deployments?.length ?? 0) > 0);

	const pathSegments = useMemo(() => pathname.split("/"), [pathname]);
	const isExplorerSelected = pathSegments.includes(projectRouteSegments.explorer);
	const isSessionsSelected = pathSegments.includes(projectRouteSegments.sessions);
	const isDeploymentsSelected = pathSegments.includes(projectRouteSegments.deployments) && !isSessionsSelected;
	const isWorkflowSelected = pathSegments.includes(projectRouteSegments.workflow);
	const isConfigDrawerOnTop = pathSegments.includes(projectRouteSegments.settings);

	const isAiDrawerOnTop = projectId ? (isDrawerOpen(projectId, DrawerName.chatbot) ?? false) : false;
	const isEventsDrawerOnTop = projectId ? (isDrawerOpen(projectId, DrawerName.events) ?? false) : false;

	const handleExplorerClick = useCallback(() => {
		if (!projectId) return;

		setIsProjectFilesVisible(projectId, true);
		navigateWithSettings(`/${projectRouteSegments.explorer}`);
	}, [projectId, setIsProjectFilesVisible, navigateWithSettings]);

	const handleDeploymentsClick = useCallback(() => {
		navigateWithSettings(`/${projectRouteSegments.deployments}`);
	}, [navigateWithSettings]);

	const handleSessionsClick = useCallback(() => {
		navigateWithSettings(`/${projectRouteSegments.sessions}`);
	}, [navigateWithSettings]);

	const handleWorkflowClick = useCallback(() => {
		navigateWithSettings(`/${projectRouteSegments.workflow}`);
	}, [navigateWithSettings]);

	const handleOpenConfigSidebar = useCallback(() => {
		if (isConfigDrawerOnTop) {
			triggerEvent(EventListenerName.hideProjectConfigSidebar);

			return;
		}
		triggerEvent(EventListenerName.hideProjectEventsSidebar);
		triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
		triggerEvent(EventListenerName.displayProjectConfigSidebar);
	}, [isConfigDrawerOnTop]);

	const handleOpenEventsSidebar = useCallback(() => {
		if (isEventsDrawerOnTop) {
			triggerEvent(EventListenerName.hideProjectEventsSidebar);

			return;
		}
		triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
		triggerEvent(EventListenerName.hideProjectConfigSidebar);
		triggerEvent(EventListenerName.displayProjectEventsSidebar, { projectId });
	}, [isEventsDrawerOnTop, projectId]);

	const handleOpenAiAssistant = useCallback(() => {
		if (isAiDrawerOnTop) {
			triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);

			return;
		}
		triggerEvent(EventListenerName.hideProjectEventsSidebar);
		triggerEvent(EventListenerName.hideProjectConfigSidebar);
		triggerEvent(EventListenerName.displayProjectAiAssistantSidebar);
	}, [isAiDrawerOnTop]);

	if (!projectId) {
		return null;
	}

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
				ariaLabel="Workflow"
				icon={ArrowZigzagIcon}
				isSelected={isWorkflowSelected}
				keyName="workflow"
				label="Workflow"
				onClick={handleWorkflowClick}
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
				disabled={!hasDeployments}
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
				isSelected={isConfigDrawerOnTop}
				keyName="settings"
				label="Config"
				onClick={handleOpenConfigSidebar}
				showUnderline={false}
			/>

			<NavigationButton
				ariaLabel="Events"
				icon={EventsFlag}
				isEventsButton
				isSelected={isEventsDrawerOnTop}
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
					isSelected={isAiDrawerOnTop}
					keyName="chatbot"
					label="AI"
					onClick={handleOpenAiAssistant}
					showUnderline={false}
				/>
			) : null}
		</div>
	);
};
