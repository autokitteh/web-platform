import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ConnectionEdit } from "./edit";

export const ProjectSettingsConnectionEditWrapper = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const handleBack = () => {
		navigate("..");
	};

	if (!id) {
		return null;
	}

	return <ConnectionEdit connectionId={id} onBack={handleBack} />;
};
