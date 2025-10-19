import React from "react";

import { useTranslation } from "react-i18next";

import { DocumentationModal } from "./documentationModal";
import { ProjectSettingsConnections } from "./projectSettingsConnections";
import { ProjectSettingsDeleteView } from "./projectSettingsDeleteView";
import { ProjectSettingsDocumentation } from "./projectSettingsDocumentation";
import { ProjectSettingsFiles } from "./projectSettingsFiles";
import { ProjectSettingsTriggers } from "./projectSettingsTriggers";
import { ProjectSettingsVariables } from "./projectSettingsVariables";
import { ProjectSettingsViewProps } from "@interfaces/components";

import { ActiveIndicator } from "@components/molecules";
import { AddFileModal } from "@components/organisms/code/addModal";

export const ProjectSettingsView = ({ hasActiveDeployment }: ProjectSettingsViewProps) => {
	const { t } = useTranslation("project-configuration-view");

	return (
		<>
			<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
				<h2 className="mb-4 text-2xl font-semibold text-white">Settings</h2>
				{hasActiveDeployment ? (
					<div className="mb-3 mt-6">
						<ActiveIndicator indicatorText={t("activeDeployment")} />
					</div>
				) : null}

				<ProjectSettingsFiles />
				<ProjectSettingsConnections />
				<ProjectSettingsVariables />
				<ProjectSettingsTriggers />
				<ProjectSettingsDocumentation />
			</div>
			<DocumentationModal />
			<ProjectSettingsDeleteView />
			<AddFileModal />
		</>
	);
};
