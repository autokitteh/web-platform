import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsConnectionEdit } from "./connections/projectSettingsConnectionEdit";
import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";

export const ProjectSettingsDrawerConnectionEdit = () => {
	const navigate = useNavigate();
	const { connectionId } = useParams<{ connectionId: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	if (!connectionId) {
		return null;
	}

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsConnectionEdit connectionId={connectionId} onBack={handleBack} />
		</ProjectSettingsDrawerShell>
	);
};
