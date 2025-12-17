import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ConnectionService } from "@services";
import { ModalName } from "@src/enums/components";
import {
	useConnectionStore,
	useOrgConnectionsStore,
	useModalStore,
	useOrganizationStore,
	useToastStore,
} from "@src/store";
import { Connection } from "@src/types/models";
import { getErrorMessage } from "@src/utilities";

import { Loader, TBody, Table } from "@components/atoms";
import { DeleteOrgConnectionModal } from "@components/organisms/orgConnections/deleteModal";
import { ConnectionsTableHeader } from "@components/organisms/orgConnections/table/header";
import { ConnectionRow } from "@components/organisms/orgConnections/table/row";

interface OrgConnectionsListProps {
	isDrawerMode?: boolean;
	onConnectionClick?: (connectionId: string) => void;
}

export const OrgConnectionsList = ({ isDrawerMode = false, onConnectionClick }: OrgConnectionsListProps) => {
	const { t } = useTranslation("connections");
	const navigate = useNavigate();

	const { currentOrganization } = useOrganizationStore();
	const { openModal, closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);

	const { isLoading, fetchOrgConnections, orgConnections, setSelectedOrgConnectionId, selectedOrgConnectionId } =
		useOrgConnectionsStore();
	const { setFetchConnectionsCallback, resetChecker, stopCheckingStatus } = useConnectionStore();

	const [isDeletingConnection, setIsDeletingConnection] = useState(false);

	const sortedOrgConnections = useMemo(() => {
		if (!orgConnections) return [];
		return [...orgConnections].sort((a, b) => a.name.localeCompare(b.name));
	}, [orgConnections]);

	useEffect(() => {
		if (currentOrganization?.id) {
			setFetchConnectionsCallback(() => fetchOrgConnections(currentOrganization.id));
		}

		return () => {
			resetChecker();
			setFetchConnectionsCallback(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchOrgConnections(currentOrganization.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id]);

	const handleDeleteConnection = useCallback(
		(id: string, name: string) => {
			openModal(ModalName.deleteOrgConnection, { id, name });
		},
		[openModal]
	);

	const handleDeleteConnectionAsync = useCallback(async () => {
		const modalData = getModalData<{ id: string; name: string }>(ModalName.deleteOrgConnection);
		if (!modalData || !currentOrganization?.id) return;

		const { id, name } = modalData;

		setIsDeletingConnection(true);
		stopCheckingStatus(id);
		const { error } = await ConnectionService.delete(id);
		setIsDeletingConnection(false);
		closeModal(ModalName.deleteOrgConnection);

		if (error) {
			return addToast({
				message: getErrorMessage(error),
				type: "error",
			});
		}

		addToast({
			message: t("connectionDeleteSuccessWithName", { connectionName: name }),
			type: "success",
		});

		const currentPath = window.location.pathname;
		const isViewingDeletedConnection = currentPath.includes(`/connections/${id}/edit`);

		if (selectedOrgConnectionId === id) {
			setSelectedOrgConnectionId(undefined);
		}

		if (!isDrawerMode && (selectedOrgConnectionId === id || isViewingDeletedConnection)) {
			navigate("/connections");
		}

		fetchOrgConnections(currentOrganization.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id, selectedOrgConnectionId, isDrawerMode]);

	const handleConfigureConnection = useCallback(
		(id: string) => {
			if (isDrawerMode && onConnectionClick) {
				onConnectionClick(id);
			} else {
				navigate(`/connections/${id}/edit`);
			}
		},
		[isDrawerMode, onConnectionClick, navigate]
	);

	const tableContent = useMemo(() => {
		if (isLoading) {
			return <Loader isCenter size="xl" />;
		}

		if (!sortedOrgConnections?.length) {
			return <div className="mt-4 text-center text-xl font-semibold">{t("noConnectionsFound")}</div>;
		}

		return (
			<div className={isDrawerMode ? "mt-4 h-full overflow-auto" : "mt-4 h-full"}>
				<Table className="relative w-full overflow-visible">
					<ConnectionsTableHeader />
					<TBody className="max-h-[calc(100vh-200px)] overflow-y-auto">
						{sortedOrgConnections.map((orgConnection: Connection) => (
							<ConnectionRow
								connection={orgConnection}
								key={orgConnection.connectionId}
								onConfigure={() => handleConfigureConnection(orgConnection.connectionId)}
								onDelete={() => handleDeleteConnection(orgConnection.connectionId, orgConnection.name)}
							/>
						))}
					</TBody>
				</Table>
			</div>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, sortedOrgConnections, isDrawerMode]);

	return (
		<>
			{tableContent}
			<DeleteOrgConnectionModal isDeleting={isDeletingConnection} onDelete={handleDeleteConnectionAsync} />
		</>
	);
};

OrgConnectionsList.displayName = "OrgConnectionsList";
