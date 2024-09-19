import React from "react";

import { useParams } from "react-router-dom";

import { useManualRunStore } from "@src/store";

import { Button, IconSvg } from "@components/atoms";

import { AssetsIcon, DeploymentsIcon, SessionsIcon } from "@assets/image/icons";

export const ProjectTopbarNavigation = () => {
	const { projectId } = useParams();
	const { lastDeploymentStore } = useManualRunStore((state) => ({
		lastDeploymentStore: state.projectManualRun[projectId!]?.lastDeployment,
	}));

	return (
		<div className="ml-5 mr-auto flex items-stretch">
			<div className="mr-[-0.5px] h-full border-0.5 border-y-0 border-gray-750">
				<Button
					ariaLabel="Assets"
					className="group size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-black"
					href={`/projects/${projectId}/code`}
					variant="filledGray"
				>
					<IconSvg className="text-white group-hover:text-green-200" size="lg" src={AssetsIcon} />

					<span className="ml-2 group-hover:text-white">Assets</span>
				</Button>
			</div>

			<div className="mx-[-0.5px] h-full border-0.5 border-y-0 border-gray-750">
				<Button
					ariaLabel="Deployments"
					className="group size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-black"
					href={`/projects/${projectId}/deployments`}
					variant="filledGray"
				>
					<IconSvg className="text-white group-hover:text-green-200" size="lg" src={DeploymentsIcon} />

					<span className="ml-2 group-hover:text-white">Deployments</span>
				</Button>
			</div>

			<div className="ml-[-0.5px] h-full border-0.5 border-y-0 border-gray-750">
				{lastDeploymentStore ? (
					<Button
						ariaLabel="Sessions"
						className="group size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-black"
						href={`/projects/${projectId}/deployments/${lastDeploymentStore.deploymentId}/sessions`}
						variant="filledGray"
					>
						<IconSvg className="text-white group-hover:text-green-200" size="lg" src={SessionsIcon} />

						<span className="ml-2 group-hover:text-white">Sessions</span>
					</Button>
				) : null}
			</div>
		</div>
	);
};
