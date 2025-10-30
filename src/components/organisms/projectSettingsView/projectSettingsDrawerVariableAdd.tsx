import React from "react";

import { useNavigate } from "react-router-dom";

import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";
import { ProjectSettingsVariableAdd } from "./variables/projectSettingsVariableAdd";

export const ProjectSettingsDrawerVariableAdd = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsVariableAdd onBack={handleBack} />
		</ProjectSettingsDrawerShell>
	);
};
