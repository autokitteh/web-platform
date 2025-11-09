import React, { useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import { Connections } from "./connections";
import { Triggers } from "./triggers";
import { Variables } from "./variables";
import { DrawerName } from "@src/enums/components";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";
import { getProjectSettingsSectionFromPath, useCloseSettings } from "@utilities";

import { Button, IconSvg } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const ProjectSettingsMainView = () => {
	const { projectValidationState, loading } = useCacheStore();

	const connectionsValidation = projectValidationState.connections;
	const variablesValidation = projectValidationState.variables;
	const triggersValidation = projectValidationState.triggers;

	const { projectId } = useParams();
	const location = useLocation();
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const { setProjectSettingsDrawerOperation, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const { fetchTriggers, fetchVariables, fetchConnections, connections, triggers } = useCacheStore();
	const closeSettings = useCloseSettings();

	useEffect(() => {
		if (projectId) {
			fetchVariables(projectId);
			fetchConnections(projectId);
			fetchTriggers(projectId);
		}
	}, [projectId, fetchVariables, fetchConnections, fetchTriggers]);

	useEffect(() => {
		if (projectId && connections && triggers && connections.length < 3 && triggers.length < 3) {
			setProjectSettingsAccordionState(projectId, "connections", true);
			setProjectSettingsAccordionState(projectId, "triggers", true);
			setProjectSettingsAccordionState(projectId, "variables", true);
		}
	}, [projectId, connections, triggers, setProjectSettingsAccordionState]);

	useEffect(() => {
		if (!projectId) return;

		const section = getProjectSettingsSectionFromPath(location.pathname);

		if (section) {
			setProjectSettingsAccordionState(projectId, section, true);
		}
	}, [location.pathname, projectId, setProjectSettingsAccordionState]);

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
		<div className="relative mx-auto flex size-full flex-col">
			<div className="shrink-0 pb-2 pl-8 pr-6 pt-6">
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
			</div>

			<div className="flex flex-col gap-y-4 overflow-y-auto pl-8 pr-6">
				<Connections
					isLoading={loading.connections}
					onOperation={onOperation}
					validation={connectionsValidation}
				/>
				<Triggers isLoading={loading.triggers} onOperation={onOperation} validation={triggersValidation} />
				<Variables isLoading={loading.variables} onOperation={onOperation} validation={variablesValidation} />
			</div>
		</div>
	);
};
