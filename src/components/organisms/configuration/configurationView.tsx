import React, { useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import { Connections, OrgConnections } from "./connections";
import { Triggers } from "./triggers";
import { Variables } from "./variables";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useOrgConnectionsStore, useOrganizationStore, useSharedBetweenProjectsStore } from "@src/store";
import { getProjectSettingsSectionFromPath } from "@utilities";

import { Button, IconSvg } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const ConfigurationView = () => {
	const { loading, connections, triggers, fetchTriggers, fetchVariables, fetchAllConnections } = useCacheStore();
	const orgConnections = useOrgConnectionsStore((state) => state.orgConnections);
	const { projectId } = useParams();
	const orgId = useOrganizationStore.getState().currentOrganization?.id;
	const location = useLocation();
	const { setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();

	useEffect(() => {
		if (!projectId) return;
		fetchVariables(projectId, true);
		fetchAllConnections(projectId, orgId, true);
		fetchTriggers(projectId, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEffect(() => {
		if (projectId && connections && triggers && connections.length < 4 && triggers.length < 4) {
			setProjectSettingsAccordionState(projectId, "connections", true);
			setProjectSettingsAccordionState(projectId, "triggers", true);
			setProjectSettingsAccordionState(projectId, "variables", true);
			if (orgConnections && orgConnections.length < 4) {
				setProjectSettingsAccordionState(projectId, "orgConnections", true);
			}
		}
	}, [projectId, connections, triggers, setProjectSettingsAccordionState, orgConnections]);

	useEffect(() => {
		if (!projectId) return;

		const section = getProjectSettingsSectionFromPath(location.pathname);

		if (section) {
			setProjectSettingsAccordionState(projectId, section, true);
		}
	}, [location.pathname, projectId, setProjectSettingsAccordionState]);

	const close = () => {
		if (!projectId) return;
		triggerEvent(EventListenerName.hideProjectConfigSidebar);
	};

	return (
		<div className="scrollbar relative mx-auto flex size-full flex-col">
			<div className="shrink-0">
				<div className="mb-6 flex items-center justify-between">
					<h2 aria-label="Configuration" className="text-base font-semibold text-white" title="Configuration">
						Configuration
					</h2>
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

			<div className="flex flex-col gap-y-4 overflow-y-auto">
				<Connections isLoading={loading.connections} />
				<OrgConnections isLoading={loading.connections} />
				<Triggers isLoading={loading.triggers} />
				<Variables isLoading={loading.variables} />
			</div>
		</div>
	);
};
