import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ConnectionService } from "@services";
import { ModalName } from "@src/enums/components";
import {
	useConnectionStore,
	useGlobalConnectionsStore,
	useModalStore,
	useOrganizationStore,
	useToastStore,
} from "@src/store";
import { Connection } from "@src/types/models";
import { getErrorMessage } from "@src/utilities";

import { Loader, TBody, Table } from "@components/atoms";
import { DeleteGlobalConnectionModal } from "@components/organisms/globalConnections/deleteModal";
import { ConnectionsTableHeader } from "@components/organisms/globalConnections/table/header";
import { ConnectionRow } from "@components/organisms/globalConnections/table/row";

interface GlobalConnectionsListProps {
	isDrawerMode?: boolean;
	onConnectionClick?: (connectionId: string) => void;
}

export const GlobalConnectionsList = ({ isDrawerMode = false, onConnectionClick }: GlobalConnectionsListProps) => {
	const { t } = useTranslation("connections");
	const navigate = useNavigate();

	const { currentOrganization } = useOrganizationStore();
	const { openModal, closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);

	const {
		isLoading,
		fetchGlobalConnections,
		globalConnections,
		setSelectedGlobalConnectionId,
		selectedGlobalConnectionId,
	} = useGlobalConnectionsStore();
	const { setFetchConnectionsCallback, resetChecker, stopCheckingStatus } = useConnectionStore();

	const [isDeletingConnection, setIsDeletingConnection] = useState(false);

	const sortedGlobalConnections = useMemo(() => {
		if (!globalConnections) return [];
		return [...globalConnections].sort((a, b) => a.name.localeCompare(b.name));
	}, [globalConnections]);

	useEffect(() => {
		if (currentOrganization?.id) {
			setFetchConnectionsCallback(() => fetchGlobalConnections(currentOrganization.id));
		}

		return () => {
			resetChecker();
			setFetchConnectionsCallback(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchGlobalConnections(currentOrganization.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id]);

	const handleDeleteConnection = useCallback(
		(id: string, name: string) => {
			openModal(ModalName.deleteGlobalConnection, { id, name });
		},
		[openModal]
	);

	const handleDeleteConnectionAsync = useCallback(async () => {
		const modalData = getModalData<{ id: string; name: string }>(ModalName.deleteGlobalConnection);
		if (!modalData || !currentOrganization?.id) return;

		const { id, name } = modalData;

		setIsDeletingConnection(true);
		stopCheckingStatus(id);
		const { error } = await ConnectionService.delete(id);
		setIsDeletingConnection(false);
		closeModal(ModalName.deleteGlobalConnection);

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

		if (selectedGlobalConnectionId === id) {
			setSelectedGlobalConnectionId(undefined);
			if (!isDrawerMode) {
				navigate("/connections");
			}
		}

		fetchGlobalConnections(currentOrganization.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id, selectedGlobalConnectionId, isDrawerMode]);

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

		if (!sortedGlobalConnections?.length) {
			return <div className="mt-4 text-center text-xl font-semibold">{t("noConnectionsFound")}</div>;
		}

		return (
			<div className={isDrawerMode ? "mt-4 h-full overflow-auto" : "mt-4 h-full"}>
				<Table className="relative w-full overflow-visible">
					<ConnectionsTableHeader />
					<TBody className="max-h-[calc(100vh-200px)] overflow-y-auto">
						{sortedGlobalConnections.map((globalConnection: Connection) => (
							<ConnectionRow
								connection={globalConnection}
								key={globalConnection.connectionId}
								onConfigure={() => handleConfigureConnection(globalConnection.connectionId)}
								onDelete={() =>
									handleDeleteConnection(globalConnection.connectionId, globalConnection.name)
								}
							/>
						))}
					</TBody>
				</Table>
			</div>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, sortedGlobalConnections, isDrawerMode]);

	return (
		<>
			{tableContent}
			<DeleteGlobalConnectionModal isDeleting={isDeletingConnection} onDelete={handleDeleteConnectionAsync} />
		</>
	);
};

GlobalConnectionsList.displayName = "GlobalConnectionsList";
