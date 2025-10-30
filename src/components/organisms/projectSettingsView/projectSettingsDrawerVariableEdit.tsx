import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";
import { ProjectSettingsVariableEdit } from "./variables/projectSettingsVariableEdit";

export const ProjectSettingsDrawerVariableEdit = () => {
	const navigate = useNavigate();
	const { variableName } = useParams<{ variableName: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	if (!variableName) {
		return null;
	}

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsVariableEdit onBack={handleBack} variableName={variableName} />
		</ProjectSettingsDrawerShell>
	);
};
