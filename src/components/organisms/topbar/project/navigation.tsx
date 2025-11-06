import React from "react";

import { motion } from "motion/react";
import { useLocation, useParams } from "react-router-dom";

import { featureFlags, tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useCacheStore } from "@src/store";
import { cn, useNavigateWithSettings } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

import { AssetsIcon, DeploymentsIcon, EventsFlag, SessionsIcon, SettingsIcon } from "@assets/image/icons";
import MagicAiIcon from "@assets/image/icons/ai";

export const ProjectTopbarNavigation = () => {
	const { projectId } = useParams();
	const { deployments } = useCacheStore();
	const location = useLocation();
	const pathname = location?.pathname;
	const settingsSidebarOpen = pathname.indexOf("/settings") > -1;

	const navigateWithSettings = useNavigateWithSettings();

	const isExplorerSelected = pathname.indexOf("explorer") > -1;
	const isDeploymentsSelected = pathname.indexOf("deployments") > -1;
	const isSessionsSelected = pathname.indexOf("sessions") > -1;

	const getButtonClassName = (isSelected: boolean) =>
		cn(
			"group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050",
			{
				"bg-black font-semibold active text-white": isSelected,
			}
		);

	const getIconClassName = (isSelected: boolean, isEvents: boolean = false) =>
		cn(
			"group-hover:stroke-green-200 group-hover:text-green-200 group-active:text-green-800",
			{
				"text-green-200": isSelected,
			},
			{
				"stroke-white group-hover:stroke-green-200 h-[1.15rem] w-[1.15rem]": isEvents,
			}
		);

	const handleOpenAiAssistant = () => {
		if (!projectId) return;
		triggerEvent(EventListenerName.hideProjectConfigSidebar);
		triggerEvent(EventListenerName.displayProjectAiAssistantSidebar);
	};

	const handleOpenConfigSidebar = () => {
		if (!projectId) return;
		triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
		triggerEvent(EventListenerName.hideProjectEventsSidebar);
		navigateWithSettings("settings");
	};

	const handleOpenEventsSidebar = () => {
		if (!projectId) return;
		triggerEvent(EventListenerName.hideProjectConfigSidebar);
		triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
		triggerEvent(EventListenerName.displayProjectEventsSidebar);
	};

	return (
		<div className="ml-50 mr-auto flex items-stretch divide-x divide-gray-750 border-x border-gray-750">
			<Button
				ariaLabel="Explorer"
				className={getButtonClassName(isExplorerSelected)}
				key="explorer"
				onClick={() => navigateWithSettings(`/projects/${projectId}/explorer`)}
				role="navigation"
				title="Explorer"
				variant="filledGray"
			>
				<IconSvg className={getIconClassName(isExplorerSelected)} size="lg" src={AssetsIcon} />
				<span className="group-hover:text-white">Explorer</span>

				{isExplorerSelected ? (
					<motion.div
						className="absolute inset-x-0 -bottom-2 h-2 bg-gray-750"
						layoutId="underline"
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
					/>
				) : null}
			</Button>

			<Button
				ariaLabel="Deployments"
				className={getButtonClassName(isDeploymentsSelected)}
				key="deployments"
				onClick={() => navigateWithSettings(`/projects/${projectId}/deployments`)}
				role="navigation"
				title="Deployments"
				variant="filledGray"
			>
				<IconSvg className={getIconClassName(isDeploymentsSelected)} size="lg" src={DeploymentsIcon} />
				<span className="group-hover:text-white">Deployments</span>

				{isDeploymentsSelected ? (
					<motion.div
						className="absolute inset-x-0 -bottom-2 h-2 bg-gray-750"
						layoutId="underline"
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
					/>
				) : null}
			</Button>

			<Button
				ariaLabel="Sessions"
				className={getButtonClassName(isSessionsSelected)}
				disabled={!deployments?.length}
				id={tourStepsHTMLIds.sessionsTopNav}
				key="sessions"
				onClick={() => navigateWithSettings(`/projects/${projectId}/sessions`)}
				role="navigation"
				title="Sessions"
				variant="filledGray"
			>
				<IconSvg className={getIconClassName(isSessionsSelected)} size="lg" src={SessionsIcon} />
				<span className="group-hover:text-white">Sessions</span>

				{isSessionsSelected ? (
					<motion.div
						className="absolute inset-x-0 -bottom-2 h-2 bg-gray-750"
						layoutId="underline"
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
					/>
				) : null}
			</Button>

			<Button
				ariaLabel="Config"
				className="group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050 hover:text-white"
				disabled={settingsSidebarOpen}
				id={tourStepsHTMLIds.projectConfig}
				key="settings"
				onClick={handleOpenConfigSidebar}
				role="navigation"
				title="Config"
				variant="filledGray"
			>
				<IconSvg
					className="size-5 fill-green-200 text-green-200 transition group-hover:text-green-200 group-active:text-green-800"
					size="lg"
					src={SettingsIcon}
				/>
				<span className="group-hover:text-white">Config</span>
			</Button>

			<Button
				ariaLabel="Events"
				className="group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050 hover:text-white"
				key="events"
				onClick={handleOpenEventsSidebar}
				role="navigation"
				title="Events"
				variant="filledGray"
			>
				<IconSvg
					className="size-[1.15rem] fill-green-200 stroke-white text-green-200 transition group-hover:stroke-green-200 group-hover:text-green-200 group-active:text-green-800"
					size="lg"
					src={EventsFlag}
				/>
				<span className="group-hover:text-white">Events</span>
			</Button>

			{featureFlags.displayChatbot ? (
				<Button
					ariaLabel="AI"
					className="group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050 hover:text-white"
					key="chatbot"
					onClick={handleOpenAiAssistant}
					role="navigation"
					title="AI"
					variant="filledGray"
				>
					<IconSvg
						className="size-5 fill-green-200 text-green-200 transition group-hover:text-green-200 group-active:text-green-800"
						size="lg"
						src={MagicAiIcon}
					/>
					<span className="group-hover:text-white">AI</span>
				</Button>
			) : null}
		</div>
	);
};
