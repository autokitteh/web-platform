import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ConnectionsSectionList } from "../connectionsSectionList";
import { DeleteConnectionModal } from "./deleteModal";
import { ModalName, Integrations } from "@enums/components";
import { ConnectionsProps, ConnectionItem, ProjectSettingsItemAction } from "@interfaces/components";
import { ConnectionService } from "@services";
import { tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import {
	useModalStore,
	useConnectionStore,
	useCacheStore,
	useSharedBetweenProjectsStore,
	useToastStore,
} from "@src/store";

import { TrashIcon, SettingsBoltIcon, EventsFlag } from "@assets/image/icons";

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

	const { setFetchConnectionsCallback, resetChecker } = useConnectionStore();

	const [isDeletingConnection, setIsDeletingConnection] = useState(false);

	useEffect(() => {
		setFetchConnectionsCallback(() => fetchConnections(projectId!, true));

		return () => {
			resetChecker();
			setFetchConnectionsCallback(null);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const items: ConnectionItem[] = (connections || []).map((connection) => ({
		id: connection.connectionId,
		name: connection.name || connection.integrationId || "",
		errorMessage: connection.status === "ok" ? undefined : connection.statusInfoMessage,
		icon: connection.logo,
		integration: connection.integrationUniqueName as (typeof Integrations)[keyof typeof Integrations],
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
			<ConnectionsSectionList
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
