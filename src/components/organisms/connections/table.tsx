import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { ConnectionService } from "@services";
import { Connection } from "@type/models";

import { useSort } from "@hooks";
import { useConnectionCheckerStore, useModalStore, useProjectValidationStore, useToastStore } from "@store";

import { Button, IconButton, IconSvg, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { ConnectionTableStatus, SortButton } from "@components/molecules";
import { DeleteConnectionModal } from "@components/organisms/connections";

import { PlusCircle } from "@assets/image";
import { EditIcon, TrashIcon } from "@assets/image/icons";

export const ConnectionsTable = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "connections" });
	const { closeModal, openModal } = useModalStore();
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { checkState } = useProjectValidationStore();

	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingDeleteConnection, setIsLoadingDeleteConnection] = useState(false);
	const [connections, setConnections] = useState<Connection[]>([]);
	const [connectionId, setConnectionId] = useState<string>();

	const addToast = useToastStore((state) => state.addToast);
	const { items: sortedConnections, requestSort, sortConfig } = useSort<Connection>(connections, "name");
	const { resetChecker, setFetchConnectionsCallback } = useConnectionCheckerStore();

	const fetchConnections = useCallback(async () => {
		setIsLoading(true);
		try {
			const { data: connectionsResponse, error } = await ConnectionService.listByProjectId(projectId!);
			if (error) {
				throw error;
			}
			if (!connectionsResponse) {
				return;
			}

			setConnections(connectionsResponse);
			checkState(projectId!, true);
		} catch (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		fetchConnections();
		setFetchConnectionsCallback(fetchConnections);

		return () => {
			resetChecker();
			setFetchConnectionsCallback(null);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleOpenModalDeleteConnection = useCallback(
		(connectionId: string) => {
			setConnectionId(connectionId);
			openModal(ModalName.deleteConnection);
		},
		[openModal]
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
				message: tErrors("connectionRemoveFailed"),
				type: "error",
			});

			return;
		}
		setConnectionId(undefined);

		addToast({
			message: t("connectionRemoveSuccess"),
			type: "success",
		});

		fetchConnections();
	};

	const handleConnectionEditClick = useCallback(
		(connectionId: string) => {
			navigate(`/projects/${projectId}/connections/${connectionId}/edit`);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId]
	);

	return isLoading ? (
		<Loader isCenter size="xl" />
	) : (
		<>
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-500">{t("titleAvailable")}</div>

				<Button
					ariaLabel={t("buttons.addNew")}
					className="group w-auto gap-1 p-0 font-semibold capitalize text-gray-500 hover:text-white"
					onClick={() => navigate("add")}
				>
					<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

					{t("buttons.addNew")}
				</Button>
			</div>
			{connections.length ? (
				<Table className="mt-2.5">
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

							<Th
								className="group cursor-pointer font-normal"
								onClick={() => requestSort("integrationName")}
							>
								{t("table.columns.app")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"integrationName" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th
								className="group max-w-32 cursor-pointer font-normal"
								onClick={() => requestSort("status")}
							>
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
						{sortedConnections.map(
							({ connectionId, integrationName, logo, name, status, statusInfoMessage }) => (
								<Tr className="group" key={connectionId}>
									<Td className="font-semibold">{name}</Td>

									<Td>
										<div className="flex items-center gap-2" title={integrationName}>
											<IconSvg
												alt={integrationName}
												className="size-6 shrink-0 rounded-full bg-white p-0.5"
												src={logo}
											/>

											{integrationName}
										</div>
									</Td>

									<Td className="max-w-32">
										<ConnectionTableStatus status={status} />
									</Td>

									<Td>{statusInfoMessage}</Td>

									<Td className="max-w-20 pr-0">
										<div className="flex space-x-1">
											<IconButton
												ariaLabel={t("table.buttons.titleEditConnection")}
												className="p-1.5"
												onClick={() => handleConnectionEditClick(connectionId)}
												title={t("table.buttons.titleEditConnection")}
											>
												<EditIcon className="size-3 fill-white" />
											</IconButton>

											<IconButton
												ariaLabel={t("table.buttons.titleRemoveConnection", { name })}
												onClick={() => handleOpenModalDeleteConnection(connectionId)}
												title={t("table.buttons.titleRemoveConnection")}
											>
												<TrashIcon className="size-3 fill-white" />
											</IconButton>
										</div>
									</Td>
								</Tr>
							)
						)}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-center text-xl font-semibold text-gray-500">{t("titleNoAvailable")}</div>
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
