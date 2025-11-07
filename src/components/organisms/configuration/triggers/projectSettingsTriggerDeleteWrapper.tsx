import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { TriggerDelete } from "./delete";

export const ProjectSettingsTriggerDeleteWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate("..");
	};

	const handleDelete = () => {
		navigate("..");
	};

	if (!id) {
		return null;
	}

	return <TriggerDelete onBack={handleBack} onDelete={handleDelete} triggerId={id} />;
};
