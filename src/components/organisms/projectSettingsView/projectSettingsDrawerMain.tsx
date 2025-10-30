import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";
import { ProjectSettingsView } from "./projectSettingsView";
import { useHasActiveDeployments } from "@src/store";

export const ProjectSettingsDrawerMain = () => {
	const navigate = useNavigate();
	const { projectId } = useParams();
	const hasActiveDeployment = useHasActiveDeployments();

	const handleClose = () => {
		navigate(-1);
	};

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsView hasActiveDeployment={hasActiveDeployment} key={projectId} onClose={handleClose} />
		</ProjectSettingsDrawerShell>
	);
};
