import React from "react";

import { useTranslation } from "react-i18next";

import { ProjectSettingsConnections } from "./connections";
import { DocumentationModal } from "./documentationModal";
import { ProjectSettingsDeleteView } from "./projectSettingsDeleteView";
import { ProjectSettingsTriggers } from "./triggers";
import { ProjectSettingsVariables } from "./variables";
import { ProjectSettingsViewProps } from "@interfaces/components";
import { useCacheStore } from "@src/store";

import { Button, IconSvg, ValidationIndicator } from "@components/atoms";
import { ActiveIndicator } from "@components/molecules";
import { AddFileModal } from "@components/organisms/code/addModal";

import { Close } from "@assets/image/icons";

export const ProjectSettingsView = ({ hasActiveDeployment, onClose, onOperation }: ProjectSettingsViewProps) => {
	const { t } = useTranslation("project-configuration-view");
	const { projectValidationState } = useCacheStore();

	const connectionsValidation = projectValidationState.connections;
	const variablesValidation = projectValidationState.variables;
	const triggersValidation = projectValidationState.triggers;

	return (
		<>
			<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-white">Configuration</h2>
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

				<div className="flex items-start gap-3">
					<ValidationIndicator validation={connectionsValidation} />
					<ProjectSettingsConnections onOperation={onOperation} validation={connectionsValidation} />
				</div>

				<div className="flex items-start gap-3">
					<ValidationIndicator validation={variablesValidation} />
					<ProjectSettingsVariables onOperation={onOperation} validation={variablesValidation} />
				</div>

				<div className="flex items-start gap-3">
					<ValidationIndicator validation={triggersValidation} />
					<ProjectSettingsTriggers onOperation={onOperation} validation={triggersValidation} />
				</div>
			</div>
			<DocumentationModal />
			<ProjectSettingsDeleteView />
			<AddFileModal />
		</>
	);
};
