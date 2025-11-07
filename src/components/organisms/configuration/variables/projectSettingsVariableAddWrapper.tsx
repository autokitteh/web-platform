import React from "react";

import { useNavigate } from "react-router-dom";

import { VariableAdd } from "./add";

export const ProjectSettingsVariableAddWrapper = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("..");
	};

	return <VariableAdd onBack={handleBack} />;
};
