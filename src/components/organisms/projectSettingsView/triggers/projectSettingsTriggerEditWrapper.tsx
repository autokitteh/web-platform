import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsTriggerEdit } from "./projectSettingsTriggerEdit";

export const ProjectSettingsTriggerEditWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate("../..");
	};

	if (!id) {
		return null;
	}

	return <ProjectSettingsTriggerEdit onBack={handleBack} triggerId={id} />;
};
