import React, { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ConfigurationSectionList, ProjectSettingsItem, ProjectSettingsItemAction } from "../configurationSectionList";
import { DeleteConnectionModal } from "./deleteModal";
import { ModalName } from "@enums/components";
import { ConnectionService } from "@services";
import { tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useModalStore, useCacheStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";

import { TrashIcon, SettingsBoltIcon, EventsFlag } from "@assets/image/icons";

interface ConnectionsProps {
	onOperation: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	isLoading?: boolean;
}

export const Connections = ({ onOperation, validation, isLoading }: ConnectionsProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "connections" });
	const { t: tConnections } = useTranslation("tabs", { keyPrefix: "connections" });
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { openModal, closeModal, getModalData } = useModalStore();
	const {
		projectSettingsAccordionState,
		setProjectSettingsAccordionState,
		setShouldReopenProjectSettingsAfterEvents,
	} = useSharedBetweenProjectsStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchConnections, connections } = useCacheStore();

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

	const handleConfigureConnection = (connectionId: string) => {
		navigate(`/projects/${projectId}/explorer/settings/connections/${connectionId}/edit`);
	};

	const handleAddConnection = () => {
		navigate(`connections/new`);
	};

	const handleShowEvents = useCallback(
		(connectionId: string) => {
			if (!projectId) return;

			setShouldReopenProjectSettingsAfterEvents(projectId, true);
			triggerEvent(EventListenerName.displayProjectEventsSidebar, { connectionId });
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId]
	);

	const items: ProjectSettingsItem[] = (connections || []).map((connection) => ({
		id: connection.connectionId,
		name: connection.name || connection.integrationId || "",
		errorMessage: connection.status === "ok" ? undefined : connection.statusInfoMessage,
		icon: connection.logo,
	}));

	const actions: ProjectSettingsItemAction = {
		configure: {
			ariaLabel: t("actions.configure"),
			icon: SettingsBoltIcon,
			label: t("actions.configure"),
			onClick: handleConfigureConnection,
		},
		custom: {
			ariaLabel: t("actions.showEvents"),
			icon: EventsFlag,
			label: t("actions.showEvents"),
			onClick: handleShowEvents,
		},
		delete: {
			ariaLabel: t("actions.delete"),
			icon: TrashIcon,
			label: t("actions.delete"),
			onClick: handleDeleteConnection,
		},
	};

	const connectionId = getModalData<string>(ModalName.deleteConnection);

	return (
		<>
			<ConfigurationSectionList
				accordionKey={accordionKey}
				actions={actions}
				addButtonLabel="Add"
				emptyStateMessage={t("noConnectionsFound")}
				id={tourStepsHTMLIds.projectConnections}
				isLoading={isLoading}
				isOpen={isOpen}
				items={items}
				onAdd={handleAddConnection}
				onToggle={handleToggle}
				section="connections"
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
