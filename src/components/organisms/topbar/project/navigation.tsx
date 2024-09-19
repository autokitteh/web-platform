import React from "react";

import { useParams } from "react-router-dom";

import { Button, IconSvg } from "@components/atoms";

import { AssetsIcon, DeploymentsIcon, SessionsIcon } from "@assets/image/icons";

export const ProjectTopbarNavigation = () => {
	const { projectId } = useParams();

	return (
		<div className="ml-5 mr-auto flex items-stretch">
			<div className="h-full border-0.5 border-y-0">
				<Button
					ariaLabel="Assets"
					className="size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-black"
					variant="filledGray"
				>
					<IconSvg size="md" src={AssetsIcon} />
					Assets
				</Button>
			</div>

			<div className="group ml-[-0.5px] h-full border-0.5 border-y-0">
				<Button
					ariaLabel="Assets"
					className="size-full whitespace-nowrap rounded-none bg-transparent p-3.5 group-hover:bg-black"
					variant="filledGray"
				>
					<IconSvg size="md" src={DeploymentsIcon} />
					Deployments
				</Button>
			</div>

			<div className="ml-[-0.5px] h-full border-0.5 border-y-0">
				<Button
					ariaLabel="Assets"
					className="size-full whitespace-nowrap rounded-none bg-transparent p-3.5 hover:bg-black"
					href={`/projects/${projectId}/deployments`}
					variant="filledGray"
				>
					<IconSvg size="md" src={SessionsIcon} />
					Sessions
				</Button>
			</div>
		</div>
	);
};
