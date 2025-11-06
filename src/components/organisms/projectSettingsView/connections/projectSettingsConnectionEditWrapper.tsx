import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsConnectionEdit } from "./projectSettingsConnectionEdit";

export const ProjectSettingsConnectionEditWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate("..");
	};

	if (!id) {
		return null;
	}

	return <ProjectSettingsConnectionEdit connectionId={id} onBack={handleBack} />;
};
