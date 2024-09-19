import React from "react";

import { useParams } from "react-router-dom";

import { useManualRunStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

import { AssetsIcon, DeploymentsIcon, SessionsIcon } from "@assets/image/icons";

export const ProjectTopbarNavigation = () => {
	const { deploymentId, projectId } = useParams();
	const { lastDeploymentStore } = useManualRunStore((state) => ({
		lastDeploymentStore: state.projectManualRun[projectId!]?.lastDeployment,
	}));

	const isDeploymentsPage = location.pathname.includes("deployments") && projectId;

	const selectedSection = deploymentId ? "sessions" : isDeploymentsPage ? "deployments" : "assets";

	const baseButtonClass = "group size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-black";
	const baseIconClass = "text-white";

	const assetsButtonClassName = cn(baseButtonClass, { "bg-black": selectedSection === "assets" });
	const assetsIconClassName = cn(baseIconClass, { "text-green-200": selectedSection === "assets" });

	const deploymentsButtonClassName = cn(baseButtonClass, { "bg-black": selectedSection === "deployments" });
	const deploymentsIconClassName = cn(baseIconClass, { "text-green-200": selectedSection === "deployments" });

	const sessionsButtonClassName = cn(baseButtonClass, { "bg-black": selectedSection === "sessions" });
	const sessionsIconClassName = cn(baseIconClass, { "text-green-200": selectedSection === "sessions" });

	return (
		<div className="ml-5 mr-auto flex items-stretch">
			<div className="mr-[-0.5px] h-full border-0.5 border-y-0 border-gray-750">
				<Button
					ariaLabel="Assets"
					className={assetsButtonClassName}
					href={`/projects/${projectId}/code`}
					variant="filledGray"
				>
					<IconSvg className={assetsIconClassName} size="lg" src={AssetsIcon} />

					<span className="ml-2 group-hover:text-white">Assets</span>
				</Button>
			</div>

			<div className="mx-[-0.5px] h-full border-0.5 border-y-0 border-gray-750">
				<Button
					ariaLabel="Deployments"
					className={deploymentsButtonClassName}
					href={`/projects/${projectId}/deployments`}
					variant="filledGray"
				>
					<IconSvg className={deploymentsIconClassName} size="lg" src={DeploymentsIcon} />

					<span className="ml-2 group-hover:text-white">Deployments</span>
				</Button>
			</div>

			<div className="ml-[-0.5px] h-full border-0.5 border-y-0 border-gray-750">
				{lastDeploymentStore ? (
					<Button
						ariaLabel="Sessions"
						className={sessionsButtonClassName}
						href={`/projects/${projectId}/deployments/${lastDeploymentStore.deploymentId}/sessions`}
						variant="filledGray"
					>
						<IconSvg className={sessionsIconClassName} size="lg" src={SessionsIcon} />

						<span className="ml-2 group-hover:text-white">Sessions</span>
					</Button>
				) : null}
			</div>
		</div>
	);
};
