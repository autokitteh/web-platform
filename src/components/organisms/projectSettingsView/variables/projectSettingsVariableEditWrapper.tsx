import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsVariableEdit } from "./projectSettingsVariableEdit";

export const ProjectSettingsVariableEditWrapper = () => {
	const navigate = useNavigate();
	const { name } = useParams<{ name: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	if (!name) {
		return null;
	}

	return <ProjectSettingsVariableEdit onBack={handleBack} variableName={name} />;
};
