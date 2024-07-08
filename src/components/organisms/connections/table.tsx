import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { baseUrl } from "@constants";
import { ModalName } from "@enums/components";
import { useSort } from "@hooks";
import { ConnectionService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { Connection } from "@type/models";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { ConnectionTableStatus, SortButton } from "@components/molecules";
import { DeleteConnectionModal } from "@components/organisms/connections";

import { PlusCircle } from "@assets/image";
import { LinkIcon, TrashIcon } from "@assets/image/icons";

export const ConnectionsTable = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "connections" });
	const { closeModal, openModal } = useModalStore();
	const { projectId } = useParams();

	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingDeleteConnection, setIsLoadingDeleteConnection] = useState(false);
	const [connections, setConnections] = useState<Connection[]>([]);
	const [connectionId, setConnectionId] = useState<string>();

	const addToast = useToastStore((state) => state.addToast);
	const { items: sortedConnections, requestSort, sortConfig } = useSort<Connection>(connections, "name");

	const fetchConnections = async () => {
		setIsLoading(true);
		try {
			const { data: connections, error } = await ConnectionService.listByProjectId(projectId!);
			if (error) {
				throw error;
			}
			if (!connections) {
				return;
			}

			setConnections(connections);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
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
		if (!connectionId) {
			return;
		}
		setIsLoadingDeleteConnection(true);
		const { error } = await ConnectionService.delete(connectionId);
		setIsLoadingDeleteConnection(false);
		closeModal(ModalName.deleteConnection);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("connectionRemoveFailed"),
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
		<Loader isCenter size="xl" />
	) : (
		<>
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>

				<Button className="group w-auto gap-1 p-0 font-semibold capitalize text-gray-300 hover:text-white" onClick={() => navigate("add")}>
					<PlusCircle className="h-5 w-5 stroke-gray-300 duration-300 group-hover:stroke-white" />

					{t("buttons.addNew")}
				</Button>
			</div>
			{connections.length ? (
				<Table className="mt-3">
					<THead>
						<Tr>
							<Th className="group cursor-pointer font-normal" onClick={() => requestSort("name")}>
								{t("table.columns.name")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="group cursor-pointer font-normal" onClick={() => requestSort("integrationName")}>
								{t("table.columns.app")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"integrationName" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="group max-w-32 cursor-pointer font-normal" onClick={() => requestSort("status")}>
								{t("table.columns.status")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"status" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="group cursor-pointer font-normal">{t("table.columns.information")}</Th>

							<Th className="max-w-20 text-right font-normal">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedConnections.map(({ connectionId, initUrl, integrationName, name, status, statusInfoMessage }) => (
							<Tr className="group" key={connectionId}>
								<Td className="font-semibold">{name}</Td>

								<Td>{integrationName}</Td>

								<Td className="max-w-32">
									<ConnectionTableStatus status={status} />
								</Td>

								<Td>{statusInfoMessage}</Td>

								<Td className="max-w-20 pr-0">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.titleInitConnection")}
											className="p-1.5"
											onClick={() => handleConnectionInitClick(initUrl)}
											title={t("table.buttons.titleInitConnection")}
										>
											<LinkIcon className="h-4 w-4 fill-white" />
										</IconButton>

										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteConnection", { name })}
											onClick={() => handleOpenModalDeleteConnection(connectionId)}
											title={t("table.buttons.titleRemoveConnection")}
										>
											<TrashIcon className="h-3 w-3 fill-white" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-center text-xl font-semibold text-gray-300">{t("titleNoAvailable")}</div>
			)}
			{connectionId ? <DeleteConnectionModal connectionId={connectionId} loading={isLoadingDeleteConnection} onDelete={handleDeleteConnection} /> : null}
		</>
	);
};
