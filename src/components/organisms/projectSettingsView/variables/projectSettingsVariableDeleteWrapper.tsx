import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsVariableDelete } from "./projectSettingsVariableDelete";

export const ProjectSettingsVariableDeleteWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	const handleDelete = () => {
		navigate(-1);
	};

	if (!id) {
		return null;
	}

	return <ProjectSettingsVariableDelete onBack={handleBack} onDelete={handleDelete} variableName={id} />;
};
