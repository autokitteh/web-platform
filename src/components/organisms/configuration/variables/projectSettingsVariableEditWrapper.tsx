import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { VariableEdit } from "./edit";

export const ProjectSettingsVariableEditWrapper = () => {
	const navigate = useNavigate();
	const { name } = useParams<{ name: string }>();

	const handleBack = () => {
		navigate("..");
	};

	if (!name) {
		return null;
	}

	return <VariableEdit onBack={handleBack} variableName={name} />;
};
