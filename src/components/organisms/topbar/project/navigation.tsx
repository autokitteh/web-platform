import React, { useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { mainNavigationItems } from "@src/constants";
import { useCacheStore } from "@src/store/useCacheStore";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

export const ProjectTopbarNavigation = () => {
	const { deploymentId: paramDeploymentId, projectId } = useParams();
	const location = useLocation();
	const { fetchLastDeploymentId, projectLastDeployment } = useCacheStore();
	const navigate = useNavigate();

	const [cachedLastDeploymentId, setCachedLastDeploymentId] = useState<string>();

	const fetchCurrentDeploymentId = async () => {
		if (!projectId) return;

		const fetchedDeploymentId = await fetchLastDeploymentId(projectId);
		if (fetchedDeploymentId) {
			setCachedLastDeploymentId(fetchedDeploymentId);
		}
	};

	useEffect(() => {
		const lastDeployment = projectLastDeployment?.[projectId!];
		if (lastDeployment) {
			setCachedLastDeploymentId(lastDeployment);

			return;
		}

		fetchCurrentDeploymentId();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, projectLastDeployment]);

	const deploymentId = cachedLastDeploymentId || paramDeploymentId;

	const selectedSection = useMemo(() => {
		if (paramDeploymentId) return "sessions";
		if (location.pathname.includes("deployments")) return "deployments";

		return "assets";
	}, [paramDeploymentId, location.pathname]);

	const navigationItems = useMemo(
		() =>
			mainNavigationItems.map((item) => {
				const noDeploymentsState = item.key === "sessions" && !cachedLastDeploymentId;
				const isSelected = selectedSection === item.key;
				const buttonClassName = cn(
					"group size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-black",
					{
						"active bg-black": isSelected,
					}
				);
				const iconClassName = cn("text-white", {
					"text-green-200": isSelected,
				});
				const href = `/projects/${projectId}${item.path.replace("{deploymentId}", deploymentId || "")}`;

				return {
					...item,
					noDeploymentsState,
					isSelected,
					buttonClassName,
					iconClassName,
					href,
				};
			}),
		[cachedLastDeploymentId, selectedSection, projectId, deploymentId]
	);

	return (
		<div className="ml-5 mr-auto flex items-stretch divide-x divide-gray-750 border-x border-gray-750">
			{navigationItems.map(({ buttonClassName, href, icon, iconClassName, key, label, noDeploymentsState }) => (
				<Button
					ariaLabel={label}
					className={buttonClassName}
					disabled={noDeploymentsState}
					key={key}
					onClick={() => navigate(href)}
					role="navigation"
					title={label}
					variant="filledGray"
				>
					<IconSvg className={iconClassName} size="lg" src={icon} />

					<span className="ml-2 group-hover:text-white">{label}</span>
				</Button>
			))}
		</div>
	);
};
