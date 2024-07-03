import React, { useEffect, useCallback, useState } from "react";
import { PlusCircle } from "@assets/image";
import { TrashIcon, LinkIcon } from "@assets/image/icons";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Loader } from "@components/atoms";
import { SortButton, ConnectionTableStatus } from "@components/molecules";
import { DeleteConnectionModal } from "@components/organisms/connections";
import { baseUrl } from "@constants";
import { ModalName } from "@enums/components";
import { useSort } from "@hooks";
import { ConnectionService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { Connection } from "@type/models";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const ConnectionsTable = () => {
	const { t: tError } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "connections" });
	const { openModal, closeModal } = useModalStore();
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation(["errors"]);

	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingDeleteConnection, setIsLoadingDeleteConnection] = useState(false);
	const [connections, setConnections] = useState<Connection[]>([]);
	const [connectionId, setConnectionId] = useState<string>();

	const addToast = useToastStore((state) => state.addToast);
	const { items: sortedConnections, sortConfig, requestSort } = useSort<Connection>(connections, "name");

	const fetchConnections = async () => {
		setIsLoading(true);
		try {
			const { data: connections, error } = await ConnectionService.listByProjectId(projectId!);
			if (error) throw error;
			if (!connections) return;

			setConnections(connections);
		} catch (err) {
			addToast({
				id: Date.now().toString(),
				message: (err as Error).message,
				title: tErrors("error"),
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchConnections();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleOpenModalDeleteConnection = useCallback(
		(connectionId: string) => {
			setConnectionId(connectionId);
			openModal(ModalName.deleteConnection);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[connectionId]
	);

	const handleDeleteConnection = async () => {
		if (!connectionId) return;
		setIsLoadingDeleteConnection(true);
		const { error } = await ConnectionService.delete(connectionId);
		setIsLoadingDeleteConnection(false);
		closeModal(ModalName.deleteConnection);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tError("connectionRemoveFailed"),
				title: tErrors("error"),
				type: "error",
			});

			return;
		}
		fetchConnections();
	};

	const handleConnectionInitClick = useCallback((url: string) => {
		window.open(`${baseUrl}/${url}`, "_blank");
	}, []);

	return isLoading ? (
		<div className="flex flex-col justify-center h-full">
			<Loader />
		</div>
	) : (
		<>
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button
					className="w-auto gap-1 p-0 font-semibold text-gray-300 capitalize group hover:text-white"
					onClick={() => navigate("add")}
				>
					<PlusCircle className="w-5 h-5 duration-300 stroke-gray-300 group-hover:stroke-white" />
					{t("buttons.addNew")}
				</Button>
			</div>
			{connections.length ? (
				<Table className="mt-3">
					<THead>
						<Tr>
							<Th className="font-normal cursor-pointer group" onClick={() => requestSort("name")}>
								{t("table.columns.name")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group" onClick={() => requestSort("integrationName")}>
								{t("table.columns.app")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"integrationName" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group max-w-32" onClick={() => requestSort("status")}>
								{t("table.columns.status")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"status" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group">{t("table.columns.information")}</Th>
							<Th className="font-normal text-right max-w-20">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>
					<TBody>
						{sortedConnections.map(({ name, integrationName, status, statusInfoMessage, connectionId, initUrl }) => (
							<Tr className="group" key={connectionId}>
								<Td className="font-semibold">{name}</Td>
								<Td>{integrationName}</Td>
								<Td className="max-w-32">
									<ConnectionTableStatus status={status} />
								</Td>
								<Td>{statusInfoMessage}</Td>
								<Td className="pr-0 max-w-20">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.titleInitConnection")}
											className="p-1.5"
											onClick={() => handleConnectionInitClick(initUrl)}
											title={t("table.buttons.titleInitConnection")}
										>
											<LinkIcon className="w-4 h-4 fill-white" />
										</IconButton>
										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteConnection", { name })}
											onClick={() => handleOpenModalDeleteConnection(connectionId)}
											title={t("table.buttons.titleRemoveConnection")}
										>
											<TrashIcon className="w-3 h-3 fill-white" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-xl font-semibold text-center text-gray-300">{t("titleNoAvailable")}</div>
			)}
			{connectionId ? (
				<DeleteConnectionModal
					connectionId={connectionId}
					loading={isLoadingDeleteConnection}
					onDelete={handleDeleteConnection}
				/>
			) : null}
		</>
	);
};
