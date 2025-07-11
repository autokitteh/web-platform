import React, { useMemo } from "react";

import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { featureFlags, mainNavigationItems, tourStepsHTMLIds } from "@src/constants";
import { useDrawerStore, useProjectStore } from "@src/store";
import { cn } from "@src/utilities";

import { useLastVisitedEntity } from "@hooks";

import { Button, IconSvg } from "@components/atoms";

import MagicAiIcon from "@assets/image/icons/ai";

export const ProjectTopbarNavigation = () => {
	const { deploymentId: paramDeploymentId, projectId, sessionId } = useParams();
	const { pathname } = useLocation();
	const { latestOpened } = useProjectStore();
	const { openDrawer, isDrawerOpen } = useDrawerStore();
	const navigate = useNavigate();
	const { t } = useTranslation("chatbot");

	const { deploymentId, deployments } = useLastVisitedEntity(projectId, paramDeploymentId, sessionId);

	const selectedSection = useMemo(() => {
		if (pathname.includes("sessions")) return "sessions";

		if (pathname.endsWith("deployments")) return "deployments";

		return "assets";
	}, [pathname]);

	const navigationItems = useMemo(
		() =>
			mainNavigationItems.map((item) => {
				const isSelected = selectedSection === item.key;
				const buttonClassName = cn(
					"group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050",
					{
						"bg-black font-semibold active text-white": isSelected,
					}
				);

				const iconClassName = cn("group-hover:text-green-200  group-active:text-green-800", {
					"text-green-200": isSelected,
				});

				const getPath = () => {
					switch (item.key) {
						case "assets":
							return latestOpened.tab ? `/${latestOpened.tab}` : "/code";
						case "sessions":
							return "/sessions";

						case "deployments":
							return "/deployments";
						default:
							return item.path;
					}
				};

				const href = `/projects/${projectId}${getPath()}`;

				return {
					...item,
					isSelected,
					buttonClassName,
					iconClassName,
					href,
				};
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[deployments, selectedSection, projectId, deploymentId]
	);

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
			{featureFlags.displayChatbot ? (
				<Button
					ariaLabel={t("button.ariaLabel")}
					className="group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050 hover:text-white"
					disabled={isDrawerOpen("chatbot")}
					onClick={() => openDrawer("chatbot")}
					role="navigation"
					title={t("button.title")}
					variant="filledGray"
				>
					<IconSvg className="group-hover:text-green-200" size="lg" src={MagicAiIcon} />
					<span className="group-hover:text-white">{t("button.text")}</span>
				</Button>
			) : null}
		</div>
	);
};
