import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ProjectSettingsConnections } from "./connections";
import { ProjectSettingsTriggers } from "./triggers";
import { ProjectSettingsVariables } from "./variables";
import { DrawerName } from "@src/enums/components";
import { useCacheStore, useHasActiveDeployments, useSharedBetweenProjectsStore } from "@src/store";
import { useCloseSettings } from "@utilities";

import { Button, IconSvg, ValidationIndicator } from "@components/atoms";
import { ActiveIndicator } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const ProjectSettingsMainView = () => {
	const { t } = useTranslation("project-configuration-view");
	const { projectValidationState } = useCacheStore();

	const connectionsValidation = projectValidationState.connections;
	const variablesValidation = projectValidationState.variables;
	const triggersValidation = projectValidationState.triggers;

	const { projectId } = useParams();
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const { setProjectSettingsDrawerOperation } = useSharedBetweenProjectsStore();
	const hasActiveDeployment = useHasActiveDeployments();
	const fetchTriggers = useCacheStore((state) => state.fetchTriggers);
	const fetchVariables = useCacheStore((state) => state.fetchVariables);
	const fetchConnections = useCacheStore((state) => state.fetchConnections);
	const closeSettings = useCloseSettings();

	useEffect(() => {
		if (projectId) {
			fetchVariables(projectId);
			fetchConnections(projectId);
			fetchTriggers(projectId);
		}
	}, [projectId, fetchVariables, fetchConnections, fetchTriggers]);

	const close = () => {
		if (!projectId) return;
		closeDrawer(projectId, DrawerName.projectSettings);
		setProjectSettingsDrawerOperation(projectId, null);
		closeSettings();
	};

	const onOperation = (
		type: "connection" | "variable" | "trigger",
		action: "add" | "edit" | "delete",
		id?: string
	) => {
		if (!projectId) return;
		setProjectSettingsDrawerOperation(projectId, { type, action, id });
	};

	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-base font-semibold text-white">Configuration</h2>
				<Button
					ariaLabel="Close Project Settings"
					className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
					id="close-project-settings-button"
					onClick={close}
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
	);
};
