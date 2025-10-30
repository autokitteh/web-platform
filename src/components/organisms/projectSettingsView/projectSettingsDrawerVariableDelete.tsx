import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";
import { ProjectSettingsVariableDelete } from "./variables/projectSettingsVariableDelete";

export const ProjectSettingsDrawerVariableDelete = () => {
	const navigate = useNavigate();
	const { variableName } = useParams<{ variableName: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	const handleDelete = () => {
		navigate(-1);
	};

	if (!variableName) {
		return null;
	}

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsVariableDelete onBack={handleBack} onDelete={handleDelete} variableName={variableName} />
		</ProjectSettingsDrawerShell>
	);
};
