import React, { useMemo } from "react";

import { motion } from "motion/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { featureFlags, mainNavigationItems, aiProjectNavigationItems, tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent, useLastVisitedEntity } from "@src/hooks";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

export const ProjectTopbarNavigation = () => {
	const { deploymentId: paramDeploymentId, projectId, sessionId } = useParams();
	const location = useLocation();
	const pathname = location?.pathname;

	const navigate = useNavigate();
	const { deployments } = useLastVisitedEntity(projectId, paramDeploymentId, sessionId);

	const navigationItems = useMemo(
		() =>
			mainNavigationItems.map((item) => {
				const isSelected = pathname.indexOf(item.key) > -1;
				const buttonClassName = cn(
					"group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050",
					{
						"bg-black font-semibold active text-white": isSelected,
					}
				);

				const iconClassName = cn(
					"group-hover:stroke-green-200 group-hover:text-green-200 group-active:text-green-800",
					{
						"text-green-200": isSelected,
					},
					{
						"stroke-white group-hover:stroke-green-200 h-[1.15rem] w-[1.15rem]": item.key === "events",
					}
				);

				const href = `/projects/${projectId}${item.path}`;

				return {
					...item,
					isSelected,
					buttonClassName,
					iconClassName,
					href,
				};
			}),
		[pathname, projectId]
	);

	const handleAiButtonClick = (action: string) => {
		if (!projectId) return;
		if (action === aiProjectNavigationItems.aiAssistant.action) {
			triggerEvent(EventListenerName.displayProjectAiAssistantSidebar);
			triggerEvent(EventListenerName.hideProjectConfigSidebar);
		} else if (action === aiProjectNavigationItems.projectConfigSidebar.action) {
			triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
			navigate(`${pathname}/settings`);
		}
	};

	return (
		<div className="ml-50 mr-auto flex items-stretch divide-x divide-gray-750 border-x border-gray-750">
			{navigationItems.map(({ buttonClassName, href, icon, iconClassName, isSelected, key, label }) => (
				<Button
					ariaLabel={label}
					className={buttonClassName}
					disabled={key === "sessions" ? !deployments?.length : false}
					id={key === "sessions" ? tourStepsHTMLIds.sessionsTopNav : ""}
					key={key}
					onClick={() => navigate(href)}
					role="navigation"
					title={label}
					variant="filledGray"
				>
					<IconSvg className={iconClassName} size="lg" src={icon} />
					<span className="group-hover:text-white">{label}</span>

					{isSelected ? (
						<motion.div
							className="absolute inset-x-0 -bottom-2 h-2 bg-gray-750"
							layoutId="underline"
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
						/>
					) : null}
				</Button>
			))}
			{featureFlags.displayChatbot
				? Object.values(aiProjectNavigationItems).map(({ key, label, icon, action }) => (
						<Button
							ariaLabel={label}
							className="group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050 hover:text-white"
							key={key}
							onClick={() => handleAiButtonClick(action)}
							role="navigation"
							title={label}
							variant="filledGray"
						>
							<IconSvg
								className="size-5 fill-green-200 text-green-200 transition group-hover:text-green-200 group-active:text-green-800"
								size="lg"
								src={icon}
							/>
							<span className="group-hover:text-white">{label}</span>
						</Button>
					))
				: null}
		</div>
	);
};
