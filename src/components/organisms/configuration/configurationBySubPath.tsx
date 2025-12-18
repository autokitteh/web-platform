import React from "react";

import { matchPath, useLocation, useNavigate } from "react-router-dom";

import { extractSettingsPath } from "@src/utilities/navigation";

import { ConfigurationView } from "@components/organisms/configuration/configurationView";
import { AddConnection, EditConnection } from "@components/organisms/configuration/connections";
import { AddTrigger, EditTrigger } from "@components/organisms/configuration/triggers";
import { AddVariable, EditVariable } from "@components/organisms/configuration/variables";

export const ConfigurationBySubPath = ({ settingsSubPath }: { settingsSubPath: string }) => {
	const pathToMatch = `/${settingsSubPath}`;
	const location = useLocation();
	const navigate = useNavigate();
	const { basePath } = extractSettingsPath(location.pathname);

	const handleBackToSettings = () => navigate(`${basePath}/settings`);

	if (matchPath("/connections/new", pathToMatch)) {
		return <AddConnection isDrawerMode={false} isGlobalConnection={false} onBack={handleBackToSettings} />;
	}

	const connectionEditMatch = matchPath("/connections/:id/edit", pathToMatch);
	if (connectionEditMatch) {
		return (
			<EditConnection
				connectionId={connectionEditMatch.params.id}
				isDrawerMode={false}
				isGlobalConnection={false}
				onBack={handleBackToSettings}
			/>
		);
	}

	if (matchPath("/org-connections/new", pathToMatch)) {
		return <AddConnection isDrawerMode={false} isGlobalConnection onBack={handleBackToSettings} />;
	}

	const orgConnectionEditMatch = matchPath("/org-connections/:id/edit", pathToMatch);
	if (orgConnectionEditMatch) {
		return (
			<EditConnection
				connectionId={orgConnectionEditMatch.params.id}
				isDrawerMode={false}
				isGlobalConnection
				onBack={handleBackToSettings}
			/>
		);
	}

	if (matchPath("/variables/new", pathToMatch)) {
		return <AddVariable onBack={handleBackToSettings} />;
	}

	const variableEditMatch = matchPath("/variables/:name/edit", pathToMatch);
	if (variableEditMatch) {
		return <EditVariable onBack={handleBackToSettings} variableName={variableEditMatch.params.name} />;
	}

	if (matchPath("/triggers/new", pathToMatch)) {
		return <AddTrigger onBack={handleBackToSettings} />;
	}

	const triggerEditMatch = matchPath("/triggers/:id/edit", pathToMatch);
	if (triggerEditMatch) {
		return <EditTrigger onBack={handleBackToSettings} triggerId={triggerEditMatch.params.id} />;
	}

	return <ConfigurationView />;
};
