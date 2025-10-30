import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";
import { ProjectSettingsTriggerEdit } from "./triggers/projectSettingsTriggerEdit";

export const ProjectSettingsDrawerTriggerEdit = () => {
	const navigate = useNavigate();
	const { triggerId } = useParams<{ triggerId: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	if (!triggerId) {
		return null;
	}

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsTriggerEdit onBack={handleBack} triggerId={triggerId} />
		</ProjectSettingsDrawerShell>
	);
};
