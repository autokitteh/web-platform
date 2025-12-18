import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { ModalName, Integrations } from "@enums/components";
import { ConnectionsProps, ConnectionItem, ProjectSettingsItemAction } from "@interfaces/components";
import { ConnectionService } from "@services";
import { tourStepsHTMLIds } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent, useProjectValidationState } from "@src/hooks";
import {
	useModalStore,
	useConnectionStore,
	useCacheStore,
	useSharedBetweenProjectsStore,
	useToastStore,
	useHasActiveDeployments,
} from "@src/store";
import { extractSettingsPath } from "@src/utilities/navigation";

import { ActiveDeploymentWarningModal } from "@components/organisms";
import { ConnectionsSectionList, DeleteConnectionModal } from "@components/organisms/configuration/connections";

import { TrashIcon, SettingsIcon, EventsFlag } from "@assets/image/icons";

export const Connections = ({ isLoading }: ConnectionsProps) => {
	const { t } = useTranslation("projectSettingsSidebar", {
		keyPrefix: "connections",
	});
	const { t: tConnections } = useTranslation("tabs", {
		keyPrefix: "connections",
	});
	const navigate = useNavigate();
	const location = useLocation();
	const { basePath } = extractSettingsPath(location.pathname);
	const { projectId } = useParams();
	const { openModal, closeModal, getModalData } = useModalStore();
	const { projectSettingsAccordionState, setProjectSettingsAccordionState } = useSharedBetweenProjectsStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchConnections, connections } = useCacheStore();

	const { setFetchConnectionsCallback, resetChecker, stopCheckingStatus } = useConnectionStore();
	const hasActiveDeployments = useHasActiveDeployments();

	const [isDeletingConnection, setIsDeletingConnection] = useState(false);
	const [warningModalAction, setWarningModalAction] = useState<"add" | "edit" | "delete">();
	const [warningConnectionId, setWarningConnectionId] = useState<string>("");
	const connectionsValidationStatus = useProjectValidationState("connections");

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
		stopCheckingStatus(modalData);

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
			message: tConnections("connectionRemoveSuccess", {
				connectionName: modalData,
			}),
			type: "success",
		});

		fetchConnections(projectId, true);
	}, [getModalData, projectId, closeModal, addToast, tConnections, fetchConnections, stopCheckingStatus]);

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
			if (hasActiveDeployments) {
				setWarningConnectionId(connectionId);
				setWarningModalAction("delete");
				openModal(ModalName.warningDeploymentActive);
				return;
			}

			openModal(ModalName.deleteConnection, connectionId);
		},
		[hasActiveDeployments, openModal]
	);

	const handleConfigureConnection = useCallback(
		(connectionId: string) => {
			if (hasActiveDeployments) {
				setWarningConnectionId(connectionId);
				setWarningModalAction("edit");
				openModal(ModalName.warningDeploymentActive);
				return;
			}

			navigate(`${basePath}/settings/connections/${connectionId}/edit`);
		},
		[hasActiveDeployments, openModal, navigate, basePath]
	);

	const handleAddConnection = useCallback(() => {
		if (hasActiveDeployments) {
			setWarningModalAction("add");
			openModal(ModalName.warningDeploymentActive);
			return;
		}

		navigate(`${basePath}/settings/connections/new`);
	}, [hasActiveDeployments, openModal, navigate, basePath]);

	const handleShowEvents = useCallback(
		(connectionId: string) => {
			if (!projectId) return;

			triggerEvent(EventListenerName.displayProjectEventsSidebar, {
				connectionId,
			});
		},

		[projectId]
	);

	const proceedWithAdd = useCallback(() => {
		closeModal(ModalName.warningDeploymentActive);
		navigate(`${basePath}/settings/connections/new`);
	}, [closeModal, navigate, basePath]);

	const proceedWithEdit = useCallback(
		(connectionId: string) => {
			closeModal(ModalName.warningDeploymentActive);
			navigate(`${basePath}/settings/connections/${connectionId}/edit`);
		},
		[closeModal, navigate, basePath]
	);

	const proceedWithDelete = useCallback(
		(connectionId: string) => {
			closeModal(ModalName.warningDeploymentActive);
			openModal(ModalName.deleteConnection, connectionId);
		},
		[closeModal, openModal]
	);

	const items: ConnectionItem[] = (connections || []).map((connection) => ({
		id: connection.connectionId,
		name: connection.name || connection.integrationId || "",
		statusInfoMessage: connection.statusInfoMessage,
		status: connection.status,
		icon: connection.logo,
		integration: connection.integrationUniqueName as (typeof Integrations)[keyof typeof Integrations],
	}));

	const actions: ProjectSettingsItemAction = useMemo(
		() => ({
			configure: {
				ariaLabel: t("actions.configure"),
				icon: SettingsIcon,
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
		}),
		[t, handleConfigureConnection, handleShowEvents, handleDeleteConnection]
	);

	const connectionId = getModalData<string>(ModalName.deleteConnection);

	return (
		<div className="flex w-full items-start rounded-lg transition-all duration-300">
			<ConnectionsSectionList
				accordionKey={accordionKey}
				actions={actions}
				addButtonLabel="Add"
				emptyStateMessage={t("noConnectionsFound")}
				frontendValidationStatus={connectionsValidationStatus}
				id={tourStepsHTMLIds.projectConnections}
				isLoading={isLoading}
				isOpen={isOpen}
				items={items}
				onAdd={handleAddConnection}
				onToggle={handleToggle}
				title={t("title")}
			/>
			<DeleteConnectionModal
				id={connectionId || ""}
				isDeleting={isDeletingConnection}
				onDelete={handleDeleteConnectionAsync}
			/>
			<ActiveDeploymentWarningModal
				action={warningModalAction === "delete" ? "edit" : warningModalAction}
				goToAdd={proceedWithAdd}
				goToEdit={warningModalAction === "delete" ? proceedWithDelete : proceedWithEdit}
				modifiedId={warningConnectionId}
			/>
		</div>
	);
};
