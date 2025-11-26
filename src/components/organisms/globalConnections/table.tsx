import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { ConnectionService } from "@services";
import { ModalName } from "@src/enums/components";
import { useResize } from "@src/hooks";
import { useGlobalConnectionsStore, useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { cn } from "@src/utilities";

import { Frame, Loader, ResizeButton, TBody, Table } from "@components/atoms";
import { AddButton } from "@components/molecules";
import { DeleteConnectionModal } from "@components/organisms/globalConnections/deleteModal";
import { NoConnectionSelected } from "@components/organisms/globalConnections/notSelected";
import { ConnectionsTableHeader } from "@components/organisms/globalConnections/table/header";
import { ConnectionRow } from "@components/organisms/globalConnections/table/row";

export const GlobalConnectionsTable = () => {
	const { t } = useTranslation("connections");
	const resizeId = useId();
	const navigate = useNavigate();
	const location = useLocation();
	const { id: connectionId } = useParams();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10, id: resizeId });

	const isAddMode = location.pathname === "/connections/new";
	const isEditMode = location.pathname.endsWith("/edit");
	const isFormMode = isAddMode || isEditMode;

	const { currentOrganization } = useOrganizationStore();
	const { openModal, closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);

	const { connections, isLoading, fetchConnections, selectedConnectionId, setSelectedConnectionId } =
		useGlobalConnectionsStore();

	const [isDeletingConnection, setIsDeletingConnection] = useState(false);

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchConnections(currentOrganization.id);
		}
	}, [currentOrganization?.id, fetchConnections]);

	useEffect(() => {
		if (connectionId && !isFormMode) {
			setSelectedConnectionId(connectionId);
		} else if (!connectionId) {
			setSelectedConnectionId(undefined);
		}
	}, [connectionId, isFormMode, setSelectedConnectionId]);

	// const handleConnectionClick = useCallback(
	// 	(id: string) => {
	// 		navigate(`/connections/${id}`);
	// 		setSelectedConnectionId(id);
	// 	},
	// 	[navigate, setSelectedConnectionId]
	// );

	const handleAddConnection = useCallback(() => {
		navigate("/connections/new");
	}, [navigate]);

	const handleDeleteConnection = useCallback(
		(id: string) => {
			openModal(ModalName.deleteConnection, id);
		},
		[openModal]
	);

	const handleDeleteConnectionAsync = useCallback(async () => {
		const modalData = getModalData<string>(ModalName.deleteConnection);
		if (!modalData || !currentOrganization?.id) return;

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
			message: t("connectionDeleteSuccess"),
			type: "success",
		});

		if (selectedConnectionId === modalData) {
			setSelectedConnectionId(undefined);
			navigate("/connections");
		}

		fetchConnections(currentOrganization.id, true);
	}, [
		getModalData,
		currentOrganization?.id,
		closeModal,
		addToast,
		t,
		selectedConnectionId,
		setSelectedConnectionId,
		navigate,
		fetchConnections,
	]);

	const handleConfigureConnection = useCallback(
		(id: string) => {
			navigate(`/connections/${id}/edit`);
		},
		[navigate]
	);

	const frameClass = useMemo(() => cn("size-full rounded-r-none bg-gray-1100 pb-3 pl-7 transition-all"), []);

	const tableContent = useMemo(() => {
		if (isLoading) {
			return <Loader isCenter size="xl" />;
		}

		if (!connections?.length) {
			return <div className="mt-4 text-center text-xl font-semibold">{t("noConnectionsFound")}</div>;
		}

		return (
			<div className="mt-4 h-full">
				<Table className="relative w-full overflow-visible">
					<ConnectionsTableHeader />
					<TBody className="max-h-[calc(100vh-200px)] overflow-y-auto">
						{connections.map((connection) => (
							<ConnectionRow
								connection={connection}
								key={connection.connectionId}
								onConfigure={() => handleConfigureConnection(connection.connectionId)}
								onDelete={() => handleDeleteConnection(connection.connectionId)}
							/>
						))}
					</TBody>
				</Table>
			</div>
		);
	}, [isLoading, connections, t]);
	const deleteConnectionId = getModalData<string>(ModalName.deleteConnection);

	const renderRightPanel = () => {
		if (isFormMode) {
			return (
				<Frame className="overflow-y-auto overflow-x-hidden rounded-l-none px-12 py-10">
					<Outlet />
				</Frame>
			);
		}

		return <NoConnectionSelected />;
	};

	return (
		<div className="flex size-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex w-full items-center justify-end">
						<AddButton
							addButtonLabel="Add"
							isLoading={isLoading}
							onAdd={handleAddConnection}
							title="Connection"
						/>
					</div>
					{tableContent}
				</Frame>
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeId} />

			<div className="flex rounded-2xl bg-black" style={{ width: `${100 - leftSideWidth}%` }}>
				{renderRightPanel()}
			</div>
			<DeleteConnectionModal
				id={deleteConnectionId || ""}
				isDeleting={isDeletingConnection}
				onDelete={handleDeleteConnectionAsync}
			/>
		</div>
	);
};
