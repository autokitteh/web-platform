import React, { useMemo } from "react";

import { useLocation, useParams } from "react-router-dom";

import { mainNavigationItems } from "@src/constants";
import { useCacheStore } from "@src/store/useCacheStore";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

const baseButtonClass = "group size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-black";
const baseIconClass = "text-white";

export const ProjectTopbarNavigation = () => {
	const { deploymentId: paramDeploymentId, projectId } = useParams();
	const location = useLocation();
	const { projectLastDeployment } = useCacheStore();

	const deploymentId = projectLastDeployment?.[projectId || ""] || paramDeploymentId;

	const selectedSection = useMemo(() => {
		if (paramDeploymentId) return "sessions";
		if (location.pathname.includes("deployments") && projectLastDeployment?.[projectId || ""]) return "deployments";

		return "assets";
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deploymentId, location.pathname, projectId]);

	return (
		<div className="ml-5 mr-auto flex items-stretch">
			{mainNavigationItems.map((item, index) => {
				if (item.key === "sessions" && !deploymentId) return null;

				const isSelected = selectedSection === item.key;
				const buttonClassName = cn(baseButtonClass, { "bg-black": isSelected });
				const iconClassName = cn(baseIconClass, { "text-green-200": isSelected });
				const href = `/projects/${projectId}${item.path.replace("{deploymentId}", deploymentId || "")}`;

				return (
					<div
						className={cn("h-full border-0.5 border-y-0 border-gray-750", {
							"mr-[-0.5px]": index === 0,
							"mx-[-0.5px]": index === 1,
							"ml-[-0.5px]": index === 2,
						})}
						key={item.key}
					>
						<Button ariaLabel={item.label} className={buttonClassName} href={href} variant="filledGray">
							<IconSvg className={iconClassName} size="lg" src={item.icon} />

							<span className="ml-2 group-hover:text-white">{item.label}</span>
						</Button>
					</div>
				);
			})}
		</div>
	);
};
