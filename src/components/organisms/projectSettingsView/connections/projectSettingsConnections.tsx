import React, { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsItemList, ProjectSettingsItem, ProjectSettingsItemAction } from "../projectSettingsItemList";
import { ModalName } from "@enums/components";
import { ConnectionService } from "@services";
import { useModalStore, useCacheStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";

import { DeleteConnectionModal } from "@components/organisms/connections/deleteModal";

interface ProjectSettingsConnectionsProps {
	onOperation: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
}

export const ProjectSettingsConnections = ({ onOperation, validation }: ProjectSettingsConnectionsProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "connections" });
	const { t: tConnections } = useTranslation("tabs", { keyPrefix: "connections" });
	const connections = useCacheStore((state) => state.connections);
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { openModal, closeModal, getModalData } = useModalStore();
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchConnections } = useCacheStore();

	const [isDeletingConnection, setIsDeletingConnection] = useState(false);

	const handleDeleteConnectionAsync = useCallback(async () => {
		const modalData = getModalData<string>(ModalName.deleteConnection);
		if (!modalData || !projectId) return;

		setIsDeletingConnection(true);
		const { error } = await ConnectionService.delete(modalData);
		setIsDeletingConnection(false);
		closeModal(ModalName.deleteConnection);

		if (error) {
			return addToast({
				message: (error as Error).message,
				type: "error",
			});
		}

		addToast({
			message: tConnections("connectionRemoveSuccess", { connectionName: modalData }),
			type: "success",
		});

		fetchConnections(projectId, true);
	}, [getModalData, projectId, closeModal, addToast, tConnections, fetchConnections]);

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
			onOperation("connection", "delete", connectionId);
			openModal(ModalName.deleteConnection, connectionId);
		},
		[onOperation, openModal]
	);

	const handleEditConnection = (connectionId: string) => {
		navigate(`connections/${connectionId}/edit`);
	};

	const handleAddConnection = () => {
		navigate(`connections/new`);
	};

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

	const connectionId = getModalData<string>(ModalName.deleteConnection);

	return (
		<>
			<ProjectSettingsItemList
				accordionKey={accordionKey}
				actions={actions}
				addButtonLabel="Add"
				emptyStateMessage={t("noConnectionsFound")}
				isOpen={isOpen}
				items={items}
				onAdd={handleAddConnection}
				onToggle={handleToggle}
				title={t("title")}
				validation={validation}
			/>
			<DeleteConnectionModal
				id={connectionId || ""}
				isDeleting={isDeletingConnection}
				onDelete={handleDeleteConnectionAsync}
			/>
		</>
	);
};
