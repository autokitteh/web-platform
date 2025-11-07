import React from "react";

import { useNavigate } from "react-router-dom";

import { ConnectionAdd } from "./add";

export const ProjectSettingsConnectionAddWrapper = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("..");
	};

	return <ConnectionAdd onBack={handleBack} />;
};
