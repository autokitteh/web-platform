import React, { useCallback, useEffect, useMemo } from "react";

import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { mainNavigationItems } from "@src/constants";
import { useCacheStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

export const ProjectTopbarNavigation = () => {
	const { deploymentId: paramDeploymentId, projectId } = useParams();
	const { pathname } = useLocation();
	const { deployments, fetchDeployments: getCachedDeployments } = useCacheStore();
	const navigate = useNavigate();

	const fetchDeployments = useCallback(() => {
		getCachedDeployments(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEffect(() => {
		fetchDeployments();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	const deploymentId = paramDeploymentId || deployments?.[0]?.deploymentId;

	const selectedSection = useMemo(() => {
		if (paramDeploymentId) return "sessions";
		if (pathname.includes("deployments")) return "deployments";

		return "assets";
	}, [paramDeploymentId, pathname]);

	const navigationItems = useMemo(
		() =>
			mainNavigationItems.map((item) => {
				const noDeploymentsSessionButtonDisabled =
					item.key === "sessions" && (!deployments || !deployments.length);
				const isSelected = selectedSection === item.key;
				const buttonClassName = cn(
					"relative group size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-gray-1050 text-gray-1500 gap-2",
					{
						"bg-black font-semibold active text-white": isSelected,
					}
				);
				const iconClassName = cn("group-hover:text-green-200  group-active:text-green-800", {
					"text-green-200": isSelected,
				});
				const href = `/projects/${projectId}${item.path.replace("{deploymentId}", deploymentId || "")}`;

				return {
					...item,
					noDeploymentsSessionButtonDisabled,
					isSelected,
					buttonClassName,
					iconClassName,
					href,
				};
			}),
		[deployments, selectedSection, projectId, deploymentId]
	);

	return (
		<div className="ml-5 mr-auto flex items-stretch divide-x divide-gray-750 border-x border-gray-750">
			{navigationItems.map(
				({
					buttonClassName,
					href,
					icon,
					iconClassName,
					isSelected,
					key,
					label,
					noDeploymentsSessionButtonDisabled,
				}) => (
					<Button
						ariaLabel={label}
						className={buttonClassName}
						disabled={noDeploymentsSessionButtonDisabled}
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
				)
			)}
		</div>
	);
};
