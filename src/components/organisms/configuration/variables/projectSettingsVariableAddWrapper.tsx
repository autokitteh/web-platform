import React from "react";

import { useNavigate } from "react-router-dom";

import { ProjectSettingsVariableAdd } from "./projectSettingsVariableAdd";

export const ProjectSettingsVariableAddWrapper = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("..");
	};

	return <ProjectSettingsVariableAdd onBack={handleBack} />;
};
