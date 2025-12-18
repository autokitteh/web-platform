import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { ModalName, Integrations } from "@enums/components";
import { ConnectionItem, ConnectionsProps, ProjectSettingsItemAction } from "@interfaces/components";
import { ConnectionService } from "@services";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import {
	useOrgConnectionsStore,
	useOrganizationStore,
	useSharedBetweenProjectsStore,
	useModalStore,
	useToastStore,
	useConnectionStore,
	useHasActiveDeployments,
} from "@src/store";
import { extractSettingsPath } from "@src/utilities/navigation";

import { ActiveDeploymentWarningModal } from "@components/organisms";
import { ConnectionsSectionList, DeleteConnectionModal } from "@components/organisms/configuration/connections";

import { TrashIcon, SettingsIcon, EventsFlag } from "@assets/image/icons";

export const OrgConnections = ({ isLoading: isLoadingProp }: ConnectionsProps) => {
	const { t } = useTranslation("projectSettingsSidebar", {
		keyPrefix: "orgConnections",
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
	const { orgConnections, fetchOrgConnections, isLoading: isLoadingStore } = useOrgConnectionsStore();
	const { currentOrganization } = useOrganizationStore();
	const { setFetchConnectionsCallback, resetChecker, stopCheckingStatus } = useConnectionStore();
	const hasActiveDeployments = useHasActiveDeployments();

	const [isDeletingConnection, setIsDeletingConnection] = useState(false);
	const [warningModalAction, setWarningModalAction] = useState<"add" | "edit" | "delete">();
	const [warningConnectionId, setWarningConnectionId] = useState<string>("");

	const isLoading = isLoadingProp || isLoadingStore;

	useEffect(() => {
		if (currentOrganization?.id) {
			setFetchConnectionsCallback(() => fetchOrgConnections(currentOrganization.id));
		}

		return () => {
			resetChecker();
			setFetchConnectionsCallback(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id]);

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchOrgConnections(currentOrganization.id);
		}
	}, [currentOrganization?.id, fetchOrgConnections]);

	const handleDeleteConnectionAsync = useCallback(async () => {
		const modalData = getModalData<string>(ModalName.deleteConnection);
		if (!modalData || !currentOrganization?.id) return;

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

		fetchOrgConnections(currentOrganization.id);
	}, [
		getModalData,
		currentOrganization?.id,
		closeModal,
		addToast,
		tConnections,
		fetchOrgConnections,
		stopCheckingStatus,
	]);

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

			navigate(`${basePath}/settings/org-connections/${connectionId}/edit`);
		},
		[hasActiveDeployments, openModal, navigate, basePath]
	);

	const handleAddConnection = useCallback(() => {
		if (hasActiveDeployments) {
			setWarningModalAction("add");
			openModal(ModalName.warningDeploymentActive);
			return;
		}

		navigate(`${basePath}/settings/org-connections/new`);
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
		navigate(`${basePath}/settings/org-connections/new`);
	}, [closeModal, navigate, basePath]);

	const proceedWithEdit = useCallback(
		(connectionId: string) => {
			closeModal(ModalName.warningDeploymentActive);
			navigate(`${basePath}/settings/org-connections/${connectionId}/edit`);
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

	const items: ConnectionItem[] = (orgConnections || []).map((connection) => ({
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
				emptyStateMessage={t("noOrgConnectionsFound")}
				id="project-org-connections"
				isLoading={isLoading}
				isOpen={isOpen}
				isOrgConnection
				items={items}
				onAdd={handleAddConnection}
				onToggle={handleToggle}
				title={t("title")}
			/>
			<DeleteConnectionModal
				id={connectionId || ""}
				isDeleting={isDeletingConnection}
				isOrgConnection
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
