import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsConnectionDelete } from "./projectSettingsConnectionDelete";

export const ProjectSettingsConnectionDeleteWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	const handleDelete = () => {
		navigate(-1);
	};

	if (!id) {
		return null;
	}

	return <ProjectSettingsConnectionDelete connectionId={id} onBack={handleBack} onDelete={handleDelete} />;
};
