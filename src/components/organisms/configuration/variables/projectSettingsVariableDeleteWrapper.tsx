import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { VariableDelete } from "./delete";

export const ProjectSettingsVariableDeleteWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate("..");
	};

	const handleDelete = () => {
		navigate("..");
	};

	if (!id) {
		return null;
	}

	return <VariableDelete onBack={handleBack} onDelete={handleDelete} variableName={id} />;
};
