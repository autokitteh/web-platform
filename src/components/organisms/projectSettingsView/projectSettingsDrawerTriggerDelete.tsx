import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";
import { ProjectSettingsTriggerDelete } from "./triggers/projectSettingsTriggerDelete";

export const ProjectSettingsDrawerTriggerDelete = () => {
	const navigate = useNavigate();
	const { triggerId } = useParams<{ triggerId: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	const handleDelete = () => {
		navigate(-1);
	};

	if (!triggerId) {
		return null;
	}

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsTriggerDelete onBack={handleBack} onDelete={handleDelete} triggerId={triggerId} />
		</ProjectSettingsDrawerShell>
	);
};
