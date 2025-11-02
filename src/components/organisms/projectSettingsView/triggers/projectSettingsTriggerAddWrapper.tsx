import React from "react";

import { useNavigate } from "react-router-dom";

import { ProjectSettingsTriggerAdd } from "./projectSettingsTriggerAdd";

export const ProjectSettingsTriggerAddWrapper = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return <ProjectSettingsTriggerAdd onBack={handleBack} />;
};
