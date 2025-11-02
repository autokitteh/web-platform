import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsTriggerDelete } from "./projectSettingsTriggerDelete";

export const ProjectSettingsTriggerDeleteWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate("../..");
	};

	const handleDelete = () => {
		navigate("../..");
	};

	if (!id) {
		return null;
	}

	return <ProjectSettingsTriggerDelete onBack={handleBack} onDelete={handleDelete} triggerId={id} />;
};
