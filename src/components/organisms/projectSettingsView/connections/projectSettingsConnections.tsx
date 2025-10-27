import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsItemList, ProjectSettingsItem, ProjectSettingsItemAction } from "../projectSettingsItemList";
import { ModalName } from "@enums/components";
import { useModalStore, useCacheStore, useSharedBetweenProjectsStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";

import { ConnectionUnplugIcon } from "@assets/image/icons";

interface ProjectSettingsConnectionsProps {
	onOperation?: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
}

export const ProjectSettingsConnections = ({ onOperation, validation }: ProjectSettingsConnectionsProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "connections" });
	const connections = useCacheStore((state) => state.connections);
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { openModal } = useModalStore();
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();

	const accordionKey = "connections";
	const isOpen = projectSettingsAccordionState[projectId || ""]?.[accordionKey] || false;

	const handleToggle = useCallback(
		(isOpen: boolean) => {
			if (projectId) {
				setProjectSettingsAccordionState(projectId, accordionKey, isOpen);
			}
		},
		[projectId, setProjectSettingsAccordionState, accordionKey]
	);

	const handleDeleteConnection = useCallback(
		(connectionId: string) => {
			if (onOperation) {
				onOperation("connection", "delete", connectionId);
			} else {
				openModal(ModalName.deleteConnection, connectionId);
			}
		},
		[onOperation, openModal]
	);

	const handleEditConnection = useCallback(
		(connectionId: string) => {
			if (onOperation) {
				onOperation("connection", "edit", connectionId);
			} else {
				navigate(`/projects/${projectId}/connections/${connectionId}/edit`);
			}
		},
		[onOperation, projectId, navigate]
	);

	const handleAddConnection = useCallback(() => {
		if (onOperation) {
			onOperation("connection", "add");
		} else {
			navigate(`/projects/${projectId}/connections/add`);
		}
	}, [onOperation, projectId, navigate]);

	const items: ProjectSettingsItem[] = (connections || []).map((connection) => ({
		id: connection.connectionId,
		name: connection.name || connection.integrationId || "",
		subtitle: connection.statusInfoMessage,
		icon: connection.logo,
		status: connection.status === "ok" ? "ok" : "error",
	}));

	const actions: ProjectSettingsItemAction[] = [
		{
			type: "edit",
			label: t("actions.edit"),
			onClick: handleEditConnection,
		},
		{
			type: "delete",
			label: t("actions.delete"),
			onClick: handleDeleteConnection,
		},
	];

	return (
		<ProjectSettingsItemList
			accordionKey={accordionKey}
			actions={actions}
			addButtonLabel="Add"
			closeIcon={ConnectionUnplugIcon}
			emptyStateMessage={t("noConnectionsFound")}
			isOpen={isOpen}
			items={items}
			onAdd={handleAddConnection}
			onToggle={handleToggle}
			openIcon={ConnectionUnplugIcon}
			title={t("title")}
			validation={validation}
		/>
	);
};
