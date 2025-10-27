import React from "react";

import { useTranslation } from "react-i18next";

import { DocumentationModal } from "./documentationModal";
import { ProjectSettingsConnections } from "./projectSettingsConnections";
import { ProjectSettingsDeleteView } from "./projectSettingsDeleteView";
import { ProjectSettingsDocumentation } from "./projectSettingsDocumentation";
import { ProjectSettingsTriggers } from "./projectSettingsTriggers";
import { ProjectSettingsVariables } from "./projectSettingsVariables";
import { ProjectSettingsViewProps } from "@interfaces/components";

import { Button, IconSvg } from "@components/atoms";
import { ActiveIndicator } from "@components/molecules";
import { AddFileModal } from "@components/organisms/code/addModal";

import { Close } from "@assets/image/icons";

export const ProjectSettingsView = ({ hasActiveDeployment, onClose, onEditConnection }: ProjectSettingsViewProps) => {
	const { t } = useTranslation("project-configuration-view");

	return (
		<>
			<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-white">Settings</h2>
					<Button
						ariaLabel="Close Project Settings"
						className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
						id="close-project-settings-button"
						onClick={onClose}
					>
						<IconSvg className="fill-white" src={Close} />
					</Button>
				</div>
				{hasActiveDeployment ? (
					<div className="mb-3 mt-6">
						<ActiveIndicator indicatorText={t("activeDeployment")} />
					</div>
				) : null}

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
