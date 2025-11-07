import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { TriggerEdit } from "./edit";

export const ProjectSettingsTriggerEditWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate("..");
	};

	if (!id) {
		return null;
	}

	return <TriggerEdit onBack={handleBack} triggerId={id} />;
};
