import React from "react";

import { useNavigate } from "react-router-dom";

import { TriggerAdd } from "./add";

export const ProjectSettingsTriggerAddWrapper = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("..");
	};

	return <TriggerAdd onBack={handleBack} />;
};
