import React, { useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Integrations } from "@enums/components";
import { ConnectionItem, ConnectionsProps } from "@interfaces/components";
import { useGlobalConnectionsStore, useOrganizationStore, useSharedBetweenProjectsStore } from "@src/store";

import { ConnectionsSectionList } from "@components/organisms/configuration/connections";

export const OrgConnections = ({ isLoading: isLoadingProp }: ConnectionsProps) => {
	const { t } = useTranslation("project-configuration-view", {
		keyPrefix: "orgConnections",
	});
	const { projectId } = useParams();
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const { globalConnections, fetchGlobalConnections, isLoading: isLoadingStore } = useGlobalConnectionsStore();
	const { currentOrganization } = useOrganizationStore();

	const isLoading = isLoadingProp || isLoadingStore;

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchGlobalConnections(currentOrganization.id);
		}
	}, [currentOrganization?.id, fetchGlobalConnections]);

	const accordionKey = "orgConnections";
	const isOpen = projectSettingsAccordionState[projectId || ""]?.[accordionKey] || false;

	const handleToggle = useCallback(
		(isOpen: boolean) => {
			if (projectId) {
				setProjectSettingsAccordionState(projectId, accordionKey, isOpen);
			}
		},
		[projectId, setProjectSettingsAccordionState]
	);

	const items: ConnectionItem[] = (globalConnections || []).map((connection) => ({
		id: connection.connectionId,
		name: connection.name || connection.integrationId || "",
		statusInfoMessage: connection.statusInfoMessage,
		status: connection.status,
		icon: connection.logo,
		integration: connection.integrationUniqueName as (typeof Integrations)[keyof typeof Integrations],
	}));

	return (
		<div className="flex w-full items-start rounded-lg transition-all duration-300">
			<ConnectionsSectionList
				accordionKey={accordionKey}
				emptyStateMessage={t("noOrgConnectionsFound")}
				id="project-org-connections"
				isLoading={isLoading}
				isOpen={isOpen}
				isOrgConnection
				items={items}
				onToggle={handleToggle}
				title={t("title")}
			/>
		</div>
	);
};
