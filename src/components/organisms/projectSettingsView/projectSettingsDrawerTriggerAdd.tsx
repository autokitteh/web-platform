import React from "react";

import { useNavigate } from "react-router-dom";

import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";
import { ProjectSettingsTriggerAdd } from "./triggers/projectSettingsTriggerAdd";

export const ProjectSettingsDrawerTriggerAdd = () => {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsTriggerAdd onBack={handleBack} />
		</ProjectSettingsDrawerShell>
	);
};
