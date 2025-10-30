import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsConnectionDelete } from "./connections/projectSettingsConnectionDelete";
import { ProjectSettingsDrawerShell } from "./projectSettingsDrawerShell";

export const ProjectSettingsDrawerConnectionDelete = () => {
	const navigate = useNavigate();
	const { connectionId } = useParams<{ connectionId: string }>();

	const handleBack = () => {
		navigate(-1);
	};

	const handleDelete = () => {
		navigate(-1);
	};

	if (!connectionId) {
		return null;
	}

	return (
		<ProjectSettingsDrawerShell>
			<ProjectSettingsConnectionDelete connectionId={connectionId} onBack={handleBack} onDelete={handleDelete} />
		</ProjectSettingsDrawerShell>
	);
};
