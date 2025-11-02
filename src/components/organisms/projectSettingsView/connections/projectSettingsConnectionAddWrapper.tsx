import React from "react";

import { useNavigate } from "react-router-dom";

import { ProjectSettingsConnectionAdd } from "./projectSettingsConnectionAdd";

export const ProjectSettingsConnectionAddWrapper = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return <ProjectSettingsConnectionAdd onBack={handleBack} />;
};
