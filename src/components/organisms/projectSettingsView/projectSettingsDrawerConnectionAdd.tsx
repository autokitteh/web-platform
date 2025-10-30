import React from "react";

import { useNavigate } from "react-router-dom";

import { ProjectSettingsConnectionAdd } from "./connections/projectSettingsConnectionAdd";
import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";

export const ProjectSettingsDrawerConnectionAdd = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsConnectionAdd onBack={handleBack} />
		</ProjectSettingsDrawerShell>
	);
};
