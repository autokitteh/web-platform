import React from "react";

import {
	DeleteActiveDeploymentProjectModal,
	DeleteDrainingDeploymentProjectModal,
	DeleteProjectModal,
} from "@components/organisms/modals";

interface ProjectsTableModalsProps {
	isDeleting: boolean;
	onDelete: () => Promise<void>;
}

export const ProjectsTableModals = ({ isDeleting, onDelete }: ProjectsTableModalsProps) => {
	return (
		<>
			<DeleteDrainingDeploymentProjectModal />
			<DeleteActiveDeploymentProjectModal isDeleting={isDeleting} onDelete={onDelete} />
			<DeleteProjectModal isDeleting={isDeleting} onDelete={onDelete} />
		</>
	);
};
